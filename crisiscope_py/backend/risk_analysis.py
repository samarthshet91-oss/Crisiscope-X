
"""Transparent, rule-based risk indicators for disaster alerts."""

import pandas as pd


SEVERITY_WEIGHTS = {
    "Low": 1,
    "Medium": 2,
    "High": 3,
    "Critical": 4,
}

REQUIRED_COLUMNS = {
    "alert_id",
    "severity",
    "people_affected",
}


def calculate_risk_indicators(
    df: pd.DataFrame,
) -> pd.DataFrame:
    """Return a copy of the alerts with rule-based risk indicators.

    Risk points = severity weight * (1 + log10(1 + people affected)).

    This is an illustrative prioritization heuristic, not a calibrated
    probability, an AI prediction, or an official emergency risk score.
    """
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(
            f"Missing required columns: {sorted(missing)}"
        )

    result = df.copy()

    if result["alert_id"].isna().any():
        raise ValueError("'alert_id' cannot contain missing values.")

    if result["alert_id"].astype("string").str.strip().eq("").any():
        raise ValueError("'alert_id' cannot be empty.")

    if result["alert_id"].duplicated().any():
        raise ValueError("'alert_id' values must be unique.")

    severity = result["severity"].astype("string").str.strip().str.title()
    invalid_severity = (
        severity.isna() | ~severity.isin(SEVERITY_WEIGHTS)
    )

    if invalid_severity.any():
        raise ValueError(
            "Each alert must have a valid severity: "
            "Low, Medium, High, or Critical."
        )

    affected = pd.to_numeric(
        result["people_affected"],
        errors="coerce",
    )

    if affected.isna().any():
        raise ValueError("'people_affected' must be numeric.")

    if (affected < 0).any() or (affected % 1 != 0).any():
        raise ValueError(
            "'people_affected' must contain non-negative whole numbers."
        )

    result["severity_weight"] = severity.map(SEVERITY_WEIGHTS).astype(int)
    result["people_affected"] = affected.astype("int64")

    result["risk_points"] = (
        result["severity_weight"]
        * (1 + (1 + result["people_affected"]).map(__import__("math").log10))
    ).round(2)

    return result

def assign_risk_category(df: pd.DataFrame) -> pd.DataFrame:
    """Assign illustrative categories based on risk points."""
    if "risk_points" not in df.columns:
        raise ValueError("Missing required column: risk_points")

    result = df.copy()

    result["risk_category"] = pd.cut(
        result["risk_points"],
        bins=[-float("inf"), 5, 10, 15, float("inf")],
        labels=["Low", "Medium", "High", "Critical"],
        include_lowest=True,
    )

    return result
