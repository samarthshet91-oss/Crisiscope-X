"""Clean NWIC/IMD district-wise daily rainfall without changing its resolution."""
from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd

from src.validation.checks import normalize_rainfall, normalize_timestamp, quality_report, save_report, stable_id


def clean_imd_daily_district(source: Path, output_csv: Path, *, state: str = "KARNATAKA",
                             district: str = "BANGALORE RURAL") -> tuple[pd.DataFrame, pd.DataFrame, dict]:
    frame = pd.read_csv(source, encoding="utf-8-sig")
    # The downloaded NWIC file contains embedded newlines/typos in several headings.
    frame.columns = [" ".join(str(c).replace("\r", " ").replace("\n", " ").split()) for c in frame.columns]
    required = {"State", "District", "Date", "Daily Actual"}
    if not required.issubset(frame.columns):
        raise ValueError(f"NWIC daily rainfall file missing fields: {sorted(required - set(frame.columns))}")
    selected = frame[(frame.State.astype(str).str.strip().str.upper() == state.upper()) &
                     (frame.District.astype(str).str.strip().str.upper() == district.upper())].copy()
    accepted, rejected = [], []
    seen = set()
    for idx, row in selected.iterrows():
        reasons = []
        try:
            date = pd.to_datetime(row["Date"], errors="raise").date()
            # Source reports calendar dates; represent daily totals at local midnight, stored as UTC.
            observed = normalize_timestamp(f"{date.isoformat()}T00:00:00", "Asia/Kolkata")
            rain = normalize_rainfall(row["Daily Actual"], "mm")
        except (TypeError, ValueError, OverflowError):
            date, observed, rain = None, None, None
            reasons.append("invalid_date_or_daily_actual")
        identity = (state.upper(), district.upper(), date.isoformat() if date else str(row["Date"]))
        if identity in seen:
            reasons.append("duplicate_observation")
        seen.add(identity)
        rec = {"source_row": int(idx), "source_state": state, "source_district": district,
               "source_date": str(row["Date"]), "original_daily_actual": row["Daily Actual"],
               "original_unit": "mm", "temporal_resolution": "daily",
               "daily_normal_mm": row.get("Daily Normal"), "daily_category": row.get("Daily Category")}
        if reasons:
            rejected.append({**rec, "rejection_reasons": reasons})
            continue
        accepted.append({"observation_key": stable_id("rain", "india_imd_rain_daily", *identity),
                         "observed_at_utc": observed.isoformat(),
                         "location_name": "Bangalore Rural district, Karnataka",
                         "latitude": None, "longitude": None, "rainfall_mm": rain,
                         "source_type": "historical", "quality_status": "accepted", "raw_attributes": rec})
    result = pd.DataFrame(accepted)
    output_csv.parent.mkdir(parents=True, exist_ok=True)
    result.to_csv(output_csv, index=False)
    issues = [{"severity": "error", "reason": reason, "count": sum(reason in x["rejection_reasons"] for x in rejected)}
              for reason in sorted({r for x in rejected for r in x["rejection_reasons"]})]
    report = quality_report(source.name, "India Meteorological Department via NWIC", len(selected), len(accepted), len(rejected), issues)
    report.update(state=state, district=district, temporal_resolution="daily", units="mm",
                  coverage_dates=[str(selected.Date.min()), str(selected.Date.max())] if len(selected) else [],
                  rows_outside_selected_district=len(frame)-len(selected), rejected_records=rejected,
                  output_path=str(output_csv), source_timestamp_assumption="Source dates are daily calendar dates; observations use midnight Asia/Kolkata converted to UTC.")
    save_report(report, output_csv.parent.parent / "outputs" / f"{output_csv.stem}_quality.json")
    return result, pd.DataFrame(rejected), report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--state", default="KARNATAKA")
    parser.add_argument("--district", default="BANGALORE RURAL")
    args = parser.parse_args()
    _, _, report = clean_imd_daily_district(args.source, args.output, state=args.state, district=args.district)
    print(pd.Series({k: v for k, v in report.items() if k not in {"issues", "rejected_records"}}).to_json(indent=2))


if __name__ == "__main__":
    main()
