"""Load and validate scenario JSON files."""

from __future__ import annotations

import json
from pathlib import Path
from typing import cast

from .models import Scenario
from .validator import validate_scenario


class ScenarioLoadError(ValueError):
    """A file could not be read or decoded as JSON."""

    def __init__(self, path: Path, detail: str) -> None:
        self.path = path
        self.detail = detail
        super().__init__(f"Could not load scenario {str(path)!r}: {detail}")


class ScenarioValidationError(ValueError):
    """A decoded scenario failed structural or referential validation."""

    def __init__(self, errors: list[str], path: Path | None = None) -> None:
        self.errors = tuple(errors)
        self.path = path
        label = f" in {str(path)!r}" if path is not None else ""
        message = "Scenario validation failed" + label + ":\n- " + "\n- ".join(errors)
        super().__init__(message)


def load_scenario(path: str | Path) -> Scenario:
    """Read a UTF-8 JSON scenario and reject malformed or invalid input.

    The decoded object is returned without normalization or mutation. File,
    JSON syntax, and scenario validation failures use distinct exceptions.
    """
    scenario_path = Path(path)
    try:
        with scenario_path.open("r", encoding="utf-8") as file:
            data = json.load(file)
    except json.JSONDecodeError as exc:
        raise ScenarioLoadError(
            scenario_path,
            f"invalid JSON at line {exc.lineno}, column {exc.colno}: {exc.msg}",
        ) from exc
    except (OSError, UnicodeError) as exc:
        raise ScenarioLoadError(scenario_path, str(exc)) from exc

    errors = validate_scenario(data)
    if errors:
        raise ScenarioValidationError(errors, scenario_path)
    return cast(Scenario, data)