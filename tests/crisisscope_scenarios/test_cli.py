import json
from pathlib import Path

from crisisscope_scenarios.cli import main


SCENARIO_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "scenarios"
    / "bengaluru_flood_demo.json"
)


def test_validate_command_writes_a_report(tmp_path, capsys):
    output = tmp_path / "validation.json"

    result = main(["validate", str(SCENARIO_PATH), "--output", str(output)])

    assert result == 0
    assert json.loads(output.read_text(encoding="utf-8"))["valid"] is True
    assert "Scenario is valid." in capsys.readouterr().out


def test_validate_command_reports_invalid_scenario(tmp_path, capsys):
    source = tmp_path / "invalid.json"
    source.write_text(json.dumps({"scenario_id": "incomplete"}), encoding="utf-8")
    output = tmp_path / "validation.json"

    result = main(["validate", str(source), "--output", str(output)])

    assert result == 1
    report = json.loads(output.read_text(encoding="utf-8"))
    assert report["valid"] is False
    assert "Scenario is invalid." in capsys.readouterr().out


def test_compare_command_applies_events_and_saves_report(tmp_path, capsys):
    output = tmp_path / "comparison.json"

    result = main(["compare", str(SCENARIO_PATH), "--output", str(output)])

    assert result == 0
    report = json.loads(output.read_text(encoding="utf-8"))
    assert report["route_comparisons"][0]["travel_time_delta_minutes"] == 6.0
    assert "Applied 1 event(s)." in capsys.readouterr().out


def test_compare_command_returns_error_for_missing_scenario(tmp_path, capsys):
    missing = tmp_path / "missing.json"

    result = main(["compare", str(missing)])

    assert result == 2
    assert "Error:" in capsys.readouterr().err