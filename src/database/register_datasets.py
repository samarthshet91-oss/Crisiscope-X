"""Register source metadata while preserving loaded and deferred source states."""
from sqlalchemy import text
from src.database.connection import get_engine

DATASETS = [
    ("blr_flood_hotspots", "Flooding Locations in Bengaluru Urban - Flood Prone Locations Map", "https://data.opencity.in/dataset/b03218ea-4b7c-4fa9-ab67-b9054d7ecc4c/resource/d90fe768-caba-4c6e-b6b5-a75acd5e88a9/download/00fb1229-dcfd-4f59-813f-885e0c629add.kml", "KML", "Other (Public Domain); credit OpenCity.in / KSRSAC", "raw source preserved; 70 point features validated", "planned"),
    ("blr_stormwater_drains", "Bengaluru Primary Stormwater Drains Map - 2022", "https://data.opencity.in/dataset/fc97e05c-c54b-44e9-8d98-7663ee887922/resource/114758e9-c356-46e0-afdb-e1d52f972863/download/03eea514-d4bf-4cd9-8c7b-f904b1ea83f2.kml", "KML", "Other (Public Domain); credit OpenCity.in / KSRSAC", "primary drain map, 2022 resource; raw file preserved", "planned"),
    ("blr_osm_extract", "OpenStreetMap Bengaluru Overpass extract", "https://overpass.kumi.systems/api/interpreter", "JSON", "ODbL 1.0; OpenStreetMap contributors", "deferred after 502/500 from two public Overpass endpoints", "deferred"),
    ("blr_bbmp_road_width", "Bengaluru Road Width Map", "https://data.opencity.in/dataset/0a72695d-0c48-4442-b8ee-e2a24b157d66/resource/bd9d5ea1-40c8-4699-87c9-d4a4f303cfff/download/ed239bef-1bf5-4926-8621-2fd84c7db3d0.kml", "KML", "Other (Public Domain); credit OpenCity.in / KSRSAC", "23,238 KML road features; raw file preserved", "planned"),
    ("blr_rainfall_ksndmc", "KSNDMC Bengaluru rainfall", "https://data.opencity.in/dataset/?groups=bengaluru&organization=ksndmc", "CSV", "Other (Public Domain)", "catalogue rainfall records are annual/seasonal; not suitable as 1-2 month time series", "deferred"),
    ("blr_rainfall_imd", "Bengaluru Monthly Rainfall Data (1901-2025)", "https://data.opencity.in/dataset/a7385a69-21c9-4d49-b066-a96dd86a24f6/resource/580edb55-4384-46c6-aeb8-2c21f3425d72/download/580edb55-4384-46c6-aeb8-2c21f3425d72.csv", "CSV", "Other (Public Domain); source IMD, catalogue credit OpenCity.in", "monthly city aggregate; May-June 2025 sampled; no station coordinates", "planned"),
    ("india_imd_rain_daily", "India daily rainfall dataset", "https://nwdp.nwic.gov.in/dataset/9380580f-9bf0-4708-9773-0cea3cbc595a/resource/8752174f-1d17-4aaf-8058-2eb396f50157/download/rainfall_districtwise_daily_imd.csv", "CSV", "No license provided", "processed Karnataka / Bangalore Rural daily sample; district data does not represent Bengaluru Urban", "planned"),
    ("blr_imerg_pilot", "NASA GPM IMERG pilot", "https://gpm.nasa.gov/data/imerg", "HDF5/NetCDF", "NASA data policy", "deferred; not required after primary data staged", "deferred"),
    ("ghsl_population", "Copernicus GHSL population/exposure", "https://human-settlement.emergency.copernicus.eu/downloadWizard.php", "Various", "See selected product licence", "optional source; no Bengaluru product acquired", "deferred"),
    ("copernicus_emergency", "Copernicus Emergency Management Service", "https://emergency.copernicus.eu/data/", "Various", "See selected product licence", "no relevant Bengaluru flood product acquired", "deferred"),
]

def main() -> None:
    engine = get_engine()
    with engine.begin() as conn:
        for dataset_id, name, url, fmt, licence, notes, status in DATASETS:
            conn.execute(text("""INSERT INTO dataset_sources(dataset_id,name,source_url,file_format,licence,status,notes)
                VALUES (:id,:name,:url,:fmt,:licence,:status,:notes)
                ON CONFLICT(dataset_id) DO UPDATE SET name=EXCLUDED.name,source_url=EXCLUDED.source_url,
                file_format=EXCLUDED.file_format,licence=EXCLUDED.licence,notes=EXCLUDED.notes,
                status=CASE WHEN dataset_sources.status IN ('planned','deferred') THEN EXCLUDED.status ELSE dataset_sources.status END"""),
                {"id":dataset_id,"name":name,"url":url,"fmt":fmt,"licence":licence,"notes":notes,"status":status})
    print(f"Registered/updated {len(DATASETS)} unique source entries; use each status field to distinguish staged and deferred data.")
if __name__ == "__main__": main()
