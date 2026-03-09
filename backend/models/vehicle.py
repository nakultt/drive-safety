from __future__ import annotations

"""
Pydantic models for Vehicle records.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class VehicleResponse(BaseModel):
    number_plate: str
    first_seen: datetime
    last_seen: datetime
    total_violations: int
    violation_types: list[str] = []
    violation_ids: list[str] = []
    risk_score: float = 0.0
    risk_level: str = "low"

    class Config:
        from_attributes = True


class VehicleListResponse(BaseModel):
    data: list[VehicleResponse]
    total: int
    page: int
    limit: int


class VehicleDetailResponse(BaseModel):
    vehicle: VehicleResponse
    violations: list[dict] = []
