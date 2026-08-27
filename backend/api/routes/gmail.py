from fastapi import APIRouter, Depends, HTTPException, Query, Header, status, Request
from fastapi.responses import RedirectResponse
from typing import Optional
import logging

from backend.auth.dependencies import get_current_user
from backend.auth.security import verify_token
from backend.core.config import settings
from backend.models.gmail import GmailStatusResponse, GmailSyncResponse
from backend.services.gmail_service import (
    get_authorization_url,
    handle_oauth_callback,
    sync_user_orders,
    disconnect_gmail,
    get_gmail_status,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/gmail", tags=["Gmail OAuth & Shopping History"])

@router.post("/connect")
async def connect_gmail_post(
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    """
    POST endpoint to start Google OAuth flow without putting tokens in query strings.
    """
    user_id = current_user.get("uid") or current_user.get("user_id") or current_user.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is required to connect Gmail",
        )
    try:
        frontend_origin = request.headers.get("origin") or request.headers.get("referer") or settings.FRONTEND_URL
        auth_url = get_authorization_url(user_id=user_id, frontend_origin=frontend_origin)
        return {"auth_url": auth_url}
    except Exception as e:
        logger.error(f"Failed to generate authorization URL: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate Google OAuth authorization URL: {str(e)}",
        )

@router.get("/connect")
async def connect_gmail_get(
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    """
    GET endpoint to start Google OAuth flow via Authorization header.
    """
    user_id = current_user.get("uid") or current_user.get("user_id") or current_user.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is required to connect Gmail",
        )
    try:
        frontend_origin = request.headers.get("origin") or request.headers.get("referer") or settings.FRONTEND_URL
        auth_url = get_authorization_url(user_id=user_id, frontend_origin=frontend_origin)
        return {"auth_url": auth_url}
    except Exception as e:
        logger.error(f"Failed to generate authorization URL: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate Google OAuth authorization URL: {str(e)}",
        )

@router.get("/callback")
async def gmail_oauth_callback(
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
):
    """
    Handles Google OAuth redirect callback, validates state, securely stores encrypted tokens,
    and redirects user back to the ZGenie frontend.
    """
    default_frontend = settings.FRONTEND_URL.rstrip("/")
    
    if error:
        logger.warning(f"Google OAuth callback returned error: {error}")
        return RedirectResponse(url=f"{default_frontend}/orders?gmail_status=error&error={error}")
        
    if not code or not state:
        logger.warning("Google OAuth callback missing code or state")
        return RedirectResponse(url=f"{default_frontend}/orders?gmail_status=error&error=missing_code_or_state")
        
    try:
        result = await handle_oauth_callback(code=code, state=state)
        target_origin = (result.get("origin") or default_frontend).rstrip("/")
        return RedirectResponse(url=f"{target_origin}/orders?gmail_status=connected")
    except Exception as e:
        logger.error(f"Error handling Google OAuth callback: {e}")
        return RedirectResponse(url=f"{default_frontend}/orders?gmail_status=error&error={str(e)}")

@router.get("/status", response_model=GmailStatusResponse)
async def get_status(current_user: dict = Depends(get_current_user)):
    """
    Returns the current Gmail connection status and sync state for the authenticated user.
    """
    user_id = current_user.get("uid") or current_user.get("user_id") or current_user.get("sub")
    try:
        status_info = await get_gmail_status(user_id)
        return GmailStatusResponse(**status_info)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch Gmail status: {str(e)}",
        )

@router.post("/sync", response_model=GmailSyncResponse)
async def sync_orders(current_user: dict = Depends(get_current_user)):
    """
    Triggers a sync of shopping and order receipt emails from the user's connected Gmail.
    """
    user_id = current_user.get("uid") or current_user.get("user_id") or current_user.get("sub")
    try:
        sync_result = await sync_user_orders(user_id)
        return GmailSyncResponse(**sync_result)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync Gmail orders: {str(e)}",
        )

@router.delete("/disconnect")
async def disconnect(current_user: dict = Depends(get_current_user)):
    """
    Disconnects the user's Gmail account and securely removes all stored tokens.
    """
    user_id = current_user.get("uid") or current_user.get("user_id") or current_user.get("sub")
    try:
        success = await disconnect_gmail(user_id)
        return {"success": success, "message": "Gmail account disconnected successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to disconnect Gmail: {str(e)}",
        )
