from fastapi import APIRouter, Query, HTTPException, status
from typing import Optional, List
import logging
from backend.models.product import IntentPayload, NormalizedProduct, ComparisonResponse
from backend.services.connectors.manager import connector_manager, get_configured_fallback_order
from backend.services.cache import get_cached_products

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/compare", tags=["compare"])

# Demo fallback catalog items if all connectors fail or are offline
DEMO_CATALOG: List[NormalizedProduct] = [
    NormalizedProduct(
        title="Apple iPhone 16 Pro (128GB - Desert Titanium)",
        price=119490.0,
        original_price=119900.0,
        currency="INR",
        platform="Blinkit",
        image_url="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
        product_url="https://blinkit.com/s/?q=Apple+iPhone+16+Pro",
        rating=4.9,
        reviews_count=8900,
        source="catalog",
        delivery="10-15 Min Instant Delivery",
        offers=["Instant 10-Min Delivery", "ICICI & SBI Cards ₹5,000 Instant Off"]
    ),
    NormalizedProduct(
        title="Apple iPhone 16 Pro (128GB - Desert Titanium)",
        price=119900.0,
        original_price=119900.0,
        currency="INR",
        platform="Amazon",
        image_url="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
        product_url="https://www.amazon.in/s?k=Apple+iPhone+16+Pro",
        rating=4.9,
        reviews_count=8900,
        source="catalog",
        delivery="Prime 1-Day Delivery",
        offers=["₹5,000 Instant Discount on ICICI/Kotak Cards"]
    ),
    NormalizedProduct(
        title="Apple iPhone 16 Pro (128GB - Desert Titanium)",
        price=119900.0,
        original_price=119900.0,
        currency="INR",
        platform="Flipkart",
        image_url="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
        product_url="https://www.flipkart.com/search?q=Apple+iPhone+16+Pro",
        rating=4.8,
        reviews_count=8900,
        source="catalog",
        delivery="Delivery in 2 Days",
        offers=["HDFC Bank ₹5,000 Instant Off"]
    ),
    NormalizedProduct(
        title="Apple iPhone 16 Pro (128GB - Desert Titanium)",
        price=119900.0,
        original_price=119900.0,
        currency="INR",
        platform="Croma",
        image_url="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
        product_url="https://www.croma.com/searchB?q=Apple+iPhone+16+Pro%3Arelevance",
        rating=4.9,
        reviews_count=8900,
        source="catalog",
        delivery="Same-Day Store Pickup / Express Delivery",
        offers=["Tata Neu 5% NeuCoins"]
    ),
    NormalizedProduct(
        title="Apple iPhone 16 Pro (128GB - Desert Titanium)",
        price=119900.0,
        original_price=119900.0,
        currency="INR",
        platform="Reliance Digital",
        image_url="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
        product_url="https://www.reliancedigital.in/search?q=Apple+iPhone+16+Pro:relevance",
        rating=4.9,
        reviews_count=8900,
        source="catalog",
        delivery="Express 3-Hour Delivery in Select Cities",
        offers=["OneCard & Axis Bank Instant ₹5,000 Off"]
    )
]

@router.get("/config")
async def get_compare_config():
    """
    Returns active connectors and fallback order configuration.
    """
    return {
        "fallback_order": get_configured_fallback_order(),
        "available_connectors": ["serper", "serpapi"]
    }

@router.get("/search", response_model=ComparisonResponse)
@router.post("/search", response_model=ComparisonResponse)
async def search_and_compare(
    q: Optional[str] = Query(None, description="Search query string"),
    intent_body: Optional[IntentPayload] = None
):
    """
    Searches for live product prices across online retailers using the
    connector pipeline (Serper -> SerpApi -> Catalog Demo Data fallback).
    """
    query_str = (intent_body.query if intent_body else q) or ""
    if not query_str.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query 'q' or intent payload is required."
        )

    intent = intent_body or IntentPayload(query=query_str)

    # Execute search with fallback order
    products, connector_used = await connector_manager.search_with_fallback(intent)

    if products and len(products) > 0:
        return ComparisonResponse(
            query=intent.query,
            source_connector=connector_used,
            total_results=len(products),
            from_cache=False,
            products=products
        )

    # Fallback to demo catalog
    logger.info(f"Using demo catalog fallback for comparison query '{intent.query}'")
    return ComparisonResponse(
        query=intent.query,
        source_connector="catalog_fallback",
        total_results=len(DEMO_CATALOG),
        from_cache=False,
        products=DEMO_CATALOG
    )
