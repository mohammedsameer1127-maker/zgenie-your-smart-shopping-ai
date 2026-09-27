import hashlib
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from backend.models.product import NormalizedProduct
from backend.db.mongodb import db

logger = logging.getLogger(__name__)

# In-memory fallback cache for dev / test environments without MongoDB
_IN_MEMORY_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL_SECONDS = 3600  # 1 Hour

def compute_query_hash(query: str, source: str) -> str:
    """
    Computes a SHA256 hash from normalized query and connector source name.
    """
    normalized = f"{query.strip().lower()}:{source.strip().lower()}"
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

async def get_cached_products(query: str, source: str) -> Optional[List[NormalizedProduct]]:
    """
    Retrieves cached products from MongoDB products_cache collection or in-memory fallback.
    Returns None if cache miss or expired.
    """
    query_hash = compute_query_hash(query, source)
    
    # 1. Try MongoDB first
    try:
        if db.db is not None:
            doc = await db.db["products_cache"].find_one({
                "query_hash": query_hash,
                "source": source
            })
            if doc and "products" in doc:
                created_at = doc.get("created_at")
                # Handle TTL check if manual check needed
                if created_at:
                    if created_at.tzinfo is None:
                        created_at = created_at.replace(tzinfo=timezone.utc)
                    now = datetime.now(timezone.utc)
                    if (now - created_at).total_seconds() < CACHE_TTL_SECONDS:
                        logger.info(f"Products cache HIT (MongoDB) for '{query}' [{source}]")
                        return [NormalizedProduct(**p) for p in doc["products"]]
    except Exception as e:
        logger.debug(f"MongoDB cache lookup notice: {e}")

    # 2. Fallback to in-memory cache
    if query_hash in _IN_MEMORY_CACHE:
        entry = _IN_MEMORY_CACHE[query_hash]
        created_at = entry.get("created_at")
        now = datetime.now(timezone.utc)
        if (now - created_at).total_seconds() < CACHE_TTL_SECONDS:
            logger.info(f"Products cache HIT (Memory) for '{query}' [{source}]")
            return [NormalizedProduct(**p) for p in entry["products"]]
        else:
            del _IN_MEMORY_CACHE[query_hash]

    return None

async def set_cached_products(query: str, source: str, products: List[NormalizedProduct]) -> None:
    """
    Saves successful product search results in MongoDB products_cache and in-memory cache with 1h TTL.
    """
    if not products:
        return
    
    query_hash = compute_query_hash(query, source)
    now = datetime.now(timezone.utc)
    products_data = [p.model_dump() for p in products]

    # 1. Save in in-memory cache
    _IN_MEMORY_CACHE[query_hash] = {
        "query_hash": query_hash,
        "query": query,
        "source": source,
        "products": products_data,
        "created_at": now
    }

    # 2. Save in MongoDB products_cache, retailer_products, and price_history collections
    try:
        if db.db is not None:
            await db.db["products_cache"].update_one(
                {"query_hash": query_hash, "source": source},
                {
                    "$set": {
                        "query_hash": query_hash,
                        "query": query,
                        "source": source,
                        "products": products_data,
                        "created_at": now,
                        "expires_at": now + timedelta(seconds=CACHE_TTL_SECONDS)
                    }
                },
                upsert=True
            )

            # Store individual verified retailer listings and append to price_history
            retailer_col = db.db["retailer_products"]
            history_col = db.db["price_history"]

            for p in products:
                if p.price and p.price > 0:
                    retailer_doc = {
                        "query": query,
                        "product_name": p.title,
                        "retailer": p.platform,
                        "retailer_product_id": p.retailer_product_id,
                        "price": p.price,
                        "original_price": p.original_price,
                        "currency": p.currency,
                        "availability": p.availability,
                        "seller": p.seller,
                        "product_url": p.product_url,
                        "image_url": p.image_url,
                        "delivery_info": p.delivery,
                        "source": p.source,
                        "last_updated": p.last_updated or now.isoformat(),
                    }
                    await retailer_col.update_one(
                        {"retailer": p.platform, "product_name": p.title},
                        {"$set": retailer_doc},
                        upsert=True
                    )

                    # Append historical price entry
                    await history_col.insert_one({
                        "product_name": p.title,
                        "retailer": p.platform,
                        "price": p.price,
                        "currency": p.currency,
                        "recorded_at": now
                    })

            logger.info(f"Products cache & Price History SAVED (MongoDB & Memory) for '{query}' [{source}] ({len(products)} items)")
    except Exception as e:
        logger.debug(f"MongoDB cache & price history save notice: {e}")

