import os
import base64
import json
import logging
import secrets
import urllib.parse
from datetime import datetime
from typing import Optional, Dict, Any, List

# Allow OAuth2 over HTTP for localhost development
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import httpx

from backend.core.config import settings
from backend.core.encryption import encrypt_dict, decrypt_dict
from backend.db.mongodb import db
from backend.services.gmail_parsers import parse_order_email

logger = logging.getLogger(__name__)

# Request only the required readonly Gmail scope
GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
]

def get_authorization_url(user_id: str, frontend_origin: Optional[str] = None) -> str:
    """
    Generates a clean Google OAuth authorization URL for offline access without PKCE verifier mismatch.
    """
    client_id = (settings.GOOGLE_CLIENT_ID or "").strip().strip('"').strip("'")
    redirect_uri = (settings.GOOGLE_REDIRECT_URI or "http://localhost:8000/api/gmail/callback").strip().strip('"').strip("'")

    if not client_id:
        raise ValueError("Google OAuth Client ID must be configured in backend/.env")

    # Securely encode user_id, origin and nonce into state parameter
    state_payload = {
        "user_id": user_id,
        "origin": frontend_origin,
        "nonce": secrets.token_urlsafe(16),
        "ts": int(datetime.utcnow().timestamp()),
    }
    state = base64.urlsafe_b64encode(json.dumps(state_payload).encode()).decode()

    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "https://www.googleapis.com/auth/gmail.readonly",
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
        "include_granted_scopes": "true",
    }
    return f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"

async def handle_oauth_callback(code: str, state: str) -> Dict[str, Any]:
    """
    Exchanges the OAuth code for tokens directly using Google's token endpoint,
    avoiding missing PKCE code_verifier errors, and encrypts credentials into MongoDB.
    """
    try:
        raw_state = base64.urlsafe_b64decode(state.encode()).decode()
        state_data = json.loads(raw_state)
        user_id = state_data.get("user_id")
        origin = state_data.get("origin")
        if not user_id:
            raise ValueError("Invalid OAuth state: missing user_id")
    except Exception as e:
        logger.error(f"State validation error: {e}")
        raise ValueError("Invalid or corrupted OAuth state")

    client_id = (settings.GOOGLE_CLIENT_ID or "").strip().strip('"').strip("'")
    client_secret = (settings.GOOGLE_CLIENT_SECRET or "").strip().strip('"').strip("'")
    redirect_uri = (settings.GOOGLE_REDIRECT_URI or "http://localhost:8000/api/gmail/callback").strip().strip('"').strip("'")

    # Direct server-to-server token exchange with Google
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "code": code,
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(token_url, data=token_data)
        if resp.status_code != 200:
            error_details = resp.text
            logger.error(f"Google token exchange failed: {error_details}")
            raise ValueError(f"Google token exchange error: {error_details}")
        tokens_resp = resp.json()

    access_token = tokens_resp.get("access_token")
    refresh_token = tokens_resp.get("refresh_token")
    scopes = tokens_resp.get("scope", "").split() or GMAIL_SCOPES

    # If no new refresh_token was returned (e.g. user already authorized previously), keep existing
    if not refresh_token:
        existing_conn = await db.db["gmail_connections"].find_one({"user_id": user_id})
        if existing_conn and existing_conn.get("encrypted_tokens"):
            try:
                old_tokens = decrypt_dict(existing_conn["encrypted_tokens"])
                refresh_token = old_tokens.get("refresh_token")
            except Exception:
                pass

    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=client_id,
        client_secret=client_secret,
        scopes=scopes,
    )

    # Query Gmail profile to get the connected email address
    email_address = ""
    try:
        service = build("gmail", "v1", credentials=creds, cache_discovery=False)
        profile = service.users().getProfile(userId="me").execute()
        email_address = profile.get("emailAddress", "")
    except Exception as prof_err:
        logger.warning(f"Could not retrieve Gmail profile email: {prof_err}")

    # Package credentials for encrypted storage
    tokens_data = {
        "token": access_token,
        "refresh_token": refresh_token,
        "token_uri": "https://oauth2.googleapis.com/token",
        "client_id": client_id,
        "client_secret": client_secret,
        "scopes": scopes,
    }
    encrypted_tokens = encrypt_dict(tokens_data)

    now = datetime.utcnow()
    await db.db["gmail_connections"].update_one(
        {"user_id": user_id},
        {
            "$set": {
                "user_id": user_id,
                "email": email_address,
                "encrypted_tokens": encrypted_tokens,
                "scopes": scopes,
                "connected_at": now,
                "sync_status": "idle",
                "last_error": None,
                "is_active": True,
                "updated_at": now,
            }
        },
        upsert=True,
    )

    logger.info(f"Gmail successfully connected for user {user_id} ({email_address})")
    return {
        "user_id": user_id,
        "email": email_address,
        "connected_at": now,
        "origin": origin,
    }

