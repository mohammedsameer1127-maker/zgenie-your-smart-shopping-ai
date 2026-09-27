from typing import List
from backend.retailers.base import BaseRetailerConnector, RetailerProductResult
from backend.retailers.utils import fetch_retailer_live_listings

class BlinkitConnector(BaseRetailerConnector):
    @property
    def name(self) -> str:
        return "Blinkit"

    @property
    def domain(self) -> str:
        return "blinkit.com"

    async def search_products(self, query: str, limit: int = 10) -> List[RetailerProductResult]:
        return await fetch_retailer_live_listings(
            retailer_name=self.name,
            domain=self.domain,
            query=query,
            limit=limit
        )

blinkit_connector = BlinkitConnector()
