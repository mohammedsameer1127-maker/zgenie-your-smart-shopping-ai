from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    uid: str = Field(..., description="Firebase UID")
    email: EmailStr
    name: Optional[str] = None
    photo_url: Optional[str] = None
    provider_id: Optional[str] = None

class UserSync(UserBase):
    pass

class UserProfile(UserBase):
    created_at: datetime
    last_login: datetime

class UserUpdate(BaseModel):
    name: Optional[str] = None
    photo_url: Optional[str] = None
