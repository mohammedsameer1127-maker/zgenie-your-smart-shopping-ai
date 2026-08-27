import base64
import hashlib
import json
from typing import Any, Dict
from cryptography.fernet import Fernet
from backend.core.config import settings

def _get_fernet() -> Fernet:
    # Derive a 32-byte urlsafe base64 key deterministically from the configured encryption key
    raw_key = settings.GMAIL_ENCRYPTION_KEY or "zgenie_default_secure_key_2025"
    key_bytes = hashlib.sha256(raw_key.encode()).digest()
    fernet_key = base64.urlsafe_b64encode(key_bytes)
    return Fernet(fernet_key)

def encrypt_dict(data: Dict[str, Any]) -> str:
    """
    Serializes a dictionary to JSON and encrypts it using Fernet.
    """
    f = _get_fernet()
    json_str = json.dumps(data)
    encrypted = f.encrypt(json_str.encode("utf-8"))
    return encrypted.decode("utf-8")

def decrypt_dict(encrypted_str: str) -> Dict[str, Any]:
    """
    Decrypts a Fernet encrypted string and parses it as a dictionary.
    """
    f = _get_fernet()
    decrypted = f.decrypt(encrypted_str.encode("utf-8"))
    return json.loads(decrypted.decode("utf-8"))
