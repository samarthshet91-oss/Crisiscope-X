import json
from pathlib import Path

import pytest

from crisisscope_scenarios import (
    ScenarioValidationError,
    apply_events,
    load_scenario,
    shortest_path,
)


SCENARIO_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "scenarios"
    / "bengaluru_flood_demo.json"
)


def test_closing_road_applies_to_copy_and_preserves_baseline():
    scenario = load_scenario(SCENARIO_PATH)
    baseline_road_status = scenario["roads"][1]["status"]

    result = apply_events(scenario)

    assert result is not scenario
    assert scenario["roads"][1]["status"] == baseline_road_status == "open"
    assert result["roads"][1]["status"] == "closed"
    assert shortest_path(scenario, "N1", "N4")["travel_time_minutes"] == 10.0
    route = shortest_path(result, "N1", "N4")
    assert route["travel_time_minutes"] == 16.0
    assert route["road_ids"] == ["R3", "R4"]


def test_all_supported_event_kinds_apply_deterministically():
    scenario = load_scenario(SCENARIO_PATH)
    events = [
        {"id": "E2", "type": "facility_unavailability", "target_id": "F1", "value": "unavailable"},
        {"id": "E3", "type": "demand_change", "target_id": "D1", "value": 35},
        {"id": "E4", "type": "rainfall_change", "target_id": "rainfall", "value": {"value_mm": 90, "duration_hours": 2}},
    ]

    result = apply_events(scenario, events)

    assert result["facilities"][0]["status"] == "unavailable"
    assert result["demand"][0]["demand_units"] == 35
    assert result["rainfall"]["value_mm"] == 90
    assert result["rainfall"]["duration_hours"] == 2
    assert scenario["facilities"][0]["status"] == "available"
    assert scenario["demand"][0]["demand_units"] == 20
    assert scenario["rainfall"]["value_mm"] == 120


def test_empty_event_override_returns_independent_unchanged_copy():
    scenario = load_scenario(SCENARIO_PATH)

    result = apply_events(scenario, [])

    assert result["events"] == []
    assert result["roads"] == scenario["roads"]
    assert result is not scenario
    assert result["nodes"] is not scenario["nodes"]


def test_invalid_event_override_is_rejected():
    scenario = load_scenario(SCENARIO_PATH)
    bad_events = [{"id": "E2", "type": "unknown", "target_id": "R1", "value": "x"}]

    with pytest.raises(ScenarioValidationError, match="unsupported type"):
        apply_events(scenario, bad_events)
    assert scenario["roads"][0]["status"] == "open"


def test_disconnected_route_is_reported_as_unreachable():
    scenario = load_scenario(SCENARIO_PATH)
    for road in scenario["roads"]:
        road["status"] = "closed"

    result = shortest_path(scenario, "N1", "N4")

    assert result["reachable"] is False
    assert result["travel_time_minutes"] is None
    assert result["node_ids"] == []


def test_roads_are_traversed_in_the_declared_direction():
    scenario = load_scenario(SCENARIO_PATH)

    result = shortest_path(scenario, "N4", "N1")

    assert result["reachable"] is False