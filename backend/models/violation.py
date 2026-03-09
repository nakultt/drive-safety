from __future__ import annotations

"""
Pydantic models for Violation requests and responses.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class BoundingBox(BaseModel):
    x: float
    y: float
    w: float
    h: float
    label: str
    confidence: float


class EventData(BaseModel):
    """Schema for the JSON data field in POST /api/events."""
    violation_type: str = Field(..., description="Type of violation detected")
    confidence: float = Field(..., ge=0.0, le=1.0)
    timestamp: str = Field(..., description="ISO 8601 timestamp")
    camera_source: str = Field(..., description="Camera source type")
    camera_id: str = Field(..., description="Camera unit identifier")
    gps_lat: float
    gps_lng: float
    location_label: Optional[str] = None
    bounding_boxes: list[BoundingBox] = []


class BatchEventItem(BaseModel):
    """Schema for a single item in POST /api/events/batch."""
    violation_type: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    timestamp: str
    camera_source: str
    camera_id: str
    gps_lat: float
    gps_lng: float
    location_label: Optional[str] = None
    bounding_boxes: list[BoundingBox] = []
    image_base64: str = Field(..., description="Base64 encoded image")


class BatchEventRequest(BaseModel):
    events: list[BatchEventItem]


class ViolationResponse(BaseModel):
    """Response model for a single violation record."""
    violation_id: str
    violation_type: str
    confidence: float
    timestamp: datetime
    camera_source: str
    camera_id: str
    gps_lat: float
    gps_lng: float
    location_label: Optional[str] = None
    number_plate: Optional[str] = None
    plate_confidence: Optional[float] = None
    image_path: Optional[str] = None
    annotated_image_path: Optional[str] = None
    plate_image_path: Optional[str] = None
    bounding_boxes: list[BoundingBox] = []
    ai_summary: Optional[str] = None
    status: str = "pending"
    deleted: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class ViolationListResponse(BaseModel):
    data: list[ViolationResponse]
    total: int
    page: int
    limit: int


class StatusUpdate(BaseModel):
    status: str = Field(..., description="New status: pending, reviewed, actioned, dismissed")
