"""Inspect local CSV and vector datasets without modifying raw inputs."""
from pathlib import Path
import json
import pandas as pd

def inspect(path: Path) -> dict:
    suffix = path.suffix.lower()
    if suffix == ".csv":
        frame = pd.read_csv(path)
        return {"path": str(path), "format": "CSV", "rows": len(frame), "columns": list(frame.columns)}
    if suffix in {".kml", ".gpkg", ".geojson", ".shp"}:
        import geopandas as gpd
        frame = gpd.read_file(path)
        return {"path": str(path), "format": suffix[1:].upper(), "rows": len(frame),
                "columns": list(frame.columns), "crs": str(frame.crs),
                "bounds": frame.total_bounds.tolist(), "geometry_types": sorted(frame.geom_type.dropna().unique())}
    raise ValueError(f"Unsupported file format: {suffix}")

def main() -> None:
    import argparse
    parser = argparse.ArgumentParser(); parser.add_argument("path", type=Path)
    print(json.dumps(inspect(parser.parse_args().path), indent=2))
if __name__ == "__main__": main()
