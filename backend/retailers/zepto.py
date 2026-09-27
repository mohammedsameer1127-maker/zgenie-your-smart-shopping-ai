from typing import List
from backend.retailers.base import BaseRetailerConnector, RetailerProductResult
from backend.retailers.utils import fetch_retailer_live_listings

class ZeptoConnector(BaseRetailerConnector):
    @property
    def name(self) -> str:
        return "Zepto"

    @property
    def domain(self) -> str:
        return "zeptonow.com"

    async def search_products(self, query: str, limit: int = 10) -> List[RetailerProductResult]:
        return await fetch_retailer_live_listings(
            retailer_name=self.name,
            domain=self.domain,
            query=query,
            limit=limit
        )

zepto_connector = ZeptoConnector()
