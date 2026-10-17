"""Command-line interface for validating and comparing scenarios."""

from __future__ import annotations

import argparse
import json
import sys
from collections.abc import Sequence
from pathlib import Path
from typing import Any

from .comparison import ComparisonError
from .event_engine import apply_events
from .loader import ScenarioLoadError, ScenarioValidationError, load_scenario
from .reporting import (
    build_validation_report,
    write_comparison_report,
    write_validation_report,
)


def _read_json(path: Path) -> Any:
    """Read JSON without requiring validation, so invalid scenarios can be reported."""
    try:
        with path.open("r", encoding="utf-8") as file:
            return json.load(file)
    except json.JSONDecodeError as exc:
        raise ScenarioLoadError(
            path, f"invalid JSON at line {exc.lineno}, column {exc.colno}: {exc.msg}"
        ) from exc
    except (OSError, UnicodeError) as exc:
        raise ScenarioLoadError(path, str(exc)) from exc


def _default_output(scenario_path: Path, report_kind: str) -> Path:
    return Path("reports") / f"{scenario_path.stem}.{report_kind}.json"


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python -m crisisscope_scenarios",
        description="Validate a scenario or generate a baseline/intervention comparison.",
    )
    commands = parser.add_subparsers(dest="command", required=True)

    validate = commands.add_parser("validate", help="validate JSON and save a report")
    validate.add_argument("scenario", type=Path, help="scenario JSON file")
    validate.add_argument(
        "--output",
        type=Path,
        help="report path (default: reports/<scenario>.validation.json)",
    )

    compare = commands.add_parser("compare", help="apply scenario events and compare routes")
    compare.add_argument("scenario", type=Path, help="baseline scenario JSON file")
    compare.add_argument(
        "--output",
        type=Path,
        help="report path (default: reports/<scenario>.comparison.json)",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    """Run a CLI command and return its process exit code."""
    args = _build_parser().parse_args(argv)

    try:
        if args.command == "validate":
            data = _read_json(args.scenario)
            report = build_validation_report(data)
            output = args.output or _default_output(args.scenario, "validation")
            report_path = write_validation_report(data, output)
            status = "valid" if report["valid"] else "invalid"
            print(f"Scenario is {status}.")
            print(f"Validation report written: {report_path}")
            for error in report["errors"]:
                print(f"- {error}", file=sys.stderr)
            return 0 if report["valid"] else 1

        scenario = load_scenario(args.scenario)
        intervention = apply_events(scenario)
        output = args.output or _default_output(args.scenario, "comparison")
        report_path = write_comparison_report(scenario, intervention, output)
        print(f"Applied {len(intervention['events'])} event(s).")
        print(f"Comparison report written: {report_path}")
        return 0
    except (ScenarioLoadError, ScenarioValidationError, ComparisonError, OSError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())