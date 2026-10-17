"""Typed public data structures for scenario JSON values.

Validated scenarios stay JSON-compatible dictionaries so callers can serialize
and integrate them without conversion. These TypedDicts document that boundary.
"""

from __future__ import annotations

from typing import Any, Literal, NotRequired, TypedDict


ScenarioKind = Literal["synthetic", "observed", "mixed"]
SourceKind = Literal["synthetic_assumption", "observed", "model_generated", "calculated"]
RoadStatus = Literal["open", "closed"]
FacilityStatus = Literal["available", "unavailable"]


class SourceReference(TypedDict):
    id: str
    title: str
    url: str
    retrieved_at: str


class Provenance(TypedDict):
    scenario_type: ScenarioKind
    is_live_data: bool
    geographic_validation: Literal["verified", "not_verified", "partial"]
    notice: NotRequired[str]
    source_references: NotRequired[list[SourceReference]]


class Rainfall(TypedDict):
    value_mm: int | float
    duration_hours: int | float
    source_type: SourceKind


class Node(TypedDict):
    id: str
    name: str
    latitude: int | float
    longitude: int | float
    source_type: NotRequired[SourceKind]
    source_reference_ids: NotRequired[list[str]]


Road = TypedDict(
    "Road",
    {
        "id": str,
        "from": str,
        "to": str,
        "travel_time_minutes": int | float,
        "status": RoadStatus,
        "source_type": NotRequired[SourceKind],
        "source_reference_ids": NotRequired[list[str]],
    },
)


class Facility(TypedDict):
    id: str
    name: str
    node_id: str
    facility_type: str
    status: FacilityStatus
    source_type: NotRequired[SourceKind]
    source_reference_ids: NotRequired[list[str]]


class Demand(TypedDict):
    id: str
    node_id: str
    demand_units: int | float
    source_type: SourceKind
    source_reference_ids: NotRequired[list[str]]


class RoadDisruptionEvent(TypedDict):
    id: str
    type: Literal["road_disruption"]
    target_id: str
    value: RoadStatus
    source_type: NotRequired[SourceKind]


class FacilityUnavailabilityEvent(TypedDict):
    id: str
    type: Literal["facility_unavailability"]
    target_id: str
    value: Literal["unavailable"]
    source_type: NotRequired[SourceKind]


class DemandChangeEvent(TypedDict):
    id: str
    type: Literal["demand_change"]
    target_id: str
    value: int | float
    source_type: NotRequired[SourceKind]


class RainfallChangeValue(TypedDict):
    value_mm: int | float
    duration_hours: int | float


class RainfallChangeEvent(TypedDict):
    id: str
    type: Literal["rainfall_change"]
    target_id: Literal["rainfall"]
    value: RainfallChangeValue
    source_type: NotRequired[SourceKind]


Event = (
    RoadDisruptionEvent
    | FacilityUnavailabilityEvent
    | DemandChangeEvent
    | RainfallChangeEvent
)


class Scenario(TypedDict):
    schema_version: str
    scenario_id: str
    name: str
    description: str
    provenance: Provenance
    rainfall: Rainfall
    nodes: list[Node]
    roads: list[Road]
    facilities: list[Facility]
    demand: list[Demand]
    events: list[Event]
    extensions: NotRequired[dict[str, Any]]


class PathResult(TypedDict):
    origin_id: str
    destination_id: str
    reachable: bool
    travel_time_minutes: float | None
    node_ids: list[str]
    road_ids: list[str]


class NetworkSummary(TypedDict):
    node_count: int
    open_road_count: int
    closed_road_count: int
    reachable_ordered_pairs: int
    possible_ordered_pairs: int
    is_fully_reachable: bool | None
    reachable_node_ids_by_origin: dict[str, list[str]]


class EntityChange(TypedDict):
    entity_id: str
    baseline_value: str | int | float | None
    intervention_value: str | int | float | None


class RouteComparison(TypedDict):
    origin_id: str
    destination_id: str
    baseline: PathResult
    intervention: PathResult
    travel_time_delta_minutes: float | None


class ScenarioComparison(TypedDict):
    baseline_scenario_id: str
    intervention_scenario_id: str
    route_comparisons: list[RouteComparison]
    road_status_changes: list[EntityChange]
    facility_status_changes: list[EntityChange]
    demand_changes: list[EntityChange]
    rainfall: dict[str, Any]
    baseline_network: NetworkSummary
    intervention_network: NetworkSummary
class ValidationReport(TypedDict):
    report_type: Literal["scenario_validation"]
    report_version: str
    scenario_id: str | None
    valid: bool
    errors: list[str]
    counts: dict[str, int | None]
    provenance: dict[str, str | bool | None]