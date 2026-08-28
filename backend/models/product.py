from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
import re

def parse_price_to_float(price_val: Any) -> Optional[float]:
    """
    Safely strips currency symbols (₹, $, Rs, Rs., INR, etc.), commas, and whitespace
    to parse into a float value. Handles abbreviation dots (e.g. 'Rs. 54,999') and 
    thousand separators properly. Validates that price is positive and non-zero.
    """
    if price_val is None:
        return None
    if isinstance(price_val, (int, float)):
        val = float(price_val)
        return val if val > 0 else None
    
    price_str = str(price_val).strip()
    if not price_str or "-" in price_str:
        return None

    # 1. Remove text currency identifiers (Rs., Rs, INR, USD, EUR, etc.)
    price_str = re.sub(r"(?i)\b(rs\.|rs|inr|usd|eur|gbp)\b", "", price_str).strip()
    
    # 2. Remove currency symbols
    price_str = re.sub(r"[₹$€£¥]", "", price_str).strip()

    # 3. Check if there is a decimal cents/paise part at the end (e.g. .50 or .00)
    # If the last separator is followed by exactly 2 digits at the end of the string
    decimal_match = re.search(r"[.,](\d{2})$", price_str)
    cents_part = ""
    if decimal_match:
        cents_part = "." + decimal_match.group(1)
        price_str = price_str[:decimal_match.start()]

    # 4. Remove all remaining non-digits (commas, dots, spaces)
    clean_digits = re.sub(r"[^\d]", "", price_str)
    if not clean_digits:
        return None

    full_num_str = clean_digits + cents_part
    try:
        val = float(full_num_str)
        return val if val > 0 else None
    except (ValueError, TypeError):
        return None

AUTHORIZED_STORES = {
    "amazon": "Amazon",
    "flipkart": "Flipkart",
    "croma": "Croma",
    "reliance": "Reliance Digital",
    "blinkit": "Blinkit",
    "myntra": "Myntra",
    "meesho": "Meesho",
    "tatacliq": "Tata CLiQ",
    "tata cliq": "Tata CLiQ",
    "ajio": "AJIO",
    "zepto": "Zepto",
    "swiggy": "Swiggy Instamart",
    "instamart": "Swiggy Instamart",
    "jiomart": "JioMart",
    "vijay sales": "Vijay Sales",
    "vijaysales": "Vijay Sales",
    "apple": "Apple Official",
    "samsung": "Samsung Store",
    "oneplus": "OnePlus Store",
}

def get_authorized_platform_name(source: Optional[str]) -> Optional[str]:
    """
    Standardize platform / merchant names and verify if store is authorized.
    Returns None if platform is not in the authorized platforms whitelist.
    """
    if not source:
        return None
    s_lower = source.strip().lower()
    for key, name in AUTHORIZED_STORES.items():
        if key in s_lower:
            return name
    return None

def clean_platform_name(source: Optional[str]) -> str:
    """
    Standardize platform / merchant names to common display names.
    """
    auth = get_authorized_platform_name(source)
    if auth:
        return auth
    return (source or "Online Store").strip()

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
    status: str = Field("success", description="Status code: success, no_match_found")
    message: Optional[str] = Field(None, description="Human-readable status or guidance message")
    products: List[NormalizedProduct]
