from __future__ import annotations

"""
Pydantic models for Analytics responses.
"""

from pydantic import BaseModel
from typing import Optional


class SummaryResponse(BaseModel):
    today_total: int = 0
    week_total: int = 0
    month_total: int = 0
    by_type: dict = {}
    by_camera: dict = {}
    hourly_heatmap: list[int] = []
    top_locations: list[dict] = []


class TrendPoint(BaseModel):
    date: str
    count: int


class TrendsResponse(BaseModel):
    period: str
    data: list[TrendPoint]


class TypeCount(BaseModel):
    violation_type: str
    count: int


class CameraCount(BaseModel):
    camera_id: str
    count: int


class HeatmapPoint(BaseModel):
    lat: float
    lng: float
    weight: int


class PeakHourPoint(BaseModel):
    hour: int
    count: int


class HotspotCluster(BaseModel):
    lat: float
    lng: float
    count: int
    dominant_type: str
