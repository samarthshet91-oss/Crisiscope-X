"""Create the stable, synthetic demonstration scenario; never represents live events."""
from __future__ import annotations
import argparse, json
from datetime import datetime, timezone
from sqlalchemy import text
from src.database.connection import get_engine

def build_scenario() -> dict:
    created = "2026-10-17T00:00:00+00:00"
    scenario = {"scenario_id":"BLR-FLOOD-001", "scenario_name":"Illustrative Bengaluru urban flood response",
        "city":"Bengaluru", "hazard":"urban_flooding", "data_mode":"synthetic",
        "scenario_payload":{"created_at_utc":created,"source_type":"synthetic",
          "illustrative_rainfall":{"amount_mm":85,"duration_hours":3,"source_type":"synthetic"},
          "intervention_concepts":["consider_alternative_route","consider_alternative_facility"],
          "limitations":"Demonstration values; no real road closure or facility capacity is asserted."}}
    scenario["events"] = [
        {"event_id":"BLR-FLOOD-001-E01","event_type":"road_disruption","asset_id":None,"severity":"high","source_type":"synthetic","event_payload":{"asset_match":"unmatched_placeholder","description":"Illustrative disruption only; no real road is identified as closed."}},
        {"event_id":"BLR-FLOOD-001-E02","event_type":"facility_capacity_reduction","asset_id":None,"severity":"medium","source_type":"synthetic","event_payload":{"asset_match":"unmatched_placeholder","description":"Illustrative capacity change only; no facility or capacity is asserted."}},
    ]
    return scenario

def store_scenario(scenario: dict) -> None:
    if scenario.get("data_mode") != "synthetic" or any(e["source_type"] != "synthetic" for e in scenario["events"]):
        raise ValueError("Demo scenario and all events must be labelled synthetic")
    engine = get_engine()
    with engine.begin() as c:
        c.execute(text("""INSERT INTO scenarios(scenario_id,scenario_name,city,hazard,data_mode,scenario_payload)
          VALUES (:id,:name,:city,:hazard,:mode,CAST(:payload AS jsonb)) ON CONFLICT(scenario_id) DO UPDATE SET
          scenario_name=EXCLUDED.scenario_name,city=EXCLUDED.city,hazard=EXCLUDED.hazard,data_mode=EXCLUDED.data_mode,
          scenario_payload=EXCLUDED.scenario_payload"""), {"id":scenario["scenario_id"],"name":scenario["scenario_name"],"city":scenario["city"],
          "hazard":scenario["hazard"],"mode":scenario["data_mode"],"payload":json.dumps(scenario["scenario_payload"])})
        for event in scenario["events"]:
            c.execute(text("""INSERT INTO scenario_events(event_id,scenario_id,event_type,asset_id,severity,source_type,event_payload)
              VALUES (:eid,:sid,:type,:asset,:severity,:source,CAST(:payload AS jsonb)) ON CONFLICT(event_id) DO UPDATE SET
              event_type=EXCLUDED.event_type,asset_id=EXCLUDED.asset_id,severity=EXCLUDED.severity,source_type=EXCLUDED.source_type,event_payload=EXCLUDED.event_payload"""),
              {"eid":event["event_id"],"sid":scenario["scenario_id"],"type":event["event_type"],"asset":event["asset_id"],"severity":event["severity"],"source":event["source_type"],"payload":json.dumps(event["event_payload"])})

def main() -> None:
    parser=argparse.ArgumentParser(); parser.add_argument("--dry-run",action="store_true"); args=parser.parse_args()
    value=build_scenario()
    if not args.dry_run: store_scenario(value)
    print(json.dumps(value,indent=2))
if __name__ == "__main__": main()
