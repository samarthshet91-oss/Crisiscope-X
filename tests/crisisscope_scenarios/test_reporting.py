import json
from pathlib import Path

from crisisscope_scenarios import (
    apply_events,
    build_validation_report,
    load_scenario,
    write_comparison_report,
    write_validation_report,
)


SCENARIO_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "scenarios"
    / "bengaluru_flood_demo.json"
)


def test_validation_report_is_deterministic_and_keeps_provenance_clear():
    scenario = load_scenario(SCENARIO_PATH)

    first = build_validation_report(scenario)
    second = build_validation_report(scenario)

    assert first == second
    assert first["valid"] is True
    assert first["scenario_id"] == "BLR-FLOOD-DEMO-001"
    assert first["provenance"] == {
        "scenario_type": "synthetic",
        "is_live_data": False,
        "geographic_validation": "not_verified",
    }
    assert first["counts"] == {
        "nodes": 4,
        "roads": 4,
        "facilities": 1,
        "demand": 1,
        "events": 1,
    }
    assert "generated_at" not in first


def test_invalid_scenario_report_contains_validation_errors():
    scenario = load_scenario(SCENARIO_PATH)
    scenario["events"][0]["target_id"] = "UNKNOWN_ROAD"

    report = build_validation_report(scenario)

    assert report["valid"] is False
    assert any("unknown road" in error for error in report["errors"])


def test_written_report_is_repeatable_utf8_json(tmp_path):
    scenario = load_scenario(SCENARIO_PATH)
    first_path = write_validation_report(scenario, tmp_path / "one.json")
    second_path = write_validation_report(scenario, tmp_path / "nested" / "two.json")

    assert first_path.read_bytes() == second_path.read_bytes()
    assert json.loads(first_path.read_text(encoding="utf-8"))["valid"] is True

def test_comparison_report_is_repeatable_and_contains_expected_route_delta(tmp_path):
    baseline = load_scenario(SCENARIO_PATH)
    intervention = apply_events(baseline)
    first_path = write_comparison_report(
        baseline, intervention, tmp_path / "comparison-one.json"
    )
    second_path = write_comparison_report(
        baseline, intervention, tmp_path / "nested" / "comparison-two.json"
    )

    assert first_path.read_bytes() == second_path.read_bytes()
    report = json.loads(first_path.read_text(encoding="utf-8"))
    assert report["route_comparisons"][0]["travel_time_delta_minutes"] == 6.0
    assert report["road_status_changes"][0]["entity_id"] == "R2"