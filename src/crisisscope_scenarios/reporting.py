"""Build and write stable, reproducible scenario reports."""

from __future__ import annotations

import json
from collections.abc import Sequence
from pathlib import Path
from typing import Any

from .comparison import compare_scenarios
from .models import Scenario, ValidationReport
from .validator import validate_scenario


_COLLECTIONS = ("nodes", "roads", "facilities", "demand", "events")


def build_validation_report(data: object) -> ValidationReport:
    """Return a deterministic validation summary without mutating ``data``.

    No generation timestamp or machine-specific path is included, so equal
    scenario inputs produce byte-stable JSON when written.
    """
    errors = validate_scenario(data)
    scenario = data if isinstance(data, dict) else {}
    provenance = scenario.get("provenance")
    if not isinstance(provenance, dict):
        provenance_summary: dict[str, str | bool | None] = {
            "scenario_type": None,
            "is_live_data": None,
            "geographic_validation": None,
        }
    else:
        scenario_type = provenance.get("scenario_type")
        is_live_data = provenance.get("is_live_data")
        geographic_validation = provenance.get("geographic_validation")
        provenance_summary = {
            "scenario_type": scenario_type if isinstance(scenario_type, str) else None,
            "is_live_data": is_live_data if isinstance(is_live_data, bool) else None,
            "geographic_validation": (
                geographic_validation if isinstance(geographic_validation, str) else None
            ),
        }

    counts = {
        collection: (
            len(scenario[collection]) if isinstance(scenario.get(collection), list) else None
        )
        for collection in _COLLECTIONS
    }
    scenario_id = scenario.get("scenario_id")
    return {
        "report_type": "scenario_validation",
        "report_version": "1.0",
        "scenario_id": scenario_id if isinstance(scenario_id, str) else None,
        "valid": not errors,
        "errors": errors,
        "counts": counts,
        "provenance": provenance_summary,
    }


def _write_json_report(report: dict[str, Any], destination: str | Path) -> Path:
    report_path = Path(destination)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    serialized = json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True)
    with report_path.open("w", encoding="utf-8", newline="\n") as file:
        file.write(serialized)
        file.write("\n")
    return report_path


def write_validation_report(data: object, destination: str | Path) -> Path:
    """Write a UTF-8, sorted-key JSON validation report and return its path."""
    return _write_json_report(build_validation_report(data), destination)


def write_comparison_report(
    baseline: Scenario,
    intervention: Scenario,
    destination: str | Path,
    route_pairs: Sequence[tuple[str, str]] | None = None,
) -> Path:
    """Write a deterministic baseline/intervention comparison as JSON."""
    report = compare_scenarios(baseline, intervention, route_pairs=route_pairs)
    return _write_json_report(report, destination)