"""Load cleaned GeoJSON/vector features into PostgreSQL transactionally and idempotently."""
from __future__ import annotations
import argparse, json
from pathlib import Path
from uuid import uuid4
import geopandas as gpd
from shapely.geometry import mapping, Point
from sqlalchemy import text
from src.database.connection import get_engine


def _start_ingestion_run(engine, dataset_id: str, rows_read: int, details: dict) -> str:
    run_id = uuid4().hex
    with engine.begin() as conn:
        if conn.execute(text("SELECT 1 FROM dataset_sources WHERE dataset_id=:id"), {"id": dataset_id}).first() is None:
            raise ValueError(f"Dataset must be registered before loading: {dataset_id}")
        conn.execute(text("""INSERT INTO ingestion_runs(run_id,dataset_id,status,rows_read,details)
          VALUES (:run,:dataset,'running',:rows,CAST(:details AS jsonb))"""),
          {"run": run_id, "dataset": dataset_id, "rows": rows_read, "details": json.dumps(details)})
    return run_id


def _mark_ingestion_failed(engine, run_id: str, exc: Exception) -> None:
    try:
        with engine.begin() as conn:
            conn.execute(text("""UPDATE ingestion_runs SET status='failed',finished_at=NOW(),
              details=details || CAST(:failure AS jsonb) WHERE run_id=:run"""),
              {"run": run_id, "failure": json.dumps({"error_type": type(exc).__name__, "error": str(exc)})})
    except Exception as record_error:
        exc.add_note(f"Could not update ingestion run {run_id}: {record_error}")

def load_geospatial(path: Path, dataset_id: str, *, kind: str, asset_type: str | None = None) -> dict:
    frame=gpd.read_file(path)
    if frame.crs is None: raise ValueError("Processed dataset is missing CRS")
    frame=frame.to_crs("EPSG:4326")
    if kind not in {"hotspot","asset"}: raise ValueError("kind must be hotspot or asset")
    table="flood_hotspots" if kind=="hotspot" else "infrastructure_assets"
    accepted=0; rejected=[]
    engine=get_engine()
    run_id = _start_ingestion_run(engine, dataset_id, len(frame), {"input": str(path), "table": table})
    try:
        with engine.begin() as conn:
            for _,row in frame.iterrows():
                geometry=row.geometry
                if geometry is None or geometry.is_empty or not geometry.is_valid:
                    rejected.append({"row_index":int(_),"reason":"missing_empty_or_invalid_geometry"})
                    continue
                props={k:v for k,v in row.drop(labels=[frame.geometry.name]).to_dict().items() if not str(k).startswith("_")}
                feature_id=str(props.get("asset_id") or props.get("hotspot_id") or "")
                if not feature_id: raise ValueError("Processed feature is missing a stable ID")
                if isinstance(geometry,Point): lon,lat=geometry.x,geometry.y
                else: lon=lat=None
                props["geometry"] = mapping(geometry)
                props["geometry_crs"]="EPSG:4326"
                name_value=next((v for k,v in props.items() if str(k).casefold()=="name"),None)
                if kind=="hotspot":
                    conn.execute(text("""INSERT INTO flood_hotspots(hotspot_id,source_dataset_id,name,latitude,longitude,source_type,raw_attributes)
                      VALUES (:id,:dataset,:name,:lat,:lon,'historical',CAST(:attrs AS jsonb)) ON CONFLICT(hotspot_id) DO UPDATE SET
                      source_dataset_id=EXCLUDED.source_dataset_id,name=EXCLUDED.name,latitude=EXCLUDED.latitude,longitude=EXCLUDED.longitude,raw_attributes=EXCLUDED.raw_attributes"""),
                      {"id":feature_id,"dataset":dataset_id,"name":name_value,"lat":lat,"lon":lon,"attrs":json.dumps(props,default=str)})
                else:
                    conn.execute(text("""INSERT INTO infrastructure_assets(asset_id,asset_type,name,latitude,longitude,source_dataset_id,source_type,attributes)
                      VALUES (:id,:type,:name,:lat,:lon,:dataset,'historical',CAST(:attrs AS jsonb)) ON CONFLICT(asset_id) DO UPDATE SET
                      asset_type=EXCLUDED.asset_type,name=EXCLUDED.name,latitude=EXCLUDED.latitude,longitude=EXCLUDED.longitude,
                      source_dataset_id=EXCLUDED.source_dataset_id,attributes=EXCLUDED.attributes"""),
                      {"id":feature_id,"type":asset_type or "infrastructure","name":name_value,"lat":lat,"lon":lon,"dataset":dataset_id,"attrs":json.dumps(props,default=str)})
                accepted+=1
            conn.execute(text("""INSERT INTO data_quality_reports(dataset_id,status,rows_checked,issue_count,details)
              VALUES (:id,:status,:checked,:issues,CAST(:details AS jsonb))"""),
              {"id":dataset_id,"status":"passed" if not rejected else "warning","checked":len(frame),
               "issues":len(rejected),"details":json.dumps({"accepted":accepted,"rejected":len(rejected),"rejected_records":rejected,"input":str(path)})})
            conn.execute(text("UPDATE dataset_sources SET status='loaded',local_path=:path,downloaded_at=COALESCE(downloaded_at,NOW()) WHERE dataset_id=:id"),
              {"path":str(path),"id":dataset_id})
            persisted=conn.execute(text(f"SELECT count(*) FROM {table} WHERE source_dataset_id=:id"),{"id":dataset_id}).scalar_one()
            conn.execute(text("""UPDATE ingestion_runs SET status='completed',finished_at=NOW(),rows_accepted=:accepted,
              rows_rejected=:rejected,details=details || CAST(:details AS jsonb) WHERE run_id=:run"""),
              {"run":run_id,"accepted":accepted,"rejected":len(rejected),"details":json.dumps({"persisted_for_dataset":persisted})})
    except Exception as exc:
        _mark_ingestion_failed(engine, run_id, exc)
        raise
    return {"dataset_id":dataset_id,"input_count":len(frame),"accepted":accepted,"persisted_for_dataset":persisted,"table":table,"run_id":run_id}

