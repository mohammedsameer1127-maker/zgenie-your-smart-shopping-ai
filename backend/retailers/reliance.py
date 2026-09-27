from typing import List
from backend.retailers.base import BaseRetailerConnector, RetailerProductResult
from backend.retailers.utils import fetch_retailer_live_listings

class RelianceConnector(BaseRetailerConnector):
    @property
    def name(self) -> str:
        return "Reliance Digital"

    @property
    def domain(self) -> str:
        return "reliancedigital.in"

    async def search_products(self, query: str, limit: int = 10) -> List[RetailerProductResult]:
        return await fetch_retailer_live_listings(
            retailer_name=self.name,
            domain=self.domain,
            query=query,
            limit=limit
        )

reliance_connector = RelianceConnector()
