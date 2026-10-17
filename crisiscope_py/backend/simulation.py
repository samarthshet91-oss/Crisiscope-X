
"""Controlled hypothetical disaster scenarios for CRISCOPE-X."""

import math

import pandas as pd


SEVERITY_WEIGHTS = {
    "Low": 1,
    "Medium": 2,
    "High": 3,
    "Critical": 4,
}


def simulate_disaster(
    event_type: str,
    location: str,
    severity: str,
    people_affected: int,
) -> dict:
    """Create a hypothetical disaster scenario and calculate demo risk."""

    if not isinstance(event_type, str) or not event_type.strip():
        raise ValueError("Disaster type cannot be empty.")

    if not isinstance(location, str) or not location.strip():
        raise ValueError("Location cannot be empty.")

    if severity not in SEVERITY_WEIGHTS:
        raise ValueError(
            "Severity must be Low, Medium, High, or Critical."
        )

    if (
        isinstance(people_affected, bool)
        or not isinstance(people_affected, int)
        or people_affected < 0
    ):
        raise ValueError(
            "People affected must be a non-negative whole number."
        )

    # Same illustrative formula used by the existing risk engine.
    risk_points = SEVERITY_WEIGHTS[severity] * (
        1 + math.log10(1 + people_affected)
    )

    if risk_points <= 5:
        risk_category = "Low"
    elif risk_points <= 10:
        risk_category = "Medium"
    elif risk_points <= 15:
        risk_category = "High"
    else:
        risk_category = "Critical"

    return {
        "event_type": event_type.strip(),
        "location": location.strip(),
        "severity": severity,
        "people_affected": people_affected,
        "risk_points": round(risk_points, 2),
        "risk_category": risk_category,
        "mode": "Simulation",
        "is_simulated": True,
    }


def compare_scenarios(scenarios: list[dict]) -> pd.DataFrame:
    """Convert generated scenarios into a comparison table."""

    if not scenarios:
        return pd.DataFrame(
            columns=[
                "event_type",
                "location",
                "severity",
                "people_affected",
                "risk_points",
                "risk_category",
                "mode",
                "is_simulated",
            ]
        )

    return pd.DataFrame(scenarios)
