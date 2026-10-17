"""Validation for external Crisiscope X scenario JSON values."""

from __future__ import annotations

import math
from datetime import date
from typing import Any


_REQUIRED_FIELDS = {
    "schema_version",
    "scenario_id",
    "name",
    "description",
    "provenance",
    "rainfall",
    "nodes",
    "roads",
    "facilities",
    "demand",
    "events",
}
_SOURCE_TYPES = ("synthetic_assumption", "observed", "model_generated", "calculated")


def _nonempty_text(value: object) -> bool:
    return isinstance(value, str) and bool(value.strip())


def _finite_number(value: object) -> bool:
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        return False
    try:
        return math.isfinite(value)
    except OverflowError:
        return False


def _records(data: dict[str, Any], name: str, errors: list[str]) -> list[dict[str, Any]]:
    value = data.get(name)
    if not isinstance(value, list):
        errors.append(f"{name} must be a list.")
        return []

    valid: list[dict[str, Any]] = []
    for position, record in enumerate(value):
        if not isinstance(record, dict):
            errors.append(f"{name}[{position}] must be an object.")
        else:
            valid.append(record)
    return valid


def _index_records(
    records: list[dict[str, Any]], collection_name: str, errors: list[str]
) -> dict[str, dict[str, Any]]:
    index: dict[str, dict[str, Any]] = {}
    for position, record in enumerate(records):
        record_id = record.get("id")
        if not _nonempty_text(record_id):
            errors.append(f"{collection_name}[{position}].id must be a non-empty string.")
            continue
        if record_id in index:
            errors.append(f"Duplicate id {record_id!r} in {collection_name}.")
            continue
        index[record_id] = record
    return index


def _validate_source_usage(
    record: dict[str, Any],
    location: str,
    source_ids: set[str],
    errors: list[str],
) -> None:
    source_type = record.get("source_type")
    if source_type is None:
        return
    if source_type not in _SOURCE_TYPES:
        errors.append(f"{location}.source_type has unsupported value {source_type!r}.")
        return
    if source_type == "observed":
        references = record.get("source_reference_ids")
        if not isinstance(references, list) or not references:
            errors.append(f"{location} is observed but has no source_reference_ids.")
            return
        for source_id in references:
            if not _nonempty_text(source_id) or source_id not in source_ids:
                errors.append(f"{location} references unknown source {source_id!r}.")


