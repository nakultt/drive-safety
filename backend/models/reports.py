from __future__ import annotations

"""
Pydantic models for Report requests and responses.
"""

from pydantic import BaseModel
from typing import Optional


class ReportRequest(BaseModel):
    start_date: str
    end_date: str
    violation_type: Optional[str] = None


class ReportResponse(BaseModel):
    start_date: str
    end_date: str
    violation_type: Optional[str] = None
    total_violations: int = 0
    by_type: dict = {}
    by_camera: dict = {}
    by_status: dict = {}
    top_vehicles: list[dict] = []
    daily_counts: list[dict] = []


class DailyDigestResponse(BaseModel):
    digest: str
    generated_at: str
    stats: dict = {}