async def get_credentials_for_user(user_id: str) -> Optional[Credentials]:
    """
    Retrieves and decrypts credentials for the user, refreshing if expired.
    """
    conn = await db.db["gmail_connections"].find_one({"user_id": user_id, "is_active": True})
    if not conn or not conn.get("encrypted_tokens"):
        return None

    try:
        tokens_data = decrypt_dict(conn["encrypted_tokens"])
        creds = Credentials(
            token=tokens_data.get("token"),
            refresh_token=tokens_data.get("refresh_token"),
            token_uri=tokens_data.get("token_uri") or "https://oauth2.googleapis.com/token",
            client_id=tokens_data.get("client_id") or settings.GOOGLE_CLIENT_ID,
            client_secret=tokens_data.get("client_secret") or settings.GOOGLE_CLIENT_SECRET,
            scopes=tokens_data.get("scopes") or GMAIL_SCOPES,
        )

        # Check and refresh token if necessary
        if creds.expired and creds.refresh_token:
            logger.info(f"Refreshing expired Google OAuth access token for user {user_id}")
            creds.refresh(Request())
            # Save refreshed tokens back to DB
            tokens_data["token"] = creds.token
            if creds.refresh_token:
                tokens_data["refresh_token"] = creds.refresh_token
            encrypted_tokens = encrypt_dict(tokens_data)
            await db.db["gmail_connections"].update_one(
                {"user_id": user_id},
                {"$set": {"encrypted_tokens": encrypted_tokens, "updated_at": datetime.utcnow()}}
            )

        return creds
    except Exception as e:
        logger.error(f"Error restoring credentials for user {user_id}: {e}")
        return None

def _extract_body_parts(payload: Dict[str, Any]) -> tuple[str, str]:
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
        pt, ph = _extract_body_parts(part)
        body_text += " " + pt
        body_html += " " + ph

    return body_text.strip(), body_html.strip()

