import os
import base64
import logging
from datetime import datetime
from email.utils import parsedate_to_datetime
from typing import Optional, Dict, Any, List

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

from backend.core.config import settings
from backend.core.encryption import decrypt_dict, encrypt_dict
from backend.db.mongodb import db
from backend.services.order_parsers import RETAILER_PARSERS
from backend.services.gmail_parsers import CromaParser, RelianceDigitalParser, GenericOrderParser

logger = logging.getLogger(__name__)

ALL_PARSERS = [
    *RETAILER_PARSERS,
    CromaParser,
    RelianceDigitalParser,
    GenericOrderParser,
]

GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
]

def extract_body_parts(payload: Dict[str, Any]) -> tuple[str, str]:
    """
    Recursively extracts text/plain and text/html bodies from a Gmail message payload.
    """
    body_text = ""
    body_html = ""

    mime_type = payload.get("mimeType", "")
    body_data = payload.get("body", {}).get("data", "")

    if body_data:
        try:
            decoded = base64.urlsafe_b64decode(body_data).decode("utf-8", errors="replace")
            if "html" in mime_type:
                body_html += decoded
            else:
                body_text += decoded
        except Exception:
            pass

    parts = payload.get("parts", [])
    for part in parts:
        pt, ph = extract_body_parts(part)
        body_text += " " + pt
        body_html += " " + ph

    return body_text.strip(), body_html.strip()

async def get_decrypted_credentials(user_id: str) -> Optional[Credentials]:
    """
    Retrieves and decrypts Google OAuth credentials for the user, refreshing if expired.
    Never exposes raw tokens in logs or errors.
    """
    if db.db is None:
        return None

    conn = await db.db["gmail_connections"].find_one({"user_id": user_id, "is_active": True})
    if not conn:
        conn = await db.db["gmail_connections"].find_one({"user_id": user_id})
    
    if not conn:
        return None

    encrypted_tokens = conn.get("encrypted_tokens") or conn.get("encrypted_refresh_token")
    if not encrypted_tokens:
        return None

    try:
        if isinstance(encrypted_tokens, str):
            tokens_data = decrypt_dict(encrypted_tokens)
        else:
            tokens_data = encrypted_tokens

        refresh_token = tokens_data.get("refresh_token")
        access_token = tokens_data.get("token") or tokens_data.get("access_token")

        creds = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            scopes=tokens_data.get("scopes") or GMAIL_SCOPES,
        )

        if creds.expired and creds.refresh_token:
            logger.info(f"Refreshing expired Google OAuth access token for user {user_id}")
            creds.refresh(Request())
            tokens_data["token"] = creds.token
            if creds.refresh_token:
                tokens_data["refresh_token"] = creds.refresh_token
            new_enc = encrypt_dict(tokens_data)
            await db.db["gmail_connections"].update_one(
                {"user_id": user_id},
                {"$set": {"encrypted_tokens": new_enc, "encrypted_refresh_token": new_enc, "updated_at": datetime.utcnow()}}
            )

        return creds
    except Exception as e:
        logger.error(f"Error restoring credentials for user {user_id}: {type(e).__name__}")
        return None