def validate_scenario(data: object) -> list[str]:
    """Return deterministic, human-readable validation errors.

    The function never mutates ``data`` and is safe to call on arbitrary decoded
    JSON values, including malformed lists and unhashable references.
    """
    if not isinstance(data, dict):
        return ["Scenario must be a JSON object."]

    errors: list[str] = []
    missing = _REQUIRED_FIELDS - data.keys()
    if missing:
        return [f"Missing required fields: {', '.join(sorted(missing))}"]

    for field in ("schema_version", "scenario_id", "name", "description"):
        if not _nonempty_text(data.get(field)):
            errors.append(f"{field} must be a non-empty string.")

    provenance = data.get("provenance")
    source_ids: set[str] = set()
    if not isinstance(provenance, dict):
        errors.append("provenance must be an object.")
    else:
        scenario_type = provenance.get("scenario_type")
        if scenario_type not in ("synthetic", "observed", "mixed"):
            errors.append("provenance.scenario_type must be synthetic, observed, or mixed.")

        is_live = provenance.get("is_live_data")
        if not isinstance(is_live, bool):
            errors.append("provenance.is_live_data must be a boolean.")
        elif scenario_type == "synthetic" and is_live:
            errors.append("Synthetic scenarios cannot be marked as live data.")

        if provenance.get("geographic_validation") not in (
            "verified", "not_verified", "partial"
        ):
            errors.append(
                "provenance.geographic_validation must be verified, not_verified, or partial."
            )

        if scenario_type == "synthetic" and not _nonempty_text(provenance.get("notice")):
            errors.append("Synthetic provenance must include a non-empty notice.")

        raw_sources = provenance.get("source_references", [])
        if not isinstance(raw_sources, list):
            errors.append("provenance.source_references must be a list.")
            raw_sources = []
        for position, source in enumerate(raw_sources):
            location = f"provenance.source_references[{position}]"
            if not isinstance(source, dict):
                errors.append(f"{location} must be an object.")
                continue
            source_id = source.get("id")
            if not _nonempty_text(source_id):
                errors.append(f"{location}.id must be a non-empty string.")
            elif source_id in source_ids:
                errors.append(f"Duplicate source reference id {source_id!r}.")
            else:
                source_ids.add(source_id)
            for field in ("title", "url"):
                if not _nonempty_text(source.get(field)):
                    errors.append(f"{location}.{field} must be a non-empty string.")
            retrieved_at = source.get("retrieved_at")
            if not _nonempty_text(retrieved_at):
                errors.append(f"{location}.retrieved_at must be an ISO date.")
            else:
                try:
                    parsed_date = date.fromisoformat(retrieved_at)
                except ValueError:
                    errors.append(f"{location}.retrieved_at must be an ISO date.")
                else:
                    if parsed_date.isoformat() != retrieved_at:
                        errors.append(f"{location}.retrieved_at must be an ISO date.")

        if scenario_type in ("observed", "mixed") and not raw_sources:
            errors.append(
                f"{scenario_type} scenarios must include provenance.source_references."
            )
        if is_live is True and not raw_sources:
            errors.append("Live data must include provenance.source_references.")

    rainfall = data.get("rainfall")
    if not isinstance(rainfall, dict):
        errors.append("rainfall must be an object.")
    else:
        for field in ("value_mm", "duration_hours"):
            value = rainfall.get(field)
            if not _finite_number(value) or value < 0:
                errors.append(f"rainfall.{field} must be a finite, non-negative number.")
        duration = rainfall.get("duration_hours")
        if _finite_number(duration) and duration <= 0:
            errors.append("rainfall.duration_hours must be greater than zero.")
        if rainfall.get("source_type") not in _SOURCE_TYPES:
            errors.append("rainfall.source_type has an unsupported value.")
        _validate_source_usage(rainfall, "rainfall", source_ids, errors)

    nodes = _records(data, "nodes", errors)
    if not nodes:
        errors.append("nodes must contain at least one node.")
    roads = _records(data, "roads", errors)
    facilities = _records(data, "facilities", errors)
    demand = _records(data, "demand", errors)
    events = _records(data, "events", errors)

    node_index = _index_records(nodes, "nodes", errors)
    road_index = _index_records(roads, "roads", errors)
    facility_index = _index_records(facilities, "facilities", errors)
    demand_index = _index_records(demand, "demand", errors)
    _index_records(events, "events", errors)

    for position, node in enumerate(nodes):
        node_id = node.get("id", f"at index {position}")
        if not _nonempty_text(node.get("name")):
            errors.append(f"Node {node_id!r} must have a non-empty name.")
        for field, minimum, maximum in (
            ("latitude", -90, 90),
            ("longitude", -180, 180),
        ):
            value = node.get(field)
            if not _finite_number(value) or not minimum <= value <= maximum:
                errors.append(f"Node {node_id!r} has an invalid or missing {field}.")
        _validate_source_usage(node, f"Node {node_id!r}", source_ids, errors)

    for road in roads:
        road_id = road.get("id")
        for endpoint in ("from", "to"):
            node_id = road.get(endpoint)
            if not _nonempty_text(node_id) or node_id not in node_index:
                errors.append(
                    f"Road {road_id!r} references unknown node {node_id!r} in {endpoint}."
                )
        travel_time = road.get("travel_time_minutes")
        if not _finite_number(travel_time) or travel_time <= 0:
            errors.append(f"Road {road_id!r} must have a positive finite travel time.")
        if road.get("status") not in ("open", "closed"):
            errors.append(f"Road {road_id!r} has an invalid status.")
        _validate_source_usage(road, f"Road {road_id!r}", source_ids, errors)

    for facility in facilities:
        facility_id = facility.get("id")
        node_id = facility.get("node_id")
        if not _nonempty_text(facility.get("name")):
            errors.append(f"Facility {facility_id!r} must have a non-empty name.")
        if not _nonempty_text(facility.get("facility_type")):
            errors.append(f"Facility {facility_id!r} must have a non-empty facility_type.")
        if not _nonempty_text(node_id) or node_id not in node_index:
            errors.append(f"Facility {facility_id!r} references an unknown node {node_id!r}.")
        if facility.get("status") not in ("available", "unavailable"):
            errors.append(f"Facility {facility_id!r} has an invalid status.")
        _validate_source_usage(facility, f"Facility {facility_id!r}", source_ids, errors)

    for record in demand:
        record_id = record.get("id")
        node_id = record.get("node_id")
        if not _nonempty_text(node_id) or node_id not in node_index:
            errors.append(f"Demand record {record_id!r} references an unknown node {node_id!r}.")
        units = record.get("demand_units")
        if not _finite_number(units) or units < 0:
            errors.append(
                f"Demand record {record_id!r} must have a finite, non-negative demand_units value."
            )
        if record.get("source_type") not in _SOURCE_TYPES:
            errors.append(f"Demand record {record_id!r} has an unsupported source_type.")
        _validate_source_usage(record, f"Demand record {record_id!r}", source_ids, errors)

    for event in events:
        event_id = event.get("id")
        event_type = event.get("type")
        target_id = event.get("target_id")
        if not _nonempty_text(target_id):
            errors.append(f"Event {event_id!r} must have a non-empty target_id.")
            continue

        if event_type == "road_disruption":
            if target_id not in road_index:
                errors.append(f"Event {event_id!r} targets an unknown road {target_id!r}.")
            if event.get("value") not in ("open", "closed"):
                errors.append(
                    f"Road disruption event {event_id!r} must use value='open' or 'closed'."
                )
        elif event_type == "facility_unavailability":
            if target_id not in facility_index:
                errors.append(f"Event {event_id!r} targets an unknown facility {target_id!r}.")
            if event.get("value") != "unavailable":
                errors.append(f"Facility event {event_id!r} must use value='unavailable'.")
        elif event_type == "demand_change":
            if target_id not in demand_index:
                errors.append(f"Event {event_id!r} targets an unknown demand record {target_id!r}.")
            value = event.get("value")
            if not _finite_number(value) or value < 0:
                errors.append(f"Demand event {event_id!r} must use a finite, non-negative value.")
        elif event_type == "rainfall_change":
            if target_id != "rainfall":
                errors.append(f"Rainfall event {event_id!r} must target 'rainfall'.")
            value = event.get("value")
            if not isinstance(value, dict):
                errors.append(f"Rainfall event {event_id!r}.value must be an object.")
            else:
                for field in ("value_mm", "duration_hours"):
                    amount = value.get(field)
                    if not _finite_number(amount) or amount < 0:
                        errors.append(
                            f"Rainfall event {event_id!r}.value.{field} must be a finite, non-negative number."
                        )
                duration = value.get("duration_hours")
                if _finite_number(duration) and duration <= 0:
                    errors.append(
                        f"Rainfall event {event_id!r}.value.duration_hours must be greater than zero."
                    )
        else:
            errors.append(f"Event {event_id!r} has unsupported type {event_type!r}.")

        if event.get("source_type") is not None:
            _validate_source_usage(event, f"Event {event_id!r}", source_ids, errors)

    return errors