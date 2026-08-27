from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.auth.security import verify_token

security = HTTPBearer(auto_error=False)

async def get_current_user(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Extracts the JWT token from the Authorization header or query parameter,
    verifies it, and returns the decoded token payload.
    """
    raw_token = None
    if credentials:
        raw_token = credentials.credentials
    elif "authorization" in request.headers:
        auth_header = request.headers["authorization"]
        if auth_header.startswith("Bearer "):
            raw_token = auth_header[7:].strip()
        else:
            raw_token = auth_header.strip()
    elif "token" in request.query_params:
        raw_token = request.query_params["token"]

    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        decoded_token = verify_token(raw_token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
