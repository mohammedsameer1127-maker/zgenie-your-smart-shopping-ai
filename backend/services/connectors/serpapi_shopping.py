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

SERPAPI_SEARCH_URL = "https://serpapi.com/search.json"

class SerpApiShoppingConnector(BaseShoppingConnector):
    """
    SerpApi Google Shopping data connector for ZGenie.
    Fetches real-time shopping pricing from Google Shopping engine via SerpApi.
    Used as an additive backup/alternative connector with 1-hour MongoDB caching.
    """

    @property
    def name(self) -> str:
        return "serpapi"

    async def search(self, intent: IntentPayload) -> List[NormalizedProduct]:
        """
        Executes Google Shopping search via SerpApi, parses the response into
        NormalizedProduct schema, and caches successful results.
        Fails safely and returns [] on any network, quota, or parsing failure.
        """
        query = build_search_query(intent)
        if not query:
            logger.warning("SerpApi connector received empty search query")
            return []

        # 1. Check Cache
        cached_results = await get_cached_products(query, self.name)
        if cached_results is not None:
            return cached_results

        # 2. Check API Key
        api_key = settings.SERPAPI_KEY.strip()
        if not api_key:
            logger.warning("SERPAPI_KEY is not configured in environment or settings.")
            return []

        params = {
            "engine": "google_shopping",
            "q": query,
            "api_key": api_key,
            "google_domain": "google.co.in",
            "gl": "in",
            "hl": "en",
            "num": intent.limit or 20
        }

        try:
            logger.info(f"Calling SerpApi Google Shopping engine for query: '{query}'")
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(SERPAPI_SEARCH_URL, params=params)

                if response.status_code != 200:
                    logger.error(
                        f"SerpApi request failed with status {response.status_code}: {response.text[:300]}"
                    )
                    return []

                payload = response.json()
                
                # Check for SerpApi error key
                if "error" in payload:
                    logger.error(f"SerpApi returned error message: {payload['error']}")
                    return []

                shopping_results = payload.get("shopping_results", [])
                if not shopping_results:
                    logger.info(f"SerpApi returned 0 shopping results for query '{query}'")
                    return []

                normalized_products: List[NormalizedProduct] = []
                for item in shopping_results:
                    try:
                        product = self._parse_item(item)
                        if product:
                            normalized_products.append(product)
                    except Exception as item_err:
                        logger.debug(f"Skipping malformed SerpApi shopping item: {item_err}")
                        continue

                logger.info(
                    f"Successfully parsed {len(normalized_products)} products from SerpApi for query '{query}'"
                )

                # Cache successful results
                if normalized_products:
                    await set_cached_products(query, self.name, normalized_products)

                return normalized_products

        except httpx.TimeoutException as e:
            logger.warning(f"SerpApi request timed out for query '{query}': {e}")
            return []
        except httpx.RequestError as e:
            logger.warning(f"SerpApi network request error for query '{query}': {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error in SerpApi shopping connector for query '{query}': {e}", exc_info=True)
            return []

    def _parse_item(self, item: Dict[str, Any]) -> Optional[NormalizedProduct]:
        """
        Parses a raw SerpApi shopping item into NormalizedProduct.
        Handles missing / malformed fields gracefully.
        """
        title = item.get("title")
        if not title or not isinstance(title, str):
            return None

        # Price parsing
        price = None
        if "extracted_price" in item and item["extracted_price"] is not None:
            price = parse_price_to_float(item["extracted_price"])
        elif "price" in item and item["price"] is not None:
            price = parse_price_to_float(item["price"])

        # Original / Old price parsing if available
        original_price = None
        if "extracted_old_price" in item and item["extracted_old_price"] is not None:
            original_price = parse_price_to_float(item["extracted_old_price"])
        elif "old_price" in item and item["old_price"] is not None:
            original_price = parse_price_to_float(item["old_price"])

        # Platform / Merchant
        source_name = item.get("source") or item.get("merchant") or item.get("seller") or "Online Store"
        platform = clean_platform_name(str(source_name))

        # Thumbnail / Image
        image_url = item.get("thumbnail") or item.get("image") or None

        # Link / Destination
        product_url = item.get("link") or item.get("product_link") or None

        # Rating parsing
        rating = None
        raw_rating = item.get("rating")
        if raw_rating is not None:
            try:
                rating = float(raw_rating)
            except (ValueError, TypeError):
                rating = None

        # Reviews count parsing
        reviews_count = None
        raw_reviews = item.get("reviews") or item.get("reviews_count")
        if raw_reviews is not None:
            try:
                if isinstance(raw_reviews, (int, float)):
                    reviews_count = int(raw_reviews)
                else:
                    # Clean string review count (e.g. "1.2k reviews", "(450)")
                    cleaned_rev = "".join(filter(str.isdigit, str(raw_reviews)))
                    reviews_count = int(cleaned_rev) if cleaned_rev else None
            except (ValueError, TypeError):
                reviews_count = None

        # Delivery details
        delivery = item.get("delivery") or item.get("shipping") or None

        # Promotional offers / badges / extensions
        offers = []
        extensions = item.get("extensions", [])
        if isinstance(extensions, list):
            offers.extend([str(ext) for ext in extensions if ext])
        tag = item.get("tag")
        if tag and str(tag) not in offers:
            offers.append(str(tag))

        return NormalizedProduct(
            title=title.strip(),
            price=price,
            original_price=original_price,
            currency="INR",
            platform=platform,
            image_url=image_url,
            product_url=product_url,
            rating=rating,
            reviews_count=reviews_count,
            source="serpapi",
            delivery=delivery,
            offers=offers,
            raw_data=item
        )

serpapi_connector = SerpApiShoppingConnector()
