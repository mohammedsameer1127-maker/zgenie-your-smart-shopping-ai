import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Automatically load .env from backend folder and project root folder
BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent

load_dotenv(BASE_DIR / ".env")
load_dotenv(ROOT_DIR / ".env")

class Settings(BaseSettings):
    PROJECT_NAME: str = "ZGenie API"
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "zgenie"
    FIREBASE_CREDENTIALS_PATH: str = "firebase-adminsdk.json"
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    GROQ_API_URL: str = "https://api.groq.com/openai/v1/chat/completions"
    
    # Google OAuth & Gmail Integration
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/gmail/callback"
    FRONTEND_URL: str = "http://localhost:8082"
    GMAIL_ENCRYPTION_KEY: str = ""
    
    # Shopping Search Connectors
    SERPAPI_KEY: str = ""
    SERPER_API_KEY: str = ""
    CONNECTOR_FALLBACK_ORDER: str = "serper,serpapi"
    ENABLE_DEBUG_ROUTES: bool = True
    
    model_config = SettingsConfigDict(
        env_file=(str(BASE_DIR / ".env"), str(ROOT_DIR / ".env"), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Ensure fallbacks if set via os.environ directly
if not settings.GROQ_API_KEY:
    settings.GROQ_API_KEY = os.getenv("GROQ_API_KEY", "") or os.getenv("VITE_GROQ_API_KEY", "")
if not settings.GOOGLE_CLIENT_ID:
    settings.GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
if not settings.GOOGLE_CLIENT_SECRET:
    settings.GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
if not settings.GOOGLE_REDIRECT_URI:
    settings.GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/gmail/callback")
if not settings.FRONTEND_URL:
    settings.FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8082")
if not settings.GMAIL_ENCRYPTION_KEY:
    settings.GMAIL_ENCRYPTION_KEY = os.getenv("GMAIL_ENCRYPTION_KEY", "zgenie_secure_token_encryption_key_2025")
if not settings.SERPAPI_KEY:
    settings.SERPAPI_KEY = os.getenv("SERPAPI_KEY", "") or os.getenv("VITE_SERPAPI_KEY", "")
if not settings.SERPER_API_KEY:
    settings.SERPER_API_KEY = os.getenv("SERPER_API_KEY", "") or os.getenv("VITE_SERPER_API_KEY", "")

