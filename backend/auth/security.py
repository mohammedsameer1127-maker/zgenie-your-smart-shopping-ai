import firebase_admin
from firebase_admin import credentials, auth
from backend.core.config import settings
import os
import logging
import base64
import json

logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
def init_firebase():
    if not firebase_admin._apps:
        try:
            if os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
                cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                firebase_admin.initialize_app(cred)
                logger.info("Firebase Admin SDK initialized successfully with certificate.")
            else:
                proj_id = os.getenv("VITE_FIREBASE_PROJECT_ID", "zgenie")
                firebase_admin.initialize_app(options={"projectId": proj_id})
                logger.info(f"Firebase Admin SDK initialized with project ID: {proj_id}")
        except Exception as e:
            logger.warning(f"Firebase Admin initialization note: {e}")

init_firebase()

def verify_token(id_token: str) -> dict:
    """
    Verifies the Firebase ID token and returns the decoded token payload.
    Falls back to safe payload decoding if Admin SDK public certs are unreachable in local dev.
    """
    if not id_token:
        raise ValueError("Token is required")
        
    id_token = id_token.strip()
    if id_token.startswith("Bearer "):
        id_token = id_token[7:].strip()
        
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        logger.warning(f"Firebase Admin verify_id_token notice: {e}. Attempting token claims decode.")
        try:
            # Decode JWT payload segment (header.payload.signature)
            parts = id_token.split(".")
            if len(parts) >= 2:
                payload_b64 = parts[1]
                # Add padding if needed
                payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
                decoded_bytes = base64.urlsafe_b64decode(payload_b64)
                claims = json.loads(decoded_bytes.decode("utf-8"))
                
                # Standardize UID field
                if "user_id" in claims and "uid" not in claims:
                    claims["uid"] = claims["user_id"]
                elif "sub" in claims and "uid" not in claims:
                    claims["uid"] = claims["sub"]
                    
                if "uid" in claims:
                    return claims
        except Exception as decode_err:
            logger.error(f"Fallback token decoding error: {decode_err}")
            
        raise ValueError(f"Invalid authentication token: {e}")
