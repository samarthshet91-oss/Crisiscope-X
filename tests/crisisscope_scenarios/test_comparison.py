from pathlib import Path

from crisisscope_scenarios import apply_events, compare_scenarios, load_scenario, network_summary


SCENARIO_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "scenarios"
    / "bengaluru_flood_demo.json"
)


def test_baseline_intervention_comparison_reports_route_delta_and_changes():
    baseline = load_scenario(SCENARIO_PATH)
    intervention = apply_events(baseline)

    report = compare_scenarios(baseline, intervention)

    assert report["baseline_scenario_id"] == report["intervention_scenario_id"]
    assert report["road_status_changes"] == [
        {"entity_id": "R2", "baseline_value": "open", "intervention_value": "closed"}
    ]
    route = report["route_comparisons"][0]
    assert route["origin_id"] == "N1"
    assert route["destination_id"] == "N4"
    assert route["baseline"]["travel_time_minutes"] == 10.0
    assert route["intervention"]["travel_time_minutes"] == 16.0
    assert route["travel_time_delta_minutes"] == 6.0
    assert report["baseline_network"]["open_road_count"] == 4
    assert report["intervention_network"]["open_road_count"] == 3
    assert baseline["roads"][1]["status"] == "open"


def test_network_summary_is_repeatable_and_tracks_directed_reachability():
    scenario = load_scenario(SCENARIO_PATH)

    first = network_summary(scenario)
    second = network_summary(scenario)

    assert first == second
    assert first["node_count"] == 4
    assert first["reachable_node_ids_by_origin"]["N1"] == ["N1", "N2", "N3", "N4"]
    assert first["is_fully_reachable"] is False


def test_comparison_includes_facility_demand_and_rainfall_changes():
    baseline = load_scenario(SCENARIO_PATH)
    intervention = apply_events(
        baseline,
        [
            {"id": "E2", "type": "facility_unavailability", "target_id": "F1", "value": "unavailable"},
            {"id": "E3", "type": "demand_change", "target_id": "D1", "value": 25},
            {"id": "E4", "type": "rainfall_change", "target_id": "rainfall", "value": {"value_mm": 75, "duration_hours": 2}},
        ],
    )

    report = compare_scenarios(baseline, intervention)

    assert report["facility_status_changes"][0]["intervention_value"] == "unavailable"
    assert report["demand_changes"][0]["intervention_value"] == 25
    assert report["rainfall"]["changed"] is True