async def parse_and_sync_orders(user_id: str, max_results: int = 50) -> Dict[str, Any]:
    """
    Ingests order confirmation emails from Gmail, runs retailer parsers with try/except protection,
    deduplicates against purchase_history by source_email_id, and stores structured records.
    """
    creds = await get_decrypted_credentials(user_id)
    if not creds:
        raise ValueError("Gmail account is not linked or authentication has expired. Please connect Gmail.")

    if db.db is not None:
        await db.db["gmail_connections"].update_one(
            {"user_id": user_id},
            {"$set": {"sync_status": "syncing", "updated_at": datetime.utcnow()}}
        )

    try:
        service = build("gmail", "v1", credentials=creds, cache_discovery=False)

        # Scoped Gmail query for Indian retailer order confirmations
        query = (
            'from:(amazon.in OR flipkart.com OR myntra.com OR meesho.com OR blinkit.com OR croma.com OR reliancedigital.in OR grofers.com) '
            'OR subject:("order confirmed" OR "order placed" OR "shipped" OR "delivered" OR "dispatched" OR "invoice" OR "receipt")'
        )

        response = service.users().messages().list(
            userId="me",
            q=query,
            maxResults=max_results,
        ).execute()

        messages = response.get("messages", [])
        total_found = len(messages)
        imported_count = 0
        updated_count = 0

        for msg_meta in messages:
            msg_id = msg_meta.get("id")
            if not msg_id:
                continue

            try:
                full_msg = service.users().messages().get(userId="me", id=msg_id, format="full").execute()
                headers = full_msg.get("payload", {}).get("headers", [])

                subject = ""
                sender = ""
                date_str = ""

                for h in headers:
                    n = h.get("name", "").lower()
                    if n == "subject":
                        subject = h.get("value", "")
                    elif n == "from":
                        sender = h.get("value", "")
                    elif n == "date":
                        date_str = h.get("value", "")

                snippet = full_msg.get("snippet", "")
                body_text, body_html = extract_body_parts(full_msg.get("payload", {}))

                # Run retailer parsers
                parsed_data = None
                for parser in ALL_PARSERS:
                    try:
                        if parser.matches(sender, subject):
                            parsed_data = parser.parse(
                                msg_id=msg_id,
                                sender=sender,
                                subject=subject,
                                snippet=snippet,
                                body_text=body_text,
                                body_html=body_html,
                                date_str=date_str,
                            )
                            if parsed_data:
                                break
                    except Exception as parser_err:
                        logger.warning(f"Retailer parser '{parser.__name__}' failed on msg {msg_id}: {parser_err}")
                        continue

                if not parsed_data:
                    continue

                # Format order date/time
                order_date = None
                order_time = None
                if date_str:
                    try:
                        dt = parsedate_to_datetime(date_str)
                        order_date = dt.strftime("%Y-%m-%d")
                        order_time = dt.strftime("%H:%M:%S")
                    except Exception:
                        pass
                if not order_date:
                    order_date = datetime.utcnow().strftime("%Y-%m-%d")
                if not order_time:
                    order_time = datetime.utcnow().strftime("%H:%M:%S")

                parsed_data["order_date"] = order_date
                parsed_data["order_time"] = order_time
                now = datetime.utcnow()

                # Deduplicate by source_email_id or user_id + retailer + order_number
                order_number = parsed_data.get("order_number") or parsed_data.get("order_id")
                retailer = parsed_data.get("retailer") or parsed_data.get("platform")

                filter_query: Dict[str, Any] = {"user_id": user_id}
                if order_number:
                    filter_query["$or"] = [
                        {"email_message_id": msg_id},
                        {"source_email_id": msg_id},
                        {"retailer": retailer, "order_number": order_number},
                        {"platform": retailer, "order_id": order_number},
                    ]
                else:
                    filter_query["$or"] = [
                        {"email_message_id": msg_id},
                        {"source_email_id": msg_id},
                    ]

                if db.db is not None:
                    existing = await db.db["shopping_orders"].find_one(filter_query)

                    items_list = parsed_data.get("items") or [{
                        "name": parsed_data.get("product_name", "Purchased Item"),
                        "price": parsed_data.get("amount"),
                        "quantity": 1,
                        "image": parsed_data.get("product_image"),
                    }]

                    doc = {
                        "user_id": user_id,
                        "retailer": retailer,
                        "platform": retailer,
                        "product_name": parsed_data.get("product_name", "Purchased Item"),
                        "product_image": parsed_data.get("product_image"),
                        "order_number": order_number,
                        "order_id": order_number,
                        "items": items_list,
                        "order_date": order_date,
                        "order_time": order_time,
                        "amount": parsed_data.get("amount"),
                        "currency": parsed_data.get("currency", "INR"),
                        "status": parsed_data.get("status", "Order Placed"),
                        "delivered": parsed_data.get("delivered", False),
                        "returned": parsed_data.get("returned", False),
                        "refunded": parsed_data.get("refunded", False),
                        "refund_amount": parsed_data.get("refund_amount"),
                        "source": "gmail",
                        "email_message_id": msg_id,
                        "source_email_id": msg_id,
                        "email_subject": parsed_data.get("email_subject", subject),
                        "updated_at": now,
                    }

                    if existing:
                        await db.db["shopping_orders"].update_one(
                            {"_id": existing["_id"]},
                            {"$set": doc}
                        )
                        updated_count += 1
                    else:
                        doc["created_at"] = now
                        await db.db["shopping_orders"].insert_one(doc)
                        imported_count += 1

            except Exception as single_err:
                logger.warning(f"Error parsing message {msg_id}: {type(single_err).__name__}")
                continue

        now = datetime.utcnow()
        if db.db is not None:
            await db.db["gmail_connections"].update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "last_synced_at": now,
                        "sync_status": "success",
                        "last_error": None,
                        "updated_at": now,
                    }
                }
            )

        return {
            "success": True,
            "message": f"Successfully synced {total_found} order emails: {imported_count} new orders imported, {updated_count} updated.",
            "total_found": total_found,
            "imported": imported_count,
            "updated": updated_count,
            "last_synced_at": now,
        }

    except Exception as e:
        logger.error(f"Gmail sync failed for user {user_id}: {type(e).__name__}")
        if db.db is not None:
            await db.db["gmail_connections"].update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "sync_status": "error",
                        "last_error": str(e),
                        "updated_at": datetime.utcnow(),
                    }
                }
            )
        raise e
