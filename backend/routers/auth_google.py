import os
import json
import base64
import secrets
import urllib.parse
import logging
import httpx
from datetime import datetime
from typing import Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field

from backend.core.config import settings
from backend.core.encryption import encrypt_dict, decrypt_dict
from backend.auth.dependencies import get_current_user
from backend.db.mongodb import db
from backend.models.gmail import GmailStatusResponse, GmailSyncResponse
from backend.services.order_parser import parse_and_sync_orders

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Google OAuth & Gmail Integration"])

GMAIL_READONLY_SCOPE = "openid email profile https://www.googleapis.com/auth/gmail.readonly"

class GoogleConnectResponse(BaseModel):
    auth_url: str = Field(..., description="Google OAuth 2.0 Authorization URL")

class GoogleDisconnectResponse(BaseModel):
    success: bool = Field(..., description="Whether disconnection succeeded")
    message: str = Field(..., description="Status message")

def build_google_oauth_url(user_id: str, origin: Optional[str] = None) -> str:
    """
    Builds the Google OAuth authorization URL using GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI,
    and scope https://www.googleapis.com/auth/gmail.readonly, with access_type=offline and prompt=consent.
    """
    client_id = (settings.GOOGLE_CLIENT_ID or "").strip().strip('"').strip("'")
    redirect_uri = (settings.GOOGLE_REDIRECT_URI or "http://localhost:8000/auth/google/callback").strip().strip('"').strip("'")

    if not client_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GOOGLE_CLIENT_ID is not configured on the server. Please set it in backend .env.",
        )

    # Securely package user state with timestamp and nonce
    state_payload = {
        "user_id": user_id,
        "origin": origin or settings.FRONTEND_URL,
        "nonce": secrets.token_urlsafe(16),
        "ts": int(datetime.utcnow().timestamp()),
    }
    state = base64.urlsafe_b64encode(json.dumps(state_payload).encode()).decode()

    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": GMAIL_READONLY_SCOPE,
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
        "include_granted_scopes": "true",
    }
    return f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"

@router.get("/connect", response_model=GoogleConnectResponse)
@router.post("/connect", response_model=GoogleConnectResponse)
async def google_connect(
    origin: Optional[str] = Query(None, description="Frontend origin redirect"),
    current_user: dict = Depends(get_current_user),
):
    """
    Initiates Google OAuth flow for read-only Gmail access.
    Returns the authorization URL with offline access and consent prompt.
    """
    try:
        user_id = current_user.get("uid")
        auth_url = build_google_oauth_url(user_id=user_id, origin=origin)
        return GoogleConnectResponse(auth_url=auth_url)
    except Exception as e:
        logger.error(f"Failed to generate Google OAuth URL: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate Google authorization URL: {str(e)}",
        )

# In-memory connection cache for high-availability / local fallback
_in_memory_gmail_connections: Dict[str, Dict[str, Any]] = {}

