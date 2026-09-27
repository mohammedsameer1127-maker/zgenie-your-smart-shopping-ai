from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone

class RetailerProductResult(BaseModel):
    """
    Normalized data structure representing a verified listing retrieved
    directly from an online retailer's live source.
    """
    retailer: str = Field(..., description="Retailer name e.g. Amazon, Flipkart, Croma")
    title: str = Field(..., description="Product title on retailer")
    product_url: Optional[str] = Field(None, description="Direct verified product URL")
    image_url: Optional[str] = Field(None, description="Product image URL")
    price: Optional[float] = Field(None, description="Current selling price in INR")
    original_price: Optional[float] = Field(None, description="MRP / Original price if available")
    discount: Optional[str] = Field(None, description="Calculated or provided discount string")
    currency: str = Field("INR", description="Currency code")
    availability: bool = Field(True, description="True if available in stock")
    stock_status: str = Field("AVAILABLE", description="AVAILABLE, OUT_OF_STOCK, NOT_FOUND, UNAVAILABLE")
    seller: Optional[str] = Field(None, description="Merchant or verified seller name")
    brand: Optional[str] = Field(None, description="Extracted brand")
    model: Optional[str] = Field(None, description="Extracted model")
    model_number: Optional[str] = Field(None, description="Model number or SKU")
    ram: Optional[str] = Field(None, description="Extracted RAM specification")
    storage: Optional[str] = Field(None, description="Extracted Storage specification")
    color: Optional[str] = Field(None, description="Extracted Color specification")
    variant: Optional[str] = Field(None, description="Full variant descriptor e.g. 8GB RAM / 256GB")
    product_id: Optional[str] = Field(None, description="ASIN, FSN, SKU or unique retailer product ID")
    source: str = Field("live_retailer", description="Source provider or connector name")
    fetched_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    model_config = {
        "extra": "ignore"
    }

class BaseRetailerConnector(ABC):
    """
    Abstract base class for independent retailer shopping search adapters.
    """
    @property
    @abstractmethod
    def name(self) -> str:
        """Retailer display name (e.g. 'Amazon', 'Flipkart')"""
        pass

    @property
    @abstractmethod
    def domain(self) -> str:
        """Retailer primary domain (e.g. 'amazon.in', 'flipkart.com')"""
        pass

    @abstractmethod
    async def search_products(self, query: str, limit: int = 10) -> List[RetailerProductResult]:
        """
        Queries the live retailer data source and returns unverified parsed candidate listings.
        """
        pass
