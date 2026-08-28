import logging
from typing import List, Dict, Tuple, Optional
from backend.core.config import settings
from backend.models.product import IntentPayload, NormalizedProduct
from backend.services.connectors.base import BaseShoppingConnector
from backend.services.connectors.serper_shopping import serper_connector
from backend.services.connectors.serpapi_shopping import serpapi_connector
from backend.services.product_matcher import filter_exact_match_products

logger = logging.getLogger(__name__)

# Registry of all available shopping connectors
CONNECTOR_REGISTRY: Dict[str, BaseShoppingConnector] = {
    "serper": serper_connector,
    "serpapi": serpapi_connector,
}

def get_configured_fallback_order() -> List[str]:
    """
    Parses the configured fallback order from settings.CONNECTOR_FALLBACK_ORDER
    e.g. 'serper,serpapi' -> ['serper', 'serpapi']
    """
    raw = getattr(settings, "CONNECTOR_FALLBACK_ORDER", "serpapi,serper")
    order = [name.strip().lower() for name in raw.split(",") if name.strip()]
    return order or ["serpapi", "serper"]

class ShoppingConnectorManager:
    """
    Orchestrates product search across configured data connectors in fallback order.
    Applies strict exact-match product scoring to all connector results before returning.
    """

    def __init__(self, registry: Optional[Dict[str, BaseShoppingConnector]] = None):
        self.registry = registry or CONNECTOR_REGISTRY

    async def search_with_fallback(
        self,
        intent: IntentPayload,
        custom_order: Optional[List[str]] = None
    ) -> Tuple[List[NormalizedProduct], str]:
        """
        Executes search using the configured sequence of connectors.
        Applies strict exact-match product scoring to candidate items.
        Returns (exact_matched_products, winning_connector_name).
        If all fail or zero exact matches exist, returns ([], "none").
        """
        fallback_order = custom_order or get_configured_fallback_order()
        logger.info(f"Initiating shopping search for '{intent.query}' with connector sequence: {fallback_order}")

        for connector_name in fallback_order:
            connector = self.registry.get(connector_name)
            if not connector:
                logger.warning(f"Connector '{connector_name}' in fallback order is not registered. Skipping.")
                continue

            try:
                raw_results = await connector.search(intent)
                if raw_results and len(raw_results) > 0:
                    # Apply strict multi-signal product matcher
                    matched = filter_exact_match_products(intent.query, raw_results, min_similarity=0.85)
                    if matched and len(matched) > 0:
                        logger.info(
                            f"Connector '{connector_name}' succeeded with {len(matched)} exact-matched results (out of {len(raw_results)} raw) for '{intent.query}'"
                        )
                        return matched, connector_name
                    else:
                        logger.info(
                            f"Connector '{connector_name}' returned {len(raw_results)} raw items, but 0 passed strict exact matching for '{intent.query}'. Trying next connector..."
                        )
                else:
                    logger.info(
                        f"Connector '{connector_name}' returned 0 results for '{intent.query}', trying next fallback connector..."
                    )
            except Exception as e:
                logger.error(
                    f"Connector '{connector_name}' raised unexpected error during search for '{intent.query}': {e}",
                    exc_info=True
                )
                # Continue to next connector in fallback order

        logger.warning(f"All connectors in fallback sequence {fallback_order} returned 0 exact matches for '{intent.query}'")
        return [], "none"

connector_manager = ShoppingConnectorManager()
