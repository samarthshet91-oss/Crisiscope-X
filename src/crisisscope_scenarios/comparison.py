"""Directed network routing and baseline/intervention comparison."""

from __future__ import annotations

import heapq
from collections.abc import Sequence
from typing import Any, cast

from .loader import ScenarioValidationError
from .models import NetworkSummary, PathResult, Scenario, ScenarioComparison
from .validator import validate_scenario


class ComparisonError(ValueError):
    """A comparison request cannot be evaluated consistently."""

    def __init__(self, errors: list[str]) -> None:
        self.errors = tuple(errors)
        super().__init__("Comparison failed:\n- " + "\n- ".join(errors))


def _validated(data: object) -> Scenario:
    errors = validate_scenario(data)
    if errors:
        raise ScenarioValidationError(errors)
    return cast(Scenario, data)


def _shortest_path_validated(
    scenario: Scenario, origin_id: str, destination_id: str
) -> PathResult:
    node_ids = {node["id"] for node in scenario["nodes"]}
    if origin_id not in node_ids:
        raise ComparisonError([f"Unknown route origin node {origin_id!r}."])
    if destination_id not in node_ids:
        raise ComparisonError([f"Unknown route destination node {destination_id!r}."])

    adjacency: dict[str, list[tuple[str, str, float]]] = {
        node_id: [] for node_id in node_ids
    }
    for road in scenario["roads"]:
        if road["status"] == "open":
            adjacency[road["from"]].append(
                (road["to"], road["id"], float(road["travel_time_minutes"]))
            )
    for edges in adjacency.values():
        edges.sort(key=lambda edge: (edge[0], edge[1]))

    # Keep the full path key in the heap so equal-time routes resolve in a
    # deterministic, lexicographic order.
    start_key: tuple[float, tuple[str, ...], tuple[str, ...]] = (
        0.0,
        (origin_id,),
        (),
    )
    best: dict[str, tuple[float, tuple[str, ...], tuple[str, ...]]] = {
        origin_id: start_key
    }
    queue: list[tuple[float, tuple[str, ...], tuple[str, ...], str]] = [
        (*start_key, origin_id)
    ]

    while queue:
        travel_time, path_nodes, path_roads, current = heapq.heappop(queue)
        current_key = (travel_time, path_nodes, path_roads)
        if best.get(current) != current_key:
            continue
        if current == destination_id:
            return {
                "origin_id": origin_id,
                "destination_id": destination_id,
                "reachable": True,
                "travel_time_minutes": travel_time,
                "node_ids": list(path_nodes),
                "road_ids": list(path_roads),
            }

        for next_node, road_id, weight in adjacency[current]:
            candidate = (
                travel_time + weight,
                path_nodes + (next_node,),
                path_roads + (road_id,),
            )
            if next_node not in best or candidate < best[next_node]:
                best[next_node] = candidate
                heapq.heappush(queue, (*candidate, next_node))

    return {
        "origin_id": origin_id,
        "destination_id": destination_id,
        "reachable": False,
        "travel_time_minutes": None,
        "node_ids": [],
        "road_ids": [],
    }


def shortest_path(
    scenario: Scenario, origin_id: str, destination_id: str
) -> PathResult:
    """Return the fastest directed path over open roads, or an unreachable result.

    Each road is traversable only from its declared ``from`` node to its
    ``to`` node. Closed roads are excluded. Equal-time paths resolve
    lexicographically for repeatable output.
    """
    checked = _validated(scenario)
    return _shortest_path_validated(checked, origin_id, destination_id)


def network_summary(scenario: Scenario) -> NetworkSummary:
    """Summarize directed reachability and road status counts."""
    checked = _validated(scenario)
    ids = sorted(node["id"] for node in checked["nodes"])
    reachable_by_origin: dict[str, list[str]] = {}
    for origin in ids:
        reachable_by_origin[origin] = [
            destination
            for destination in ids
            if _shortest_path_validated(checked, origin, destination)["reachable"]
        ]

    reachable_pairs = sum(
        destination != origin
        for origin, destinations in reachable_by_origin.items()
        for destination in destinations
    )
    possible_pairs = len(ids) * max(0, len(ids) - 1)
    fully_reachable: bool | None
    if len(ids) < 2:
        fully_reachable = None
    else:
        fully_reachable = reachable_pairs == possible_pairs

    return {
        "node_count": len(ids),
        "open_road_count": sum(road["status"] == "open" for road in checked["roads"]),
        "closed_road_count": sum(road["status"] == "closed" for road in checked["roads"]),
        "reachable_ordered_pairs": reachable_pairs,
        "possible_ordered_pairs": possible_pairs,
        "is_fully_reachable": fully_reachable,
        "reachable_node_ids_by_origin": reachable_by_origin,
    }


