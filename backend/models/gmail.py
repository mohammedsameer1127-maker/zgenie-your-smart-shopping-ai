from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime

class GmailStatusResponse(BaseModel):
    connected: bool = Field(False, description="Whether user has connected their Gmail account")
    email: Optional[str] = Field(None, description="Connected Gmail email address")
    connected_at: Optional[Any] = Field(None, description="Timestamp when Gmail was connected")
    last_synced_at: Optional[Any] = Field(None, description="Timestamp of the most recent sync")
    sync_status: str = Field("idle", description="Current sync status: idle, syncing, success, error")
    total_orders: int = Field(0, description="Total number of imported orders")
    last_error: Optional[str] = Field(None, description="Error message if sync failed")

    model_config = {
        "extra": "ignore",
    }

class GmailSyncResponse(BaseModel):
    success: bool = Field(..., description="Whether the sync completed successfully")
    message: str = Field(..., description="Status summary message")
    total_found: int = Field(0, description="Total order-related emails found in Gmail")
    imported: int = Field(0, description="Number of newly imported orders")
    updated: int = Field(0, description="Number of updated existing orders")
    last_synced_at: Optional[Any] = Field(None, description="Timestamp of the sync completion")

    model_config = {
        "extra": "ignore",
    }