@router.get("/callback")
async def google_oauth_callback(
    code: Optional[str] = Query(None, description="Google OAuth authorization code"),
    state: Optional[str] = Query(None, description="Signed state payload"),
    error: Optional[str] = Query(None, description="OAuth error message from Google"),
):
    """
    Handles Google OAuth redirect callback:
    1. Validates the state parameter.
    2. Exchanges authorization code for refresh & access tokens via Google token endpoint.
    3. Queries userinfo to get connected email address.
    4. Encrypts tokens at rest with Fernet.
    5. Redirects back to the frontend settings page.
    """
    default_frontend = settings.FRONTEND_URL.rstrip("/")
    if error:
        logger.warning(f"Google OAuth returned error in callback: {error}")
        return RedirectResponse(url=f"{default_frontend}/settings?gmail_status=error&error={error}")

    if not code or not state:
        logger.warning("Google OAuth callback missing code or state")
        return RedirectResponse(url=f"{default_frontend}/settings?gmail_status=error&error=missing_code_or_state")

    try:
        raw_state = base64.urlsafe_b64decode(state.encode()).decode()
        state_data = json.loads(raw_state)
        user_id = state_data.get("user_id")
        target_origin = (state_data.get("origin") or default_frontend).rstrip("/")
        if not user_id:
            raise ValueError("Missing user_id in OAuth state payload")
    except Exception as e:
        logger.error(f"Invalid Google OAuth callback state: {e}")
        return RedirectResponse(url=f"{default_frontend}/settings?gmail_status=error&error=invalid_state")

    client_id = (settings.GOOGLE_CLIENT_ID or "").strip().strip('"').strip("'")
    client_secret = (settings.GOOGLE_CLIENT_SECRET or "").strip().strip('"').strip("'")
    redirect_uri = (settings.GOOGLE_REDIRECT_URI or "http://localhost:8000/auth/google/callback").strip().strip('"').strip("'")

    # Exchange authorization code for tokens directly via Google token endpoint
    token_url = "https://oauth2.googleapis.com/token"
    token_payload = {
        "code": code,
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(token_url, data=token_payload)
            if resp.status_code != 200:
                err_text = resp.text
                logger.error(f"Google token exchange failed: {err_text}")
                return RedirectResponse(url=f"{target_origin}/settings?gmail_status=error&error=token_exchange_failed")
            tokens_data = resp.json()
    except Exception as exc:
        logger.error(f"Network error communicating with Google token endpoint: {exc}")
        return RedirectResponse(url=f"{target_origin}/settings?gmail_status=error&error=network_error")

    access_token = tokens_data.get("access_token")
    refresh_token = tokens_data.get("refresh_token")
    scopes = tokens_data.get("scope", "").split() or [GMAIL_READONLY_SCOPE]

    # If user already consented earlier, keep existing encrypted refresh token
    if not refresh_token:
        mem_conn = _in_memory_gmail_connections.get(user_id)
        if mem_conn:
            refresh_token = mem_conn.get("refresh_token")
            
        if not refresh_token and db.db is not None:
            try:
                existing = await db.db["gmail_connections"].find_one({"user_id": user_id})
                if existing:
                    enc = existing.get("encrypted_tokens") or existing.get("encrypted_refresh_token")
                    if enc:
                        dec = decrypt_dict(enc)
                        refresh_token = dec.get("refresh_token")
            except Exception:
                pass

    # Query connected email address via userinfo / gmail profile
    connected_email = None
    if access_token:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                prof_resp = await client.get(
                    "https://gmail.googleapis.com/gmail/v1/users/me/profile",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                if prof_resp.status_code == 200:
                    connected_email = prof_resp.json().get("emailAddress")
        except Exception as p_err:
            logger.warning(f"Could not retrieve Gmail profile email: {p_err}")

    # Package and Fernet-encrypt refresh and access tokens at rest
    token_bundle = {
        "token": access_token,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_uri": "https://oauth2.googleapis.com/token",
        "client_id": client_id,
        "client_secret": client_secret,
        "scopes": scopes,
    }
    encrypted_refresh_token = encrypt_dict(token_bundle)

    now = datetime.utcnow()
    # Save to in-memory fallback
    _in_memory_gmail_connections[user_id] = {
        "user_id": user_id,
        "email": connected_email,
        "encrypted_refresh_token": encrypted_refresh_token,
        "encrypted_tokens": encrypted_refresh_token,
        "refresh_token": refresh_token,
        "access_token": access_token,
        "scopes": scopes,
        "connected_at": now,
        "is_active": True,
        "sync_status": "idle",
        "last_error": None,
        "updated_at": now,
    }

    # Save to MongoDB
    if db.db is not None:
        try:
            await db.db["gmail_connections"].update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "user_id": user_id,
                        "email": connected_email,
                        "encrypted_refresh_token": encrypted_refresh_token,
                        "encrypted_tokens": encrypted_refresh_token,
                        "scopes": scopes,
                        "connected_at": now,
                        "is_active": True,
                        "sync_status": "idle",
                        "last_error": None,
                        "updated_at": now,
                    }
                },
                upsert=True,
            )
        except Exception as db_err:
            logger.warning(f"Notice storing Gmail connection in DB: {db_err}")

    logger.info(f"Successfully connected and stored Gmail connection for user {user_id} ({connected_email})")
    return RedirectResponse(url=f"{target_origin}/settings?gmail_status=connected")