def _entity_changes(
    baseline_records: list[dict[str, Any]],
    intervention_records: list[dict[str, Any]],
    field: str,
) -> list[dict[str, Any]]:
    baseline_by_id = {record["id"]: record for record in baseline_records}
    intervention_by_id = {record["id"]: record for record in intervention_records}
    changes: list[dict[str, Any]] = []
    for entity_id in sorted(baseline_by_id.keys() | intervention_by_id.keys()):
        before = baseline_by_id.get(entity_id, {}).get(field)
        after = intervention_by_id.get(entity_id, {}).get(field)
        if before != after:
            changes.append(
                {
                    "entity_id": entity_id,
                    "baseline_value": before,
                    "intervention_value": after,
                }
            )
    return changes


def _route_pairs(
    baseline: Scenario,
    intervention: Scenario,
    pairs: Sequence[tuple[str, str]] | None,
) -> list[tuple[str, str]]:
    node_ids = {node["id"] for node in baseline["nodes"]}
    if node_ids != {node["id"] for node in intervention["nodes"]}:
        raise ComparisonError(["Baseline and intervention must contain the same node identifiers."])

    if pairs is None:
        origins = {
            record["node_id"]
            for scenario in (baseline, intervention)
            for record in scenario["demand"]
        }
        destinations = {
            facility["node_id"]
            for scenario in (baseline, intervention)
            for facility in scenario["facilities"]
        }
        return sorted((origin, destination) for origin in origins for destination in destinations)

    if isinstance(pairs, (str, bytes)) or not isinstance(pairs, Sequence):
        raise ComparisonError(["Route pairs must be a sequence of (origin_id, destination_id) pairs."])
    normalized: list[tuple[str, str]] = []
    for position, pair in enumerate(pairs):
        if (
            not isinstance(pair, (tuple, list))
            or len(pair) != 2
            or not isinstance(pair[0], str)
            or not isinstance(pair[1], str)
        ):
            raise ComparisonError([f"Route pair at position {position} must contain two node identifiers."])
        origin, destination = pair
        if origin not in node_ids or destination not in node_ids:
            raise ComparisonError([f"Route pair {(origin, destination)!r} references an unknown node."])
        normalized.append((origin, destination))
    return sorted(set(normalized))


def compare_scenarios(
    baseline: Scenario,
    intervention: Scenario,
    route_pairs: Sequence[tuple[str, str]] | None = None,
) -> ScenarioComparison:
    """Compare validated network routes and scenario values without mutation.

    By default, route pairs are generated from demand-node to facility-node
    combinations across both scenarios. Explicit pairs can be supplied for
    other integration use cases.
    """
    before = _validated(baseline)
    after = _validated(intervention)
    pairs = _route_pairs(before, after, route_pairs)

    route_comparisons = []
    for origin, destination in pairs:
        before_route = _shortest_path_validated(before, origin, destination)
        after_route = _shortest_path_validated(after, origin, destination)
        before_time = before_route["travel_time_minutes"]
        after_time = after_route["travel_time_minutes"]
        delta = (
            after_time - before_time
            if before_time is not None and after_time is not None
            else None
        )
        route_comparisons.append(
            {
                "origin_id": origin,
                "destination_id": destination,
                "baseline": before_route,
                "intervention": after_route,
                "travel_time_delta_minutes": delta,
            }
        )

    return {
        "baseline_scenario_id": before["scenario_id"],
        "intervention_scenario_id": after["scenario_id"],
        "route_comparisons": route_comparisons,
        "road_status_changes": _entity_changes(before["roads"], after["roads"], "status"),
        "facility_status_changes": _entity_changes(
            before["facilities"], after["facilities"], "status"
        ),
        "demand_changes": _entity_changes(before["demand"], after["demand"], "demand_units"),
        "rainfall": {
            "baseline": dict(before["rainfall"]),
            "intervention": dict(after["rainfall"]),
            "changed": before["rainfall"] != after["rainfall"],
        },
        "baseline_network": network_summary(before),
        "intervention_network": network_summary(after),
    }