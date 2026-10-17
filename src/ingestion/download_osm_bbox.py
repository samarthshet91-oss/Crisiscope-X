"""Fetch a bounded OSM Overpass JSON extract for Bengaluru roads and facilities."""
from __future__ import annotations
import argparse, hashlib, json
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen
import geopandas as gpd
from shapely.geometry import LineString, Point, Polygon

BBOX=(12.78,77.45,13.16,77.82) # south,west,north,east; city-scale extent
ENDPOINT="https://overpass.kumi.systems/api/interpreter"

def acquire(destination: Path) -> dict:
    destination=destination.resolve(); raw=(Path(__file__).resolve().parents[2]/"data/raw").resolve()
    if raw not in destination.parents: raise ValueError("OSM raw extract must be stored under data/raw")
    if destination.exists(): raise FileExistsError(f"Refusing to overwrite raw OSM extract: {destination}")
    south,west,north,east=BBOX
    query=f'''[out:json][timeout:60];
(way["highway"]({south},{west},{north},{east});node["amenity"~"^(hospital|clinic|doctors|fire_station|police)$"]({south},{west},{north},{east});way["amenity"~"^(hospital|clinic|doctors|fire_station|police)$"]({south},{west},{north},{east}););out body geom;'''
    request=Request(ENDPOINT,data=query.encode(),headers={"Content-Type":"application/x-www-form-urlencoded","User-Agent":"CrisiscopeX/1.0 (Bengaluru research extract)"},method="POST")
    with urlopen(request,timeout=90) as response:
        if response.status!=200: raise RuntimeError(f"Overpass HTTP {response.status}")
        body=response.read(100_000_001)
    if len(body)>100_000_000: raise ValueError("OSM extract exceeds 100 MB safety limit")
    payload=json.loads(body)
    if "elements" not in payload: raise ValueError("Overpass response is not an elements dataset")
    destination.parent.mkdir(parents=True,exist_ok=True); destination.write_bytes(body)
    return {"source":ENDPOINT,"path":str(destination),"extracted_at":datetime.now(timezone.utc).isoformat(),"bbox":BBOX,
      "elements":len(payload["elements"]),"bytes":len(body),"sha256":hashlib.sha256(body).hexdigest(),"payload":payload}

def to_geojson(payload: dict, destination: Path) -> dict:
    features=[]; rejected=0
    for element in payload["elements"]:
        tags=element.get("tags",{}); kind="road" if "highway" in tags else f"facility:{tags.get('amenity')}"
        try:
            if element["type"]=="node": geom=Point(element["lon"],element["lat"])
            else:
                coords=[(p["lon"],p["lat"]) for p in element.get("geometry",[])]
                if len(coords)<2: raise ValueError("way geometry unavailable")
                if "amenity" in tags and coords[0]==coords[-1] and len(coords)>=4: geom=Polygon(coords)
                else: geom=LineString(coords)
            properties={"asset_id":f"osm:{element['type']}/{element['id']}","osm_type":element["type"],"osm_id":element["id"],"asset_type":kind,"name":tags.get("name"),"tags":tags,"source_type":"observed"}
            features.append({"type":"Feature","geometry":geom.__geo_interface__,"properties":properties})
        except Exception: rejected+=1
    frame=gpd.GeoDataFrame.from_features(features,crs="EPSG:4326")
    destination.parent.mkdir(parents=True,exist_ok=True); frame.to_file(destination,driver="GeoJSON")
    return {"features":len(frame),"rejected":rejected,"geometry_types":frame.geom_type.value_counts().to_dict(),"processed_path":str(destination)}

def main() -> None:
    p=argparse.ArgumentParser();p.add_argument("--raw",type=Path,default=Path("data/raw/bengaluru_osm_roads_facilities.json"));p.add_argument("--processed",type=Path,default=Path("data/processed/bengaluru_osm_roads_facilities.geojson"));a=p.parse_args()
    acquired=acquire(a.raw); result=to_geojson(acquired.pop("payload"),a.processed); print(json.dumps({**acquired,**result},indent=2))
if __name__=="__main__":main()
