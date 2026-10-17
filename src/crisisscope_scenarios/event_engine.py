"""Apply validated scenario events to an independent scenario copy."""

from __future__ import annotations

from collections.abc import Sequence
from copy import deepcopy
from typing import Any, cast

from .loader import ScenarioValidationError
from .models import Event, Scenario
from .validator import validate_scenario


def apply_events(
    scenario: Scenario, events: Sequence[Event] | None = None
) -> Scenario:
    """Apply events in list order and return a deep copy of ``scenario``.

    Road disruptions set a road to ``open`` or ``closed``. Facility events set
    a facility to ``unavailable``. Demand changes replace a record's absolute
    demand units. Rainfall changes replace both rainfall amount and duration.
    The source scenario and event objects are never mutated.
    """
    errors = validate_scenario(scenario)
    if errors:
        raise ScenarioValidationError(errors)

    if events is not None:
        if isinstance(events, (str, bytes)) or not isinstance(events, Sequence):
            raise ScenarioValidationError(["Event override must be a sequence of event objects."])
        selected_events = list(events)
    else:
        selected_events = list(scenario["events"])

    result_data: dict[str, Any] = deepcopy(dict(scenario))
    result_data["events"] = deepcopy(selected_events)
    errors = validate_scenario(result_data)
    if errors:
        raise ScenarioValidationError(errors)

    result = cast(Scenario, result_data)
    roads = {road["id"]: road for road in result["roads"]}
    facilities = {facility["id"]: facility for facility in result["facilities"]}
    demands = {record["id"]: record for record in result["demand"]}

    for event in result["events"]:
        if event["type"] == "road_disruption":
            roads[event["target_id"]]["status"] = event["value"]
        elif event["type"] == "facility_unavailability":
            facilities[event["target_id"]]["status"] = "unavailable"
        elif event["type"] == "demand_change":
            record = demands[event["target_id"]]
            record["demand_units"] = event["value"]
            if event.get("source_type") is not None:
                record["source_type"] = event["source_type"]
        elif event["type"] == "rainfall_change":
            rainfall = result["rainfall"]
            rainfall["value_mm"] = event["value"]["value_mm"]
            rainfall["duration_hours"] = event["value"]["duration_hours"]
            if event.get("source_type") is not None:
                rainfall["source_type"] = event["source_type"]

    return result