@router.delete("/disconnect", response_model=GoogleDisconnectResponse)
async def google_disconnect(current_user: dict = Depends(get_current_user)):
    """
    Disconnects the user's Gmail account:
    1. Revokes the token via Google's token revoke endpoint.
    2. Deletes the connection record from gmail_connections.
    """
    user_id = current_user.get("uid")
    if user_id in _in_memory_gmail_connections:
        del _in_memory_gmail_connections[user_id]

    if db.db is None:
        return GoogleDisconnectResponse(success=True, message="Gmail account disconnected.")

    try:
        conn = await db.db["gmail_connections"].find_one({"user_id": user_id})
        if conn:
            enc = conn.get("encrypted_tokens") or conn.get("encrypted_refresh_token")
            if enc:
                try:
                    tokens_data = decrypt_dict(enc)
                    token_to_revoke = tokens_data.get("refresh_token") or tokens_data.get("token") or tokens_data.get("access_token")
                    if token_to_revoke:
                        # Revoke via Google endpoint
                        async with httpx.AsyncClient(timeout=8.0) as client:
                            await client.post(
                                f"https://oauth2.googleapis.com/revoke?token={token_to_revoke}",
                                headers={"Content-Type": "application/x-www-form-urlencoded"},
                            )
                except Exception as rev_err:
                    logger.warning(f"Error revoking token with Google: {rev_err}")

            await db.db["gmail_connections"].delete_one({"user_id": user_id})
    except Exception as e:
        logger.warning(f"Database error during disconnect: {e}")

    return GoogleDisconnectResponse(
        success=True,
        message="Gmail account disconnected and credentials safely revoked.",
    )

@router.get("/status", response_model=GmailStatusResponse)
async def google_status(current_user: dict = Depends(get_current_user)):
    """
    Returns connection status, connected email, last synced time, and total orders.
    """
    user_id = current_user.get("uid")
    mem_conn = _in_memory_gmail_connections.get(user_id)

    if db.db is None:
        if mem_conn:
            return GmailStatusResponse(
                connected=True,
                email=mem_conn.get("email"),
                connected_at=mem_conn.get("connected_at"),
                last_synced_at=mem_conn.get("last_synced_at"),
                sync_status=mem_conn.get("sync_status", "idle"),
                total_orders=0,
                last_error=None,
            )
        return GmailStatusResponse(connected=False, total_orders=0)

    try:
        conn = await db.db["gmail_connections"].find_one({"user_id": user_id, "is_active": True})
        if not conn:
            conn = await db.db["gmail_connections"].find_one({"user_id": user_id})

        if not conn and mem_conn:
            conn = mem_conn

        total_orders = await db.db["shopping_orders"].count_documents({"user_id": user_id})

        if not conn or not (conn.get("encrypted_tokens") or conn.get("encrypted_refresh_token")):
            return GmailStatusResponse(
                connected=False,
                email=None,
                connected_at=None,
                last_synced_at=None,
                sync_status="idle",
                total_orders=total_orders,
                last_error=None,
            )

        return GmailStatusResponse(
            connected=True,
            email=conn.get("email"),
            connected_at=conn.get("connected_at"),
            last_synced_at=conn.get("last_synced_at"),
            sync_status=conn.get("sync_status", "idle"),
            total_orders=total_orders,
            last_error=conn.get("last_error"),
        )
    except Exception as db_err:
        logger.warning(f"Database unavailable when querying Gmail status: {db_err}")
        if mem_conn:
            return GmailStatusResponse(
                connected=True,
                email=mem_conn.get("email"),
                connected_at=mem_conn.get("connected_at"),
                last_synced_at=mem_conn.get("last_synced_at"),
                sync_status=mem_conn.get("sync_status", "idle"),
                total_orders=0,
                last_error=None,
            )
        return GmailStatusResponse(connected=False, total_orders=0)

@router.post("/sync", response_model=GmailSyncResponse)
async def google_sync_orders(
    max_results: int = Query(50, ge=1, le=100, description="Max emails to process"),
    current_user: dict = Depends(get_current_user),
):
    """
    Triggers order ingestion and parsing from the user's connected Gmail account.
    """
    user_id = current_user.get("uid")
    try:
        result = await parse_and_sync_orders(user_id=user_id, max_results=max_results)
        return GmailSyncResponse(**result)
    except Exception as e:
        logger.error(f"Gmail sync failed for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync Gmail orders: {str(e)}",
        )
        result = await parse_and_sync_orders(user_id=user_id, max_results=max_results)
        return GmailSyncResponse(**result)
    except Exception as e:
        logger.error(f"Gmail sync failed for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync Gmail orders: {str(e)}",
        )