async def sync_user_orders(user_id: str, max_results: int = 40) -> Dict[str, Any]:
    """
    Searches Gmail for shopping-related order emails, parses them, and updates shopping_orders.
    """
    creds = await get_credentials_for_user(user_id)
    if not creds:
        raise ValueError("Gmail is not connected for this account. Please connect Gmail first.")

    await db.db["gmail_connections"].update_one(
        {"user_id": user_id},
        {"$set": {"sync_status": "syncing", "updated_at": datetime.utcnow()}}
    )

    try:
        service = build("gmail", "v1", credentials=creds, cache_discovery=False)

        # Focused search query targeting order & shipment receipts from major retailers
        query = (
            'from:(amazon OR flipkart OR meesho OR myntra OR croma OR reliancedigital OR blinkit OR swiggy OR zepto OR ajio OR nykaa) '
            'OR subject:(order OR "order confirmed" OR "delivered" OR "dispatched" OR "refund" OR invoice OR receipt)'
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

        for msg_summary in messages:
            msg_id = msg_summary.get("id")
            if not msg_id:
                continue

            try:
                full_msg = service.users().messages().get(userId="me", id=msg_id, format="full").execute()
                headers = full_msg.get("payload", {}).get("headers", [])

                subject = ""
                sender = ""
                date_str = ""

                for h in headers:
                    name = h.get("name", "").lower()
                    if name == "subject":
                        subject = h.get("value", "")
                    elif name == "from":
                        sender = h.get("value", "")
                    elif name == "date":
                        date_str = h.get("value", "")

                snippet = full_msg.get("snippet", "")
                body_text, body_html = _extract_body_parts(full_msg.get("payload", {}))

                parsed = parse_order_email(
                    msg_id=msg_id,
                    sender=sender,
                    subject=subject,
                    snippet=snippet,
                    body_text=body_text,
                    body_html=body_html,
                    date_str=date_str,
                )

                if parsed:
                    now = datetime.utcnow()
                    retailer = parsed["retailer"]
                    order_number = parsed.get("order_number")

                    # Deduplication filter: matching user_id + retailer + order_number OR email_message_id
                    filter_query: Dict[str, Any] = {"user_id": user_id}
                    if order_number:
                        filter_query["$or"] = [
                            {"retailer": retailer, "order_number": order_number},
                            {"email_message_id": msg_id},
                        ]
                    else:
                        filter_query["email_message_id"] = msg_id

                    existing = await db.db["shopping_orders"].find_one(filter_query)

                    if existing:
                        # Update lifecycle fields & timestamp
                        await db.db["shopping_orders"].update_one(
                            {"_id": existing["_id"]},
                            {
                                "$set": {
                                    "status": parsed["status"],
                                    "delivered": parsed["delivered"] or existing.get("delivered", False),
                                    "returned": parsed["returned"] or existing.get("returned", False),
                                    "refunded": parsed["refunded"] or existing.get("refunded", False),
                                    "refund_amount": parsed["refund_amount"] or existing.get("refund_amount"),
                                    "product_image": parsed["product_image"] or existing.get("product_image"),
                                    "updated_at": now,
                                }
                            }
                        )
                        updated_count += 1
                    else:
                        # Insert new order
                        new_order_doc = {
                            "user_id": user_id,
                            "retailer": parsed["retailer"],
                            "product_name": parsed["product_name"],
                            "product_image": parsed.get("product_image"),
                            "order_number": parsed.get("order_number"),
                            "order_date": parsed.get("order_date"),
                            "order_time": parsed.get("order_time"),
                            "amount": parsed.get("amount"),
                            "currency": parsed.get("currency", "INR"),
                            "status": parsed["status"],
                            "delivered": parsed["delivered"],
                            "returned": parsed["returned"],
                            "refunded": parsed["refunded"],
                            "refund_amount": parsed.get("refund_amount"),
                            "source": "gmail",
                            "email_message_id": msg_id,
                            "email_subject": parsed.get("email_subject"),
                            "created_at": now,
                            "updated_at": now,
                        }
                        await db.db["shopping_orders"].insert_one(new_order_doc)
                        imported_count += 1

            except Exception as item_err:
                logger.warning(f"Error parsing email {msg_id}: {item_err}")
                continue

        now = datetime.utcnow()
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
            "message": f"Successfully synced {total_found} receipts: {imported_count} new orders imported, {updated_count} updated.",
            "total_found": total_found,
            "imported": imported_count,
            "updated": updated_count,
            "last_synced_at": now,
        }
    except Exception as e:
        logger.error(f"Gmail sync failed for user {user_id}: {e}")
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

async def disconnect_gmail(user_id: str) -> bool:
    """
    Safely removes stored Gmail credentials for the user.
    """
    result = await db.db["gmail_connections"].delete_one({"user_id": user_id})
    return result.deleted_count > 0

async def get_gmail_status(user_id: str) -> Dict[str, Any]:
    """
    Retrieves current Gmail connection status and total imported orders count.
    """
    try:
        conn = None
        total_orders = 0
        if db.db is not None:
            conn = await db.db["gmail_connections"].find_one({"user_id": user_id, "is_active": True})
            total_orders = await db.db["shopping_orders"].count_documents({"user_id": user_id})

        if not conn:
            return {
                "connected": False,
                "email": None,
                "connected_at": None,
                "last_synced_at": None,
                "sync_status": "idle",
                "total_orders": total_orders,
                "last_error": None,
            }

        return {
            "connected": True,
            "email": conn.get("email"),
            "connected_at": conn.get("connected_at"),
            "last_synced_at": conn.get("last_synced_at"),
            "sync_status": conn.get("sync_status", "idle"),
            "total_orders": total_orders,
            "last_error": conn.get("last_error"),
        }
    except Exception as e:
        logger.error(f"Error in get_gmail_status: {e}")
        return {
            "connected": False,
            "email": None,
            "connected_at": None,
            "last_synced_at": None,
            "sync_status": "idle",
            "total_orders": 0,
            "last_error": None,
        }
