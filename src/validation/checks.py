"""Small deterministic quality checks shared by ingestion jobs and tests."""
from __future__ import annotations
import hashlib
import json
import math
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def stable_id(namespace: str, *parts: Any) -> str:
    value = "|".join(str(part).strip() for part in parts)
    return f"{namespace}-{hashlib.sha256(value.encode('utf-8')).hexdigest()[:20]}"


def normalize_rainfall(value: Any, unit: str = "mm") -> float:
    number = float(value)
    if not math.isfinite(number):
        raise ValueError("Rainfall must be a finite number")
    unit = unit.strip().lower()
    factors = {"mm": 1.0, "millimeter": 1.0, "millimeters": 1.0,
               "cm": 10.0, "centimeter": 10.0, "centimeters": 10.0,
               "in": 25.4, "inch": 25.4, "inches": 25.4}
    if unit not in factors:
        raise ValueError(f"Unsupported rainfall unit: {unit}")
    if number < 0:
        raise ValueError("Rainfall cannot be negative")
    return number * factors[unit]


def normalize_timestamp(value: Any, source_timezone: str = "UTC") -> datetime:
    import pandas as pd
    if value is None or pd.isna(value):
        raise ValueError("Timestamp is missing")
    stamp = pd.Timestamp(value)
    if pd.isna(stamp):
        raise ValueError("Timestamp is invalid")
    if stamp.tzinfo is None:
        stamp = stamp.tz_localize(source_timezone)
    return stamp.tz_convert("UTC").to_pydatetime()


def validate_coordinates(latitude: Any, longitude: Any) -> list[str]:
    issues = []
    try:
        lat, lon = float(latitude), float(longitude)
        if not math.isfinite(lat) or not math.isfinite(lon):
            return ["missing_or_non_numeric_coordinates"]
        if not -90 <= lat <= 90: issues.append("latitude_out_of_range")
        if not -180 <= lon <= 180: issues.append("longitude_out_of_range")
    except (TypeError, ValueError):
        issues.append("missing_or_non_numeric_coordinates")
    return issues


def quality_report(dataset_name: str, source: str, rows_read: int,
                   accepted: int, rejected: int, issues: list[dict[str, Any]]) -> dict[str, Any]:
    return {"dataset_name": dataset_name, "source": source, "generated_at": datetime.now(timezone.utc).isoformat(),
            "rows_read": rows_read, "accepted_count": accepted, "rejected_count": rejected,
            "warning_count": sum(i.get("severity") == "warning" for i in issues),
            "error_count": sum(i.get("severity", "error") == "error" for i in issues), "issues": issues}


def save_report(report: dict[str, Any], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
