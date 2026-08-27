from fastapi import APIRouter, Depends, HTTPException, status
from backend.auth.dependencies import get_current_user
from backend.models.user import UserSync, UserProfile, UserUpdate
from backend.db.mongodb import db
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/sync")
async def sync_user(user_data: UserSync, token_payload: dict = Depends(get_current_user)):
    """
    Syncs the user with the MongoDB database after a successful login.
    """
    token_uid = token_payload.get("uid") or token_payload.get("user_id") or token_payload.get("sub")
    if token_uid != user_data.uid:
        raise HTTPException(status_code=403, detail="UID mismatch")
        
    collection = db.db["users"]
    now = datetime.now(timezone.utc)
    
    existing_user = await collection.find_one({"uid": user_data.uid})
    
    if existing_user:
        await collection.update_one(
            {"uid": user_data.uid},
            {
                "$set": {
                    "last_login": now,
                    "name": user_data.name or existing_user.get("name"),
                    "email": user_data.email or existing_user.get("email"),
                    "photo_url": user_data.photo_url or existing_user.get("photo_url"),
                }
            }
        )
        return {"message": "User login synced"}
    else:
        new_user = {
            "uid": user_data.uid,
            "email": user_data.email,
            "name": user_data.name,
            "photo_url": user_data.photo_url,
            "provider_id": user_data.provider_id,
            "created_at": now,
            "last_login": now
        }
        await collection.insert_one(new_user)
        return {"message": "New user created"}

@router.get("/me", response_model=UserProfile)
async def get_my_profile(token_payload: dict = Depends(get_current_user)):
    """
    Get the current authenticated user's profile.
    """
    uid = token_payload.get("uid") or token_payload.get("user_id") or token_payload.get("sub")
    collection = db.db["users"]
    user = await collection.find_one({"uid": uid})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found in database")
        
    return user

@router.put("/me")
async def update_my_profile(update_data: UserUpdate, token_payload: dict = Depends(get_current_user)):
    """
    Update the current authenticated user's profile information.
    """
    uid = token_payload.get("uid") or token_payload.get("user_id") or token_payload.get("sub")
    collection = db.db["users"]
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not update_dict:
        return {"message": "No fields to update"}
        
    result = await collection.update_one(
        {"uid": uid},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"message": "Profile updated"}
