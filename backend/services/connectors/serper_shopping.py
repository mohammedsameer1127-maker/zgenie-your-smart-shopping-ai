import logging
import httpx
from typing import List, Optional, Any, Dict
from backend.core.config import settings
from backend.models.product import (
    IntentPayload,
    NormalizedProduct,
    parse_price_to_float,
    clean_platform_name
)
from backend.services.connectors.base import BaseShoppingConnector
from backend.services.connectors.query_builder import build_search_query
from backend.services.cache import get_cached_products, set_cached_products

logger = logging.getLogger(__name__)

SERPER_SHOPPING_URL = "https://google.serper.dev/shopping"

class SerperShoppingConnector(BaseShoppingConnector):
    """
    Serper.dev Google Shopping data connector.
    Fetches real-time shopping pricing from Serper.dev API as primary connector.
    """

    @property
    def name(self) -> str:
        return "serper"

    async def search(self, intent: IntentPayload) -> List[NormalizedProduct]:
        """
        Executes Google Shopping search via Serper.dev, parses response into
        NormalizedProduct schema, and caches successful results.
        Fails safely and returns [] on any failure.
        """
        query = build_search_query(intent)
        if not query:
            return []

        # 1. Check Cache
        cached_results = await get_cached_products(query, self.name)
        if cached_results is not None:
            return cached_results

        # 2. Check API Key
        api_key = settings.SERPER_API_KEY.strip()
        if not api_key:
            logger.info("SERPER_API_KEY is not configured, skipping primary Serper connector.")
            return []

        headers = {
            "X-API-KEY": api_key,
            "Content-Type": "application/json"
        }

        payload = {
            "q": query,
            "gl": "in",
            "hl": "en",
            "num": intent.limit or 20
        }

        try:
            logger.info(f"Calling Serper.dev Google Shopping API for query: '{query}'")
            async with httpx.AsyncClient(timeout=12.0) as client:
                response = await client.post(SERPER_SHOPPING_URL, headers=headers, json=payload)

                if response.status_code != 200:
                    logger.warning(
                        f"Serper.dev request failed with status {response.status_code}: {response.text[:200]}"
                    )
                    return []

                data = response.json()
                shopping_items = data.get("shopping", [])
                if not shopping_items:
                    logger.info(f"Serper.dev returned 0 shopping results for query '{query}'")
                    return []

                normalized_products: List[NormalizedProduct] = []
                for item in shopping_items:
                    try:
                        product = self._parse_item(item)
                        if product:
                            normalized_products.append(product)
                    except Exception as item_err:
                        logger.debug(f"Skipping malformed Serper item: {item_err}")
                        continue

                if normalized_products:
                    await set_cached_products(query, self.name, normalized_products)

                return normalized_products

        except Exception as e:
            logger.warning(f"Serper.dev shopping connector error for query '{query}': {e}")
            return []

    def _parse_item(self, item: Dict[str, Any]) -> Optional[NormalizedProduct]:
        title = item.get("title")
        if not title:
            return None

        price = parse_price_to_float(item.get("price"))
        source_name = item.get("source") or item.get("merchant") or "Online Store"
        platform = clean_platform_name(str(source_name))
        image_url = item.get("imageUrl") or item.get("thumbnail") or None
        product_url = item.get("link") or None

        rating = None
        if item.get("rating") is not None:
            try:
                rating = float(item["rating"])
            except (ValueError, TypeError):
                rating = None

        reviews_count = None
        if item.get("ratingCount") is not None:
            try:
                reviews_count = int(item["ratingCount"])
            except (ValueError, TypeError):
                reviews_count = None

        delivery = item.get("delivery") or None

        return NormalizedProduct(
            title=str(title).strip(),
            price=price,
            original_price=None,
            currency="INR",
            platform=platform,
            image_url=image_url,
            product_url=product_url,
            rating=rating,
            reviews_count=reviews_count,
            source="serper",
            delivery=delivery,
            offers=[],
            raw_data=item
        )

serper_connector = SerperShoppingConnector()
