from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    uid: str = Field(..., description="Firebase UID")
    email: Optional[str] = Field(None, description="User email")
    name: Optional[str] = Field(None, alias="displayName")
    photo_url: Optional[str] = Field(None, alias="photoURL")
    provider_id: Optional[str] = Field(None, alias="providerId")

    model_config = {
        "populate_by_name": True,
        "extra": "ignore",
    }

class UserSync(UserBase):
    pass

class UserProfile(UserBase):
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, alias="displayName")
    photo_url: Optional[str] = Field(None, alias="photoURL")

    model_config = {
        "populate_by_name": True,
        "extra": "ignore",
    }
