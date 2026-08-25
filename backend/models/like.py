from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime

class LikeCreate(BaseModel):
    product_id: str = Field(..., description="Unique product ID or slug")
    product_name: str = Field(..., description="Name of the product")
    product_image: Optional[str] = Field(None, description="Image URL of the product")
    product_url: Optional[str] = Field(None, description="Direct URL of the product")
    platform: Optional[str] = Field(None, description="Retailer platform e.g. Amazon, Flipkart, etc.")
    price: Optional[Any] = Field(None, description="Current price")
    original_price: Optional[Any] = Field(None, description="Original price / MRP")
    rating: Optional[float] = Field(None, description="User rating")
    regret_score: Optional[str] = Field(None, description="AI Regret Score")
    category: Optional[str] = Field(None, description="Product category")

class LikeResponse(BaseModel):
    id: Optional[str] = None
    user_id: str
    product_id: str
    product_name: str
    product_image: Optional[str] = None
    product_url: Optional[str] = None
    platform: Optional[str] = None
    price: Optional[Any] = None
    original_price: Optional[Any] = None
    rating: Optional[float] = None
    regret_score: Optional[str] = None
    category: Optional[str] = None
    liked_at: datetime
