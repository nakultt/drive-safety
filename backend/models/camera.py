from __future__ import annotations

"""
Pydantic models for Camera records.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CameraResponse(BaseModel):
    camera_id: str
    camera_source: str
    location_label: Optional[str] = None
    gps_lat: float
    gps_lng: float
    last_seen: datetime
    is_active: bool = True
    total_violations_detected: int = 0

    class Config:
        from_attributes = True


class CameraListResponse(BaseModel):
    data: list[CameraResponse]
    total: int
    page: int
    limit: int


class CameraUpdate(BaseModel):
    location_label: Optional[str] = None
    gps_lat: Optional[float] = None
    gps_lng: Optional[float] = None
