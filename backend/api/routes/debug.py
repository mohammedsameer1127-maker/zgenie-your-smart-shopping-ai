import time
from fastapi import APIRouter, Query, HTTPException, status
from typing import Optional
from backend.core.config import settings
from backend.models.product import IntentPayload
from backend.services.connectors.serpapi_shopping import serpapi_connector
from backend.services.cache import compute_query_hash

router = APIRouter(prefix="/debug", tags=["debug"])

@router.get("/test-serpapi")
async def test_serpapi(
    q: str = Query("iphone 15", description="Product query to search on SerpApi Google Shopping")
):
    """
    Dev-only test endpoint to directly test SerpApi Google Shopping connector.
    Gated behind settings.ENABLE_DEBUG_ROUTES.
    """
    if not getattr(settings, "ENABLE_DEBUG_ROUTES", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Debug routes are disabled in current environment."
        )

    api_key_configured = bool(settings.SERPAPI_KEY and settings.SERPAPI_KEY.strip())
    masked_key = (
        f"{settings.SERPAPI_KEY[:4]}...{settings.SERPAPI_KEY[-4:]}"
        if api_key_configured and len(settings.SERPAPI_KEY) > 8
        else "NOT_SET"
    )

    intent = IntentPayload(query=q)
    start_time = time.time()
    results = await serpapi_connector.search(intent)
    duration_ms = round((time.time() - start_time) * 1000, 2)

    return {
        "success": True,
        "query": q,
        "api_key_configured": api_key_configured,
        "masked_api_key": masked_key,
        "duration_ms": duration_ms,
        "total_results": len(results),
        "query_hash": compute_query_hash(q, "serpapi"),
        "products": [p.model_dump() for p in results]
    }
