# Scenario module tests

These tests are kept separate from the Crisiscope X repository tests in `tests/test_pipeline.py`.

In PowerShell, from the repository root, run the scenario module tests with:

```powershell
$env:PYTHONPATH = (Resolve-Path src).Path
python -m pytest tests/crisisscope_scenarios
```

Run the repository tests separately with:

```powershell
python -m pytest tests/test_pipeline.py
```

The scenario module tests use the synthetic route-network fixture at `data/scenarios/bengaluru_flood_demo.json`. They do not validate route calculations against `BLR-FLOOD-001.json`, which currently has no road-network data.