import json
from pathlib import Path

import pytest

from crisisscope_scenarios import (
    ScenarioLoadError,
    ScenarioValidationError,
    load_scenario,
    validate_scenario,
)


SCENARIO_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "scenarios"
    / "bengaluru_flood_demo.json"
)


def scenario_copy():
    return json.loads(SCENARIO_PATH.read_text(encoding="utf-8"))


def test_demo_scenario_is_valid():
    scenario = load_scenario(SCENARIO_PATH)
    assert validate_scenario(scenario) == []


def test_missing_road_endpoint_is_rejected():
    scenario = scenario_copy()
    scenario["roads"][0]["to"] = "UNKNOWN_NODE"

    errors = validate_scenario(scenario)

    assert any("unknown node" in error for error in errors)


def test_invalid_coordinates_are_rejected():
    scenario = scenario_copy()
    scenario["nodes"][0]["latitude"] = 200

    errors = validate_scenario(scenario)

    assert any("latitude" in error for error in errors)


def test_duplicate_identifier_is_rejected():
    scenario = scenario_copy()
    scenario["nodes"][1]["id"] = scenario["nodes"][0]["id"]

    assert any("Duplicate id" in error for error in validate_scenario(scenario))


def test_malformed_collection_items_are_reported_without_crashing():
    scenario = scenario_copy()
    scenario["nodes"] = [None]

    errors = validate_scenario(scenario)

    assert any("nodes[0] must be an object" in error for error in errors)


def test_unhashable_road_reference_is_reported_without_crashing():
    scenario = scenario_copy()
    scenario["roads"][0]["to"] = {"id": "N2"}

    errors = validate_scenario(scenario)

    assert any("references unknown node" in error for error in errors)


def test_boolean_is_not_accepted_as_a_coordinate_or_travel_time():
    scenario = scenario_copy()
    scenario["nodes"][0]["latitude"] = True
    scenario["roads"][0]["travel_time_minutes"] = False

    errors = validate_scenario(scenario)

    assert any("latitude" in error for error in errors)
    assert any("positive finite travel time" in error for error in errors)


def test_observed_scenario_requires_source_references():
    scenario = scenario_copy()
    scenario["provenance"]["scenario_type"] = "observed"
    scenario["provenance"].pop("notice")

    errors = validate_scenario(scenario)

    assert any("must include provenance.source_references" in error for error in errors)


def test_unknown_event_type_is_rejected():
    scenario = scenario_copy()
    scenario["events"][0]["type"] = "unsupported_event"

    assert any("unsupported type" in error for error in validate_scenario(scenario))


def test_invalid_json_has_a_file_error_with_location(tmp_path):
    path = tmp_path / "broken.json"
    path.write_text("{invalid", encoding="utf-8")

    with pytest.raises(ScenarioLoadError, match="line 1, column"):
        load_scenario(path)


def test_invalid_scenario_load_error_exposes_messages(tmp_path):
    path = tmp_path / "invalid.json"
    path.write_text("{}", encoding="utf-8")

    with pytest.raises(ScenarioValidationError) as captured:
        load_scenario(path)

    assert captured.value.errors
    assert "Missing required fields" in str(captured.value)


def test_missing_file_raises_scenario_load_error(tmp_path):
    with pytest.raises(ScenarioLoadError, match="Could not load scenario"):
        load_scenario(tmp_path / "missing.json")

def test_unhashable_enum_values_are_reported_without_crashing():
    scenario = scenario_copy()
    scenario["provenance"]["scenario_type"] = []
    scenario["provenance"]["geographic_validation"] = {}
    scenario["roads"][0]["status"] = []
    scenario["facilities"][0]["status"] = {}
    scenario["demand"][0]["source_type"] = []
    scenario["events"][0]["value"] = {}

    errors = validate_scenario(scenario)

    assert any("scenario_type" in error for error in errors)
    assert any("geographic_validation" in error for error in errors)
    assert any("invalid status" in error for error in errors)
    assert any("unsupported source_type" in error for error in errors)
    assert any("must use value='open' or 'closed'" in error for error in errors)


def test_extremely_large_integer_is_rejected_without_crashing():
    scenario = scenario_copy()
    scenario["rainfall"]["value_mm"] = 10**10000

    errors = validate_scenario(scenario)

    assert any("rainfall.value_mm" in error for error in errors)


def test_observed_source_reference_requires_iso_date():
    scenario = scenario_copy()
    scenario["provenance"]["scenario_type"] = "observed"
    scenario["provenance"]["source_references"] = [
        {"id": "S1", "title": "Example", "url": "https://example.test", "retrieved_at": "20260101"}
    ]

    errors = validate_scenario(scenario)

    assert any("retrieved_at must be an ISO date" in error for error in errors)

def test_empty_node_list_is_rejected():
    scenario = scenario_copy()
    scenario["nodes"] = []

    errors = validate_scenario(scenario)

    assert any("nodes must contain at least one node" in error for error in errors)