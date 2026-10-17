"""Read-only SQLAlchemy repository functions for application integration."""
from sqlalchemy import text
from src.database.connection import get_engine

def rainfall_for_area(start_utc, end_utc, west, south, east, north):
    with get_engine().connect() as c:
        return c.execute(text("""SELECT * FROM rainfall_observations WHERE observed_at >= :start
          AND observed_at < :end AND longitude BETWEEN :west AND :east AND latitude BETWEEN :south AND :north
          ORDER BY observed_at"""), {"start":start_utc,"end":end_utc,"west":west,"south":south,"east":east,"north":north}).mappings().all()

def rainfall_for_period(start_utc, end_utc, dataset_id=None):
    """Query temporal rainfall including city/month aggregates with no coordinates."""
    query="SELECT * FROM rainfall_observations WHERE observed_at >= :start AND observed_at < :end"
    params={"start":start_utc,"end":end_utc}
    if dataset_id:
        query += " AND source_dataset_id=:dataset"
        params["dataset"]=dataset_id
    with get_engine().connect() as c:
        return c.execute(text(query+" ORDER BY observed_at"),params).mappings().all()

def flood_hotspots(dataset_id=None):
    query="SELECT * FROM flood_hotspots" + (" WHERE source_dataset_id=:id" if dataset_id else "") + " ORDER BY hotspot_id"
    with get_engine().connect() as c: return c.execute(text(query), {"id":dataset_id} if dataset_id else {}).mappings().all()

def infrastructure_assets(asset_type=None, dataset_id=None):
    clauses=[]; params={}
    if asset_type: clauses.append("asset_type=:kind"); params["kind"]=asset_type
    if dataset_id: clauses.append("source_dataset_id=:dataset"); params["dataset"]=dataset_id
    query="SELECT * FROM infrastructure_assets" + (" WHERE "+" AND ".join(clauses) if clauses else "") + " ORDER BY asset_id"
    with get_engine().connect() as c: return c.execute(text(query), params).mappings().all()

def dataset_status():
    with get_engine().connect() as c: return c.execute(text("SELECT * FROM dataset_sources ORDER BY dataset_id")).mappings().all()

def quality_reports(dataset_id=None):
    query="SELECT * FROM data_quality_reports" + (" WHERE dataset_id=:id" if dataset_id else "") + " ORDER BY checked_at DESC"
    with get_engine().connect() as c: return c.execute(text(query), {"id":dataset_id} if dataset_id else {}).mappings().all()

def scenario(scenario_id):
    with get_engine().connect() as c:
        row = c.execute(text("SELECT * FROM scenarios WHERE scenario_id=:id"), {"id":scenario_id}).mappings().one_or_none()
        if row is None: return None
        events = c.execute(text("SELECT * FROM scenario_events WHERE scenario_id=:id ORDER BY event_id"), {"id":scenario_id}).mappings().all()
        return {"scenario":row,"events":events}
