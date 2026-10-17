"""Validate and normalize vector data while retaining complete geometries."""
from __future__ import annotations
import hashlib, json
from pathlib import Path
import geopandas as gpd
from shapely.geometry import mapping
from src.validation.checks import quality_report, save_report, stable_id
import argparse

def clean_geospatial(source: Path, output_geojson: Path, *, id_column: str | None = None,
                     expected_city_bounds=(76.2, 12.4, 78.1, 13.6)) -> tuple[gpd.GeoDataFrame, dict]:
    frame = gpd.read_file(source)
    count = len(frame); issues=[]; accepted=[]; rejected=[]
    if frame.crs is None: raise ValueError("Source vector dataset has no CRS; refusing to guess coordinates")
    original_crs = str(frame.crs)
    frame = frame.to_crs("EPSG:4326")
    west,south,east,north = expected_city_bounds
    geom_name = frame.geometry.name
    for _, row in frame.iterrows():
        geom = row[geom_name]
        props = row.drop(labels=[geom_name]).to_dict()
        reason=[]
        if geom is None or geom.is_empty: reason.append("null_or_empty_geometry")
        elif not geom.is_valid:
            try:
                repaired = geom.make_valid()
                if repaired.is_valid and not repaired.is_empty: geom=repaired; props["geometry_repair_method"]="shapely.make_valid"
                else: reason.append("invalid_geometry_unrepairable")
            except Exception: reason.append("invalid_geometry_unrepairable")
        if geom is not None and not geom.is_empty:
            bx=geom.bounds
            if bx[2] < west or bx[0] > east or bx[3] < south or bx[1] > north:
                reason.append("outside_expected_coverage")
        if reason:
            rejected.append({"source_id":str(props.get(id_column,"")) if id_column else None,"reasons":reason})
            continue
        source_id = props.get(id_column) if id_column and id_column in props else None
        if source_id is None or str(source_id).strip()=="":
            key=json.dumps({"geometry":mapping(geom),"properties":props},sort_keys=True,default=str)
            source_id=hashlib.sha256(key.encode()).hexdigest()
        props["asset_id"] = stable_id("asset", source.name, source_id)
        props["source_crs"] = original_crs
        accepted.append({**props,geom_name:geom})
    result=gpd.GeoDataFrame(accepted,geometry=geom_name,crs="EPSG:4326") if accepted else gpd.GeoDataFrame(columns=[geom_name],geometry=geom_name,crs="EPSG:4326")
    output_geojson.parent.mkdir(parents=True,exist_ok=True)
    result.to_file(output_geojson,driver="GeoJSON")
    report=quality_report(source.name,str(source),count,len(result),len(rejected),
      [{"severity":"error","reason":r["reasons"],"source_id":r["source_id"]} for r in rejected])
    report.update(original_crs=original_crs,output_crs="EPSG:4326",output_path=str(output_geojson),geometry_types=sorted(result.geom_type.dropna().unique().tolist()),rejected_records=rejected)
    save_report(report,output_geojson.parent.parent / "outputs" / f"{output_geojson.stem}_quality.json")
    return result,report

def main() -> None:
    parser=argparse.ArgumentParser();parser.add_argument("source",type=Path);parser.add_argument("output",type=Path);parser.add_argument("--id-column");args=parser.parse_args()
    _,report=clean_geospatial(args.source,args.output,id_column=args.id_column)
    print(json.dumps(report,indent=2))

if __name__=="__main__": main()
