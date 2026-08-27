from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional
import math

from backend.auth.dependencies import get_current_user
from backend.db.mongodb import db
from backend.models.order import ShoppingHistoryResponse, ShoppingOrder
from backend.services.gmail_service import get_gmail_status

router = APIRouter(prefix="", tags=["Shopping History"])

@router.get("/shopping-history", response_model=ShoppingHistoryResponse)
async def get_shopping_history(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    retailer: Optional[str] = Query(None, description="Filter by retailer name"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by order lifecycle status"),
    q: Optional[str] = Query(None, description="Search product name or order number"),
    current_user: dict = Depends(get_current_user),
):
    """
    Returns the authenticated user's imported shopping orders from MongoDB,
    sorted by newest order date first, with pagination and search filtering.
    """
    user_id = current_user["uid"]
    
    # Base query constrained to authenticated user
    query: dict = {"user_id": user_id}
    
    if retailer and retailer.lower() != "all":
        query["retailer"] = {"$regex": f"^{retailer}$", "$options": "i"}
        
    if status_filter and status_filter.lower() != "all":
        if status_filter.lower() == "delivered":
            query["delivered"] = True
        elif status_filter.lower() == "refunded":
            query["refunded"] = True
        elif status_filter.lower() == "returned":
            query["returned"] = True
        else:
            query["status"] = {"$regex": status_filter, "$options": "i"}
            
    if q and q.strip():
        search_regex = {"$regex": q.strip(), "$options": "i"}
        query["$or"] = [
            {"product_name": search_regex},
            {"order_number": search_regex},
            {"retailer": search_regex},
        ]
        
    try:
        total_orders = await db.db["shopping_orders"].count_documents(query)
        total_pages = max(1, math.ceil(total_orders / limit))
        skip = (page - 1) * limit
        
        cursor = (
            db.db["shopping_orders"]
            .find(query)
            .sort([("order_date", -1), ("created_at", -1)])
            .skip(skip)
            .limit(limit)
        )
        
        orders_list = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            orders_list.append(ShoppingOrder(**doc))
            
        gmail_status = await get_gmail_status(user_id)
        
        return ShoppingHistoryResponse(
            orders=orders_list,
            total=total_orders,
            page=page,
            limit=limit,
            total_pages=total_pages,
            connected=gmail_status.get("connected", False),
            last_synced_at=gmail_status.get("last_synced_at"),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch shopping history: {str(e)}",
        )
