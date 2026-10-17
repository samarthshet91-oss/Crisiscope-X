
from typing import Any

import pandas as pd

from backend.data_loader import load_disaster_alerts


def get_disaster_summary(
    df: pd.DataFrame | None = None,
) -> dict[str, Any]:
    """Return summary metrics for validated disaster alerts."""
    if df is None:
        df = load_disaster_alerts()

    if df.empty:
        return {
            "total_alerts": 0,
            "active_alerts": 0,
            "regions_monitored": 0,
            "people_affected": 0,
            "severity_counts": {},
        }

    required_columns = {
        "alert_id",
        "event_type",
        "location",
        "severity",
        "people_affected",
        "status",
    }

    missing = required_columns - set(df.columns)
    if missing:
        raise ValueError(
            f"Missing required columns: {sorted(missing)}"
        )

    if df["people_affected"].isna().any():
        raise ValueError("'people_affected' contains missing values.")

    if pd.to_numeric(
        df["people_affected"], errors="coerce"
    ).isna().any():
        raise ValueError("'people_affected' must be numeric.")

    affected = pd.to_numeric(df["people_affected"], errors="raise")

    if affected.lt(0).any() or affected.mod(1).ne(0).any():
        raise ValueError(
            "'people_affected' must contain non-negative whole numbers."
        )

    return {
        "total_alerts": int(len(df)),
        "active_alerts": int(
            df["status"].str.casefold().eq("active").sum()
        ),
        "regions_monitored": int(df["location"].nunique()),
        "people_affected": int(affected.sum()),
        "severity_counts": {
            str(severity): int(count)
            for severity, count in (
                df["severity"].value_counts().items()
            )
        },
    }
