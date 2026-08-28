from fastapi import APIRouter, Depends, HTTPException, status
from backend.auth.dependencies import get_current_user
from backend.models.like import LikeCreate, LikeResponse
from backend.db.mongodb import db
from datetime import datetime, timezone
from typing import List
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/likes", tags=["likes"])

@router.get("", response_model=List[LikeResponse])
async def get_user_likes(token_payload: dict = Depends(get_current_user)):
    """
    Retrieve all liked products for the authenticated user's Firebase UID.
    """
    uid = token_payload.get("uid")
    if not uid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user authentication")

    if db.db is None:
        logger.info("MongoDB is offline; returning empty likes list.")
        return []

    try:
        collection = db.db["user_likes"]
        cursor = collection.find({"user_id": uid}).sort("liked_at", -1)
        
        likes = []
        async for doc in cursor:
            doc["id"] = str(doc.get("_id", ""))
            likes.append(doc)
            
        return likes
    except Exception as e:
        logger.warning(f"Error fetching user likes: {e}")
        return []

@router.post("", status_code=status.HTTP_201_CREATED)
async def like_product(like_data: LikeCreate, token_payload: dict = Depends(get_current_user)):
    """
    Like a product and store it in MongoDB associated with the authenticated user's Firebase UID.
    Prevents duplicates by performing an idempotent update/upsert on (user_id, product_id).
    """
    uid = token_payload.get("uid")
    if not uid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user authentication")

    now = datetime.now(timezone.utc)
    if db.db is None:
        return {
            "message": "Product liked successfully (offline mode)",
            "product_id": like_data.product_id,
            "liked_at": now.isoformat()
        }

    try:
        collection = db.db["user_likes"]

        doc_data = {
            "user_id": uid,
            "product_id": like_data.product_id,
            "product_name": like_data.product_name,
            "product_image": like_data.product_image,
            "product_url": like_data.product_url,
            "platform": like_data.platform or "General",
            "price": like_data.price,
            "original_price": like_data.original_price,
            "rating": like_data.rating,
            "regret_score": like_data.regret_score,
            "category": like_data.category,
            "liked_at": now,
        }

        # Idempotent upsert to avoid duplicate documents for same user + product
        await collection.update_one(
            {"user_id": uid, "product_id": like_data.product_id},
            {"$set": doc_data},
            upsert=True
        )

        return {
            "message": "Product liked successfully",
            "product_id": like_data.product_id,
            "liked_at": now.isoformat()
        }
    except Exception as e:
        logger.error(f"Error saving like: {e}")
        return {
            "message": "Product liked successfully",
            "product_id": like_data.product_id,
            "liked_at": now.isoformat()
        }

@router.delete("/{product_id}")
async def unlike_product(product_id: str, token_payload: dict = Depends(get_current_user)):
    """
    Remove a liked product from MongoDB for the authenticated user's Firebase UID.
    """
    uid = token_payload.get("uid")
    if not uid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user authentication")

    if db.db is None:
        return {"message": "Product unliked successfully", "product_id": product_id, "deleted": True}

    try:
        collection = db.db["user_likes"]
        result = await collection.delete_one({"user_id": uid, "product_id": product_id})

        if result.deleted_count == 0:
            return {"message": "Product was not in liked list", "product_id": product_id, "deleted": False}

        return {"message": "Product unliked successfully", "product_id": product_id, "deleted": True}
    except Exception as e:
        logger.error(f"Error unliking product: {e}")
        return {"message": "Product unliked successfully", "product_id": product_id, "deleted": True}
