import logging
from typing import List, Dict, Tuple, Optional
from backend.core.config import settings
from backend.models.product import IntentPayload, NormalizedProduct
from backend.services.connectors.base import BaseShoppingConnector
from backend.services.connectors.serper_shopping import serper_connector
from backend.services.connectors.serpapi_shopping import serpapi_connector

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
    raw = getattr(settings, "CONNECTOR_FALLBACK_ORDER", "serper,serpapi")
    order = [name.strip().lower() for name in raw.split(",") if name.strip()]
    return order or ["serper", "serpapi"]

class ShoppingConnectorManager:
    """
    Orchestrates product search across configured data connectors in fallback order.
    If the primary connector returns zero results or fails, invokes the next connector.
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
        Returns (products, winning_connector_name).
        If all fail, returns ([], "none").
        """
        fallback_order = custom_order or get_configured_fallback_order()
        logger.info(f"Initiating shopping search for '{intent.query}' with connector sequence: {fallback_order}")

        for connector_name in fallback_order:
            connector = self.registry.get(connector_name)
            if not connector:
                logger.warning(f"Connector '{connector_name}' in fallback order is not registered. Skipping.")
                continue

            try:
                results = await connector.search(intent)
                if results and len(results) > 0:
                    logger.info(
                        f"Connector '{connector_name}' succeeded with {len(results)} results for '{intent.query}'"
                    )
                    return results, connector_name
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

        logger.warning(f"All connectors in fallback sequence {fallback_order} returned 0 results for '{intent.query}'")
        return [], "none"

connector_manager = ShoppingConnectorManager()