def load_rainfall(frame, dataset_id: str, local_path: str | None=None) -> dict:
    """Idempotently upsert normalized monthly/daily rainfall records by stable key."""
    accepted=0; engine=get_engine()
    records=frame.to_dict(orient="records")
    run_id=_start_ingestion_run(engine,dataset_id,len(records),{"input":local_path,"table":"rainfall_observations"})
    try:
      with engine.begin() as conn:
        for row in records:
            conn.execute(text("""INSERT INTO rainfall_observations(source_dataset_id,observed_at,location_name,latitude,longitude,
                rainfall_mm,source_type,quality_status,raw_attributes,observation_key)
              VALUES (:dataset,:observed,:location,:lat,:lon,:rain,'historical','accepted',CAST(:attrs AS jsonb),:key)
              ON CONFLICT(observation_key) DO UPDATE SET source_dataset_id=EXCLUDED.source_dataset_id,
              observed_at=EXCLUDED.observed_at,location_name=EXCLUDED.location_name,rainfall_mm=EXCLUDED.rainfall_mm,
              raw_attributes=EXCLUDED.raw_attributes,quality_status=EXCLUDED.quality_status"""),
              {"dataset":dataset_id,"observed":row["observed_at_utc"],"location":row["location_name"],"lat":row["latitude"],
               "lon":row["longitude"],"rain":float(row["rainfall_mm"]),"attrs":json.dumps(row["raw_attributes"]),"key":row["observation_key"]})
            accepted+=1
        conn.execute(text("""INSERT INTO data_quality_reports(dataset_id,status,rows_checked,issue_count,details)
          VALUES (:id,'passed',:checked,0,CAST(:details AS jsonb))"""),
          {"id":dataset_id,"checked":accepted,"details":json.dumps({"accepted":accepted,"rejected":0,"temporal_resolution":next((r.get("raw_attributes",{}).get("temporal_resolution") for r in frame.to_dict(orient="records")),"unknown")})})
        conn.execute(text("UPDATE dataset_sources SET status='loaded',local_path=COALESCE(:path,local_path),downloaded_at=COALESCE(downloaded_at,NOW()) WHERE dataset_id=:id"),{"id":dataset_id,"path":local_path})
        persisted=conn.execute(text("SELECT count(*) FROM rainfall_observations WHERE source_dataset_id=:id"),{"id":dataset_id}).scalar_one()
        conn.execute(text("""UPDATE ingestion_runs SET status='completed',finished_at=NOW(),rows_accepted=:accepted,
          details=details || CAST(:details AS jsonb) WHERE run_id=:run"""),
          {"run":run_id,"accepted":accepted,"details":json.dumps({"persisted_for_dataset":persisted})})
    except Exception as exc:
        _mark_ingestion_failed(engine,run_id,exc)
        raise
    return {"dataset_id":dataset_id,"input_count":len(records),"accepted":accepted,"persisted_for_dataset":persisted,"table":"rainfall_observations","run_id":run_id}

def main() -> None:
    p=argparse.ArgumentParser();p.add_argument("path",type=Path);p.add_argument("dataset_id");p.add_argument("--kind",choices=["hotspot","asset","rainfall"],required=True);p.add_argument("--asset-type");p.add_argument("--years",nargs="*",type=int);p.add_argument("--months",nargs="*",type=int);p.add_argument("--rainfall-source",choices=["monthly-imd","district-daily-imd"],default="monthly-imd");a=p.parse_args()
    if a.kind=="rainfall":
        if a.rainfall_source=="district-daily-imd":
            from src.cleaning.clean_imd_daily_district import clean_imd_daily_district
            out,_,_=clean_imd_daily_district(a.path,Path("data/processed/india_imd_bangalore_rural_daily.csv"))
        else:
            from src.cleaning.clean_imd_monthly import clean_imd_monthly
            out,_,_=clean_imd_monthly(a.path,Path("data/processed/bengaluru_imd_rainfall_selected.csv"),years=set(a.years) if a.years else None,months=set(a.months) if a.months else None)
        value=load_rainfall(out,a.dataset_id,str(a.path))
    else: value=load_geospatial(a.path,a.dataset_id,kind=a.kind,asset_type=a.asset_type)
    print(json.dumps(value,indent=2))
if __name__=="__main__":main()
