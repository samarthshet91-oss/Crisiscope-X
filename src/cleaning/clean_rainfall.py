"""Normalize tabular rainfall sources while retaining invalid rows for audit."""
from __future__ import annotations
import pandas as pd
from src.validation.checks import normalize_rainfall, normalize_timestamp, validate_coordinates
from src.validation.checks import stable_id


def clean_rainfall(frame: pd.DataFrame, *, timestamp_col: str, rainfall_col: str,
                   latitude_col: str | None = None, longitude_col: str | None = None,
                   station_col: str | None = None, unit: str = "mm", source_timezone: str = "UTC") -> tuple[pd.DataFrame, pd.DataFrame]:
    missing = [c for c in (timestamp_col, rainfall_col) if c not in frame.columns]
    if missing: raise ValueError(f"Required rainfall columns missing: {missing}")
    if station_col and station_col not in frame.columns: raise ValueError(f"Station column missing: {station_col}")
    accepted, rejected = [], []
    seen=set()
    for index, row in frame.iterrows():
        reasons = []
        try:
            observed = normalize_timestamp(row[timestamp_col], source_timezone)
            rain = normalize_rainfall(row[rainfall_col], unit)
        except Exception as exc:
            reasons.append(f"normalization_error:{type(exc).__name__}")
            observed, rain = None, None
        if latitude_col and longitude_col:
            reasons += validate_coordinates(row.get(latitude_col), row.get(longitude_col))
        identity = row.get(station_col) if station_col else (row.get(latitude_col),row.get(longitude_col)) if latitude_col and longitude_col else row.get("location_name", "city_aggregate")
        key = f"{observed.isoformat() if observed else row[timestamp_col]}|{identity}"
        if observed and key in seen: reasons.append("duplicate_observation")
        if observed: seen.add(key)
        record = row.to_dict()
        record.update(observed_at_utc=observed, rainfall_mm=rain, observation_key=stable_id("rain",key), quality_status="accepted")
        if reasons:
            record["quality_status"] = "rejected"
            record["rejection_reasons"] = reasons
            rejected.append(record)
        else: accepted.append(record)
    return pd.DataFrame(accepted), pd.DataFrame(rejected)
