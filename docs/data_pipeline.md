# Data pipeline

Raw files belong in `data/raw/` and are immutable inputs; processed files and reports belong in `data/processed/` and `data/outputs/`. Current supported inspection formats are CSV, KML, GeoPackage, GeoJSON, and Shapefile. `python -m src.ingestion.inspect_data path/to/file` profiles a file. `python -m src.ingestion.download_datasets URL data/raw/name.ext` downloads bounded public resources without overwriting raw files. `clean_geospatial` reprojects and validates vector files, preserves point/line/polygon geometry, writes GeoJSON and a JSON quality report. `clean_imd_monthly` filters the IMD monthly source without expanding temporal resolution. `clean_imd_daily_district` selects and validates daily district observations; the current file has Bangalore Rural, not Bengaluru Urban. Both rainfall cleaners preserve source resolution.

Database setup: create a least-privilege PostgreSQL database/user externally, copy `.env.example` to `.env`, set DATABASE_URL, then run `python -m src.database.init_db`, `python -m src.database.register_datasets`, the appropriate `load_datasets` commands, and optionally `python -m src.scenarios.generate_scenario`. Initialization is transactional and non-destructive. `python -m src.database.connection` is a connectivity smoke test. Tests use local fixtures and require no download.

## Reproduce the currently loaded sources

Run from the repository root. Direct URLs and hashes are also in `docs/data_sources.csv`.

```powershell
python -m src.ingestion.download_datasets https://data.opencity.in/dataset/b03218ea-4b7c-4fa9-ab67-b9054d7ecc4c/resource/d90fe768-caba-4c6e-b6b5-a75acd5e88a9/download/00fb1229-dcfd-4f59-813f-885e0c629add.kml data/raw/bengaluru_flood_hotspots.kml
python -m src.ingestion.download_datasets https://data.opencity.in/dataset/fc97e05c-c54b-44e9-8d98-7663ee887922/resource/114758e9-c356-46e0-afdb-e1d52f972863/download/03eea514-d4bf-4cd9-8c7b-f904b1ea83f2.kml data/raw/bengaluru_stormwater_primary_2022.kml
python -m src.ingestion.download_datasets https://data.opencity.in/dataset/0a72695d-0c48-4442-b8ee-e2a24b157d66/resource/bd9d5ea1-40c8-4699-87c9-d4a4f303cfff/download/ed239bef-1bf5-4926-8621-2fd84c7db3d0.kml data/raw/bengaluru_bbmp_road_width.kml
python -m src.ingestion.download_datasets https://data.opencity.in/dataset/a7385a69-21c9-4d49-b066-a96dd86a24f6/resource/580edb55-4384-46c6-aeb8-2c21f3425d72/download/580edb55-4384-46c6-aeb8-2c21f3425d72.csv data/raw/bengaluru_imd_monthly_rainfall_1900_2025.csv
python -m src.cleaning.clean_geospatial data/raw/bengaluru_flood_hotspots.kml data/processed/bengaluru_flood_hotspots.geojson --id-column OBJECTID
python -m src.cleaning.clean_geospatial data/raw/bengaluru_stormwater_primary_2022.kml data/processed/bengaluru_stormwater_primary_2022.geojson --id-column OBJECTID_1
python -m src.cleaning.clean_geospatial data/raw/bengaluru_bbmp_road_width.kml data/processed/bengaluru_bbmp_road_width.geojson --id-column OBJECTID
python -m src.database.init_db
python -m src.database.register_datasets
python -m src.database.load_datasets data/processed/bengaluru_flood_hotspots.geojson blr_flood_hotspots --kind hotspot
python -m src.database.load_datasets data/processed/bengaluru_stormwater_primary_2022.geojson blr_stormwater_drains --kind asset --asset-type drain
python -m src.database.load_datasets data/processed/bengaluru_bbmp_road_width.geojson blr_bbmp_road_width --kind asset --asset-type road
python -m src.database.load_datasets data/raw/bengaluru_imd_monthly_rainfall_1900_2025.csv blr_rainfall_imd --kind rainfall --years 2025 --months 5 6
python -m src.database.load_datasets data/raw/rainfall_districtwise_daily_imd.csv india_imd_rain_daily --kind rainfall --rainfall-source district-daily-imd
```

The downloader refuses to overwrite raw files. For a deliberate refresh, choose a new filename and update the manifest after verifying the new resource version. The OSM Overpass attempt is not part of this reproducible loaded set because public endpoints returned server errors; BBMP road-width data is the loaded road layer.
