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
    
    model_config = SettingsConfigDict(
        env_file=(str(BASE_DIR / ".env"), str(ROOT_DIR / ".env"), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Ensure fallback if set as VITE_GROQ_API_KEY or via os.environ
if not settings.GROQ_API_KEY:
    settings.GROQ_API_KEY = os.getenv("GROQ_API_KEY", "") or os.getenv("VITE_GROQ_API_KEY", "")
