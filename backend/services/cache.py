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

async def get_cached_products(query: str, source: str, allow_stale: bool = False) -> Optional[List[NormalizedProduct]]:
    """
    Retrieves cached products from MongoDB products_cache collection or in-memory fallback.
    If allow_stale is True and TTL expired, marks products with is_stale=True rather than returning None.
    """
    query_hash = compute_query_hash(query, source)
    now = datetime.now(timezone.utc)
    
    # 1. Try MongoDB first
    try:
        if db.db is not None:
            doc = await db.db["products_cache"].find_one({
                "query_hash": query_hash,
                "source": source
            })
            if doc and "products" in doc:
                created_at = doc.get("created_at")
                if created_at:
                    if created_at.tzinfo is None:
                        created_at = created_at.replace(tzinfo=timezone.utc)
                    is_expired = (now - created_at).total_seconds() >= CACHE_TTL_SECONDS
                    if not is_expired:
                        logger.info(f"Products cache HIT (MongoDB Live) for '{query}' [{source}]")
                        return [NormalizedProduct(**p) for p in doc["products"]]
                    elif allow_stale:
                        logger.info(f"Products cache HIT (MongoDB Stale fallback) for '{query}' [{source}]")
                        stale_prods = []
                        for p in doc["products"]:
                            np = NormalizedProduct(**p)
                            np.is_stale = True
                            np.verification_status = "STALE"
                            stale_prods.append(np)
                        return stale_prods
    except Exception as e:
        logger.debug(f"MongoDB cache lookup notice: {e}")

    # 2. Fallback to in-memory cache
    if query_hash in _IN_MEMORY_CACHE:
        entry = _IN_MEMORY_CACHE[query_hash]
        created_at = entry.get("created_at")
        is_expired = (now - created_at).total_seconds() >= CACHE_TTL_SECONDS
        if not is_expired:
            logger.info(f"Products cache HIT (Memory Live) for '{query}' [{source}]")
            return [NormalizedProduct(**p) for p in entry["products"]]
        elif allow_stale:
            logger.info(f"Products cache HIT (Memory Stale fallback) for '{query}' [{source}]")
            stale_prods = []
            for p in entry["products"]:
                np = NormalizedProduct(**p)
                np.is_stale = True
                np.verification_status = "STALE"
                stale_prods.append(np)
            return stale_prods
        else:
            del _IN_MEMORY_CACHE[query_hash]

    return None

async def set_cached_products(
    query: str,
    source_or_products: Any = None,
    products: Optional[List[NormalizedProduct]] = None,
    source: Optional[str] = None
) -> None:
    """
    Saves successful product search results in MongoDB products_cache, retailer_products, and price_history collections.
    Supports both signatures:
    - set_cached_products(query, source, products)
    - set_cached_products(query, products, source="...")
    """
    if isinstance(source_or_products, list):
        actual_products = source_or_products
        actual_source = source or "default"
    else:
        actual_source = source or (str(source_or_products) if source_or_products else "default")
        actual_products = products or []

    if not actual_products:
        return
    
    query_hash = compute_query_hash(query, actual_source)
    now = datetime.now(timezone.utc)
    products_data = [p.model_dump() for p in actual_products]

    # 1. Save in in-memory cache
    _IN_MEMORY_CACHE[query_hash] = {
        "query_hash": query_hash,
        "query": query,
        "source": actual_source,
        "products": products_data,
        "created_at": now
    }

    # 2. Save in MongoDB products_cache, retailer_products, and price_history collections
    try:
        if db.db is not None:
            await db.db["products_cache"].update_one(
                {"query_hash": query_hash, "source": actual_source},
                {
                    "$set": {
                        "query_hash": query_hash,
                        "query": query,
                        "source": actual_source,
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

            for p in actual_products:
                selling_p = p.selling_price or p.price
                mrp_val = p.mrp or p.original_price
                if selling_p and selling_p > 0:
                    retailer_doc = {
                        "query": query,
                        "product_name": p.title,
                        "retailer": p.platform,
                        "retailer_product_id": p.retailer_product_id,
                        "price": selling_p,
                        "selling_price": selling_p,
                        "original_price": mrp_val,
                        "mrp": mrp_val,
                        "currency": p.currency or "INR",
                        "availability": p.availability,
                        "is_verified": p.is_verified,
                        "verification_status": p.verification_status,
                        "coupon_discount": p.coupon_discount,
                        "bank_discount": p.bank_discount,
                        "exchange_bonus": p.exchange_bonus,
                        "delivery_charges": p.delivery_charges,
                        "variant": p.variant,
                        "brand": p.brand,
                        "model": p.model,
                        "seller": p.seller,
                        "product_url": p.product_url,
                        "image_url": p.image_url,
                        "delivery_info": p.delivery,
                        "source": p.source,
                        "retrieval_timestamp": p.last_updated or now.isoformat(),
                        "freshness_status": "LIVE" if not p.is_stale else "STALE",
                        "expires_at": (now + timedelta(seconds=CACHE_TTL_SECONDS)).isoformat()
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
                        "selling_price": selling_p,
                        "mrp": mrp_val,
                        "currency": p.currency or "INR",
                        "product_url": p.product_url,
                        "recorded_at": now
                    })

            logger.info(f"Products cache & Price History SAVED (MongoDB & Memory) for '{query}' [{actual_source}] ({len(actual_products)} items)")
    except Exception as e:
        logger.debug(f"MongoDB cache & price history save notice: {e}")

