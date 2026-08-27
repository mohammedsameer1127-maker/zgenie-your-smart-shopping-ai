from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
import re

def parse_price_to_float(price_val: Any) -> Optional[float]:
    """
    Safely strips currency symbols (₹, $, Rs, etc.), commas, and whitespace
    to parse into a float value. Defaults to None if unable to parse.
    """
    if price_val is None:
        return None
    if isinstance(price_val, (int, float)):
        return float(price_val)
    
    price_str = str(price_val).strip()
    if not price_str:
        return None
    
    # Remove currency symbols, commas, and letters except numbers and decimal point
    cleaned = re.sub(r"[^\d.]", "", price_str)
    if not cleaned:
        return None
    
    try:
        # Handle multiple dots if any (e.g. 1.299.00 -> 1299.00)
        parts = cleaned.split(".")
        if len(parts) > 2:
            cleaned = "".join(parts[:-1]) + "." + parts[-1]
        return float(cleaned)
    except (ValueError, TypeError):
        return None

def clean_platform_name(source: Optional[str]) -> str:
    """
    Standardize platform / merchant names to common display names.
    """
    if not source:
        return "Online Store"
    s = source.strip()
    s_lower = s.lower()
    if "amazon" in s_lower:
        return "Amazon"
    if "flipkart" in s_lower:
        return "Flipkart"
    if "blinkit" in s_lower:
        return "Blinkit"
    if "croma" in s_lower:
        return "Croma"
    if "reliance" in s_lower:
        return "Reliance Digital"
    if "meesho" in s_lower:
        return "Meesho"
    if "myntra" in s_lower:
        return "Myntra"
    if "tata" in s_lower:
        return "Tata CLiQ"
    if "zepto" in s_lower:
        return "Zepto"
    if "swiggy" in s_lower or "instamart" in s_lower:
        return "Swiggy Instamart"
    return s

class IntentPayload(BaseModel):
    query: str = Field(..., description="Main user search query or product name")
    keywords: Optional[List[str]] = Field(default_factory=list, description="Extracted keywords")
    category: Optional[str] = Field(None, description="Inferred or selected category")
    brand: Optional[str] = Field(None, description="Inferred brand name")
    min_price: Optional[float] = Field(None, description="Optional minimum price filter")
    max_price: Optional[float] = Field(None, description="Optional maximum price filter")
    limit: Optional[int] = Field(20, description="Max number of results to fetch")

    model_config = {
        "extra": "ignore"
    }

class NormalizedProduct(BaseModel):
    title: str = Field(..., description="Product title / name")
    price: Optional[float] = Field(None, description="Cleaned numerical price in currency")
    original_price: Optional[float] = Field(None, description="Original list price / MRP if discounted")
    currency: str = Field("INR", description="Currency symbol or 3-letter code")
    platform: str = Field(..., description="Source / merchant name (e.g. Amazon, Flipkart, Blinkit)")
    image_url: Optional[str] = Field(None, description="Product image / thumbnail URL")
    product_url: Optional[str] = Field(None, description="Product destination link")
    rating: Optional[float] = Field(None, description="Rating out of 5.0")
    reviews_count: Optional[int] = Field(None, description="Total number of reviews")
    source: str = Field("serpapi", description="Connector source name (serpapi, serper, catalog)")
    delivery: Optional[str] = Field(None, description="Delivery timeframe / note")
    offers: Optional[List[str]] = Field(default_factory=list, description="Extracted promotional offers or badges")
    raw_data: Optional[Dict[str, Any]] = Field(None, description="Raw provider payload for reference")

    model_config = {
        "extra": "ignore"
    }

class ComparisonResponse(BaseModel):
    query: str
    source_connector: str
    total_results: int
    from_cache: bool = False
    products: List[NormalizedProduct]
