import sys
import os
from pathlib import Path

# Ensure both project root and backend dir are in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.api.routes import users, likes, ai, gmail, orders, compare, debug, auth_google
from backend.db.mongodb import connect_to_mongo, close_mongo_connection
import uvicorn

app = FastAPI(title=settings.PROJECT_NAME)

# CORS configuration supporting all dev ports (8080-8089, 5173, 3000)
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://localhost:8082",
    "http://127.0.0.1:8082",
    "http://localhost:8083",
    "http://127.0.0.1:8083",
    "http://localhost:8084",
    "http://127.0.0.1:8084",
    "http://localhost:8085",
    "http://127.0.0.1:8085",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()
    # Startup validation for Google OAuth configuration (never exposes Client Secret)
    has_client_id = bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_ID.strip())
    has_client_secret = bool(settings.GOOGLE_CLIENT_SECRET and settings.GOOGLE_CLIENT_SECRET.strip())
    has_redirect_uri = bool(settings.GOOGLE_REDIRECT_URI and settings.GOOGLE_REDIRECT_URI.strip())

    if has_client_id and has_client_secret and has_redirect_uri:
        print(f"[Google OAuth] Configuration loaded successfully! Client ID: {settings.GOOGLE_CLIENT_ID} | Redirect URI: {settings.GOOGLE_REDIRECT_URI} | Secret: [SECURELY LOADED]", flush=True)
    else:
        missing = []
        if not has_client_id: missing.append("GOOGLE_CLIENT_ID")
        if not has_client_secret: missing.append("GOOGLE_CLIENT_SECRET")
        if not has_redirect_uri: missing.append("GOOGLE_REDIRECT_URI")
        print(f"[Google OAuth] WARNING: Missing OAuth config variables: {', '.join(missing)}. Gmail connection feature will require these in .env.", flush=True)

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

app.include_router(users.router, prefix="/api")
app.include_router(likes.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(gmail.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(compare.router, prefix="/api")
app.include_router(debug.router, prefix="/api")
app.include_router(debug.router, prefix="") # Support /debug/test-serpapi directly
app.include_router(auth_google.router, prefix="/auth/google")
app.include_router(auth_google.router, prefix="/api/auth/google")


@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("backend.api.main:app", host="0.0.0.0", port=8000, reload=True)
