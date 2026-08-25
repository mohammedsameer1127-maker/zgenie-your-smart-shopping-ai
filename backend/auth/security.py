import firebase_admin
from firebase_admin import credentials, auth
from backend.core.config import settings
import os
import logging

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
    """
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        logger.error(f"Error verifying token: {e}")
        raise ValueError("Invalid authentication token")
