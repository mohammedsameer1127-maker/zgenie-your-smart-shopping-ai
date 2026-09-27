from typing import List
from backend.retailers.base import BaseRetailerConnector, RetailerProductResult
from backend.retailers.utils import fetch_retailer_live_listings

class MyntraConnector(BaseRetailerConnector):
    @property
    def name(self) -> str:
        return "Myntra"

    @property
    def domain(self) -> str:
        return "myntra.com"

    async def search_products(self, query: str, limit: int = 10) -> List[RetailerProductResult]:
        return await fetch_retailer_live_listings(
            retailer_name=self.name,
            domain=self.domain,
            query=query,
            limit=limit
        )

myntra_connector = MyntraConnector()
