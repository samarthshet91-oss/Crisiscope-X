
from pathlib import Path

import pandas as pd


DATA_FILE = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "disaster_alerts.csv"
)

REQUIRED_COLUMNS = {
    "alert_id",
    "event_type",
    "location",
    "severity",
    "people_affected",
    "status",
}

VALID_SEVERITIES = {"Low", "Medium", "High", "Critical"}
VALID_STATUSES = {"Active", "Monitoring", "Resolved"}


def load_disaster_alerts() -> pd.DataFrame:
    """Load and validate disaster alerts from the CSV dataset."""
    if not DATA_FILE.is_file():
        raise FileNotFoundError(
            f"Disaster dataset not found: {DATA_FILE}"
        )

    df = pd.read_csv(DATA_FILE)

    missing_columns = REQUIRED_COLUMNS - set(df.columns)
    if missing_columns:
        raise ValueError(
            f"Missing required columns: {sorted(missing_columns)}"
        )

    # Preserve the original column names and any additional columns.
    df = df.copy()

    # Validate required text fields.
    text_columns = [
        "alert_id",
        "event_type",
        "location",
        "severity",
        "status",
    ]

    for column in text_columns:
        df[column] = df[column].astype("string").str.strip()

        if df[column].isna().any() or df[column].eq("").any():
            raise ValueError(
                f"Column '{column}' contains missing or empty values."
            )

    # Alert IDs must uniquely identify records.
    if df["alert_id"].duplicated().any():
        duplicates = df.loc[
            df["alert_id"].duplicated(keep=False), "alert_id"
        ].tolist()
        raise ValueError(f"Duplicate alert IDs found: {duplicates}")

    # Validate numeric impact data without silently coercing bad values.
    df["people_affected"] = pd.to_numeric(
        df["people_affected"], errors="raise"
    )

    if df["people_affected"].isna().any():
        raise ValueError("'people_affected' cannot contain missing values.")

    if (
        df["people_affected"].lt(0).any()
        or df["people_affected"].mod(1).ne(0).any()
    ):
        raise ValueError(
            "'people_affected' must contain non-negative whole numbers."
        )

    # Standardize severity and status for consistent downstream logic.
    df["severity"] = df["severity"].str.title()
    df["status"] = df["status"].str.title()

    invalid_severities = set(df["severity"].dropna()) - VALID_SEVERITIES
    if invalid_severities:
        raise ValueError(
            f"Invalid severity values: {sorted(invalid_severities)}"
        )

    invalid_statuses = set(df["status"].dropna()) - VALID_STATUSES
    if invalid_statuses:
        raise ValueError(
            f"Invalid status values: {sorted(invalid_statuses)}"
        )

    return df
