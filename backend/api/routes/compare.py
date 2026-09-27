from fastapi import APIRouter, Query, HTTPException, status
from typing import Optional, List
import logging
from backend.models.product import IntentPayload, NormalizedProduct, ComparisonResponse, RetailerStatusItem
from backend.retailers.manager import retailer_manager
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/compare", tags=["compare"])

TRACKED_RETAILERS = [
    "Amazon",
    "Flipkart",
    "Croma",
    "Reliance Digital",
    "Zepto",
    "iPlanet",
    "Vijay Sales",
    "Blinkit",
    "JioMart",
    "Myntra",
    "Meesho",
    "Tata CLiQ",
    "AJIO"
]

@router.get("/config")
async def get_compare_config():
    """
    Returns active retailer connectors and tracked stores list.
    """
    return {
        "available_connectors": [c.name for c in retailer_manager.connectors],
        "tracked_retailers": TRACKED_RETAILERS,
        "fallback_order": TRACKED_RETAILERS
    }

@router.get("/search", response_model=ComparisonResponse)
@router.post("/search", response_model=ComparisonResponse)
async def search_and_compare(
    q: Optional[str] = Query(None, description="Search query string"),
    intent_body: Optional[IntentPayload] = None
):
    """
    Searches for exact-match live product prices across configured online retailers
    (Amazon, Flipkart, Croma, Reliance Digital, Meesho, Myntra, Tata CLiQ, Blinkit).
    Never returns demo items, static catalogue substitutes, estimated prices, or wrong variants.
    """
    query_str = (intent_body.query if intent_body else q) or ""
    if not query_str.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query 'q' or intent payload is required."
        )

    search_query = query_str.strip()
    res_data = await retailer_manager.search_all_retailers(search_query)

    return ComparisonResponse(**res_data)
