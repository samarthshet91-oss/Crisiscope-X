"""Unit tests for CrisiscopeX cleaning, validation, scenarios, and DB config."""

import pandas as pd
import pytest

from src.cleaning.clean_geospatial import clean_geospatial
from src.cleaning.clean_rainfall import clean_rainfall
from src.scenarios.generate_scenario import build_scenario
from src.validation.checks import (
    normalize_rainfall,
    normalize_timestamp,
    quality_report,
    stable_id,
    validate_coordinates,
)


def test_rainfall_normalization_and_units():
    assert normalize_rainfall(8.5, "cm") == 85
    assert (
        normalize_timestamp("2024-07-01 12:00", "Asia/Kolkata").isoformat()
        == "2024-07-01T06:30:00+00:00"
    )

    for value in (-1, float("nan")):
        with pytest.raises(ValueError):
            normalize_rainfall(value)
    with pytest.raises(ValueError):
        normalize_timestamp(None)


def test_coordinates_ids_and_quality_report():
    assert validate_coordinates(91, 77) == ["latitude_out_of_range"]
    assert validate_coordinates(float("nan"), 77) == [
        "missing_or_non_numeric_coordinates"
    ]
    assert stable_id("x", "a", 2) == stable_id("x", "a", 2)
    report = quality_report("d", "s", 2, 1, 1, [{"severity": "error"}])
    assert report["error_count"] == 1


def test_rainfall_cleaner_quarantines_invalid_observations():
    source = pd.DataFrame(
        {"time": ["2024-01-01", "bad"], "rain": [2, -1], "lat": [12, 12], "lon": [77, 77]}
    )

    accepted, rejected = clean_rainfall(
        source,
        timestamp_col="time",
        rainfall_col="rain",
        latitude_col="lat",
        longitude_col="lon",
    )

    assert len(accepted) == 1
    assert accepted.iloc[0].rainfall_mm == 2
    assert len(rejected) == 1
    assert rejected.iloc[0].quality_status == "rejected"
    assert rejected.iloc[0].rejection_reasons


def test_rainfall_cleaner_requires_configured_columns():
    with pytest.raises(ValueError, match="Required rainfall columns missing"):
        clean_rainfall(pd.DataFrame({"time": ["2024-01-01"]}), timestamp_col="time", rainfall_col="rain")
    with pytest.raises(ValueError, match="Station column missing"):
        clean_rainfall(
            pd.DataFrame({"time": ["2024-01-01"], "rain": [1]}),
            timestamp_col="time",
            rainfall_col="rain",
            station_col="station",
        )


def test_rainfall_duplicate_is_quarantined():
    source = pd.DataFrame(
        {"time": ["2024-01-01", "2024-01-01"], "rain": [2, 2], "station": ["S1", "S1"]}
    )

    accepted, rejected = clean_rainfall(
        source, timestamp_col="time", rainfall_col="rain", station_col="station"
    )

    assert len(accepted) == 1
    assert len(rejected) == 1
    assert "duplicate_observation" in rejected.iloc[0].rejection_reasons


def test_monthly_imd_cleaner_keeps_resolution_and_skips_lpa(tmp_path):
    from src.cleaning.clean_imd_monthly import clean_imd_monthly

    source = tmp_path / "rain.csv"
    output = tmp_path / "processed" / "sample.csv"
    source.write_text(
        "Year,Jan,Feb,Mar,Apr,May,June,July,Aug,Sept,Oct,Nov,Dec\n"
        "2025,1,2,3,4,5,6,7,8,9,10,11,12\n"
        "LPA,1,2,3,4,5,6,7,8,9,10,11,12\n",
        encoding="utf-8",
    )

    accepted, rejected, report = clean_imd_monthly(
        source, output, years={2025}, months={5, 6}
    )

    assert len(accepted) == 2
    assert rejected.empty
    assert set(accepted.raw_attributes.map(lambda value: value["temporal_resolution"])) == {
        "monthly"
    }
    assert report["rows_read"] == 2
    assert output.exists()


def test_daily_district_cleaner_selects_rural_and_uses_utc(tmp_path):
    from src.cleaning.clean_imd_daily_district import clean_imd_daily_district

    source = tmp_path / "daily.csv"
    output = tmp_path / "processed" / "daily.csv"
    source.write_text(
        "State,District,Date,Daily Actual,Daily Normal,Daily Category\n"
        "KARNATAKA,BANGALORE RURAL,2026-08-19,4.2,3.1,E\n"
        "KARNATAKA,MYSORE,2026-08-19,8.0,5.0,LE\n",
        encoding="utf-8",
    )

    accepted, rejected, report = clean_imd_daily_district(source, output)

    assert len(accepted) == 1
    assert rejected.empty
    row = accepted.iloc[0]
    assert row.rainfall_mm == 4.2
    assert row.observed_at_utc == "2026-08-18T18:30:00+00:00"
    assert row.latitude is None
    assert row.longitude is None
    assert row.raw_attributes["temporal_resolution"] == "daily"
    assert report["rows_outside_selected_district"] == 1
    assert output.exists()


def test_scenario_is_explicitly_synthetic_and_stable():
    scenario = build_scenario()

    assert scenario["scenario_id"] == "BLR-FLOOD-001"
    assert scenario["data_mode"] == "synthetic"
    assert scenario["events"]
    assert all(
        event["source_type"] == "synthetic" and event["asset_id"] is None
        for event in scenario["events"]
    )


def test_networkx_dependency_imports():
    import networkx as nx

    assert nx.__version__


def test_geojson_cleaning_preserves_line_geometry_and_reports_counts(tmp_path):
    import geopandas as gpd
    from shapely.geometry import LineString

    source = tmp_path / "lines.geojson"
    output = tmp_path / "processed" / "lines.geojson"
    original = gpd.GeoDataFrame(
        {
            "osm_id": ["way/7"],
            "name": ["sample"],
            "geometry": [LineString([(77.5, 12.9), (77.6, 13.0)])],
        },
        crs="EPSG:4326",
    ).to_crs("EPSG:3857")
    original.to_file(source, driver="GeoJSON")

    cleaned, report = clean_geospatial(source, output, id_column="osm_id")

    assert len(cleaned) == 1
    assert cleaned.geometry.iloc[0].geom_type == "LineString"
    assert abs(cleaned.geometry.iloc[0].coords[0][0] - 77.5) < 0.001
    assert cleaned.iloc[0].asset_id.startswith("asset-")
    assert cleaned.iloc[0].source_crs == "EPSG:3857"
    assert report["accepted_count"] == 1
    assert output.exists()
    reloaded = gpd.read_file(output)
    assert len(reloaded) == 1
    assert reloaded.geometry.iloc[0].geom_type == "LineString"


def test_database_url_requires_postgresql_and_fails_clearly(monkeypatch):
    from src.database.connection import get_engine

    monkeypatch.delenv("DATABASE_URL", raising=False)
    with pytest.raises(RuntimeError, match="DATABASE_URL is missing"):
        get_engine()

    monkeypatch.setenv("DATABASE_URL", "sqlite:///not-allowed.db")
    with pytest.raises(RuntimeError, match="must use PostgreSQL"):
        get_engine()
