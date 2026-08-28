from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class OrderItem(BaseModel):
    name: str = Field(..., description="Item or product name")
    price: Optional[float] = Field(None, description="Item price")
    quantity: int = Field(1, description="Item quantity")
    image: Optional[str] = Field(None, description="Item thumbnail image URL")

class ShoppingOrder(BaseModel):
    id: Optional[str] = Field(None, description="MongoDB Document ID")
    user_id: str = Field(..., description="Firebase User UID")
    retailer: str = Field(..., description="Retailer/Platform name (Amazon, Flipkart, Myntra, Meesho, Blinkit, Croma, Reliance Digital)")
    platform: Optional[str] = Field(None, description="Alias for retailer")
    product_name: str = Field(..., description="Name or summary of the ordered product")
    product_image: Optional[str] = Field(None, description="Product image cutout or thumbnail URL")
    order_number: Optional[str] = Field(None, description="Retailer Order Number / ID")
    order_id: Optional[str] = Field(None, description="Alias for order_number")
    items: List[OrderItem] = Field(default_factory=list, description="Parsed order items with name, price, quantity")
    order_date: Optional[str] = Field(None, description="Date the order was placed (YYYY-MM-DD)")
    order_time: Optional[str] = Field(None, description="Time the order was placed or updated")
    amount: Optional[float] = Field(None, description="Total order amount")
    currency: str = Field("INR", description="Currency symbol or ISO code")
    status: str = Field("Order Placed", description="Current lifecycle status")
    delivered: bool = Field(False, description="Whether order has been delivered")
    returned: bool = Field(False, description="Whether order was returned")
    refunded: bool = Field(False, description="Whether refund has been processed")
    refund_amount: Optional[float] = Field(None, description="Processed refund amount")
    source: str = Field("gmail", description="Import source")
    email_message_id: Optional[str] = Field(None, description="Gmail message ID")
    source_email_id: Optional[str] = Field(None, description="Alias for email_message_id")
    email_subject: Optional[str] = Field(None, description="Email subject snippet")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Record creation time")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Record update time")

class ShoppingHistoryResponse(BaseModel):
    orders: List[ShoppingOrder] = Field(default_factory=list, description="List of shopping orders")
    total: int = Field(0, description="Total order count matching criteria")
    page: int = Field(1, description="Current page number")
    limit: int = Field(20, description="Page limit size")
    total_pages: int = Field(1, description="Total pages available")
    connected: bool = Field(False, description="Whether user has connected Gmail")
    last_synced_at: Optional[datetime] = Field(None, description="Last sync timestamp")
