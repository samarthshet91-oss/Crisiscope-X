# Crisiscope X data layer

This repository provides PostgreSQL storage and a tested data ingestion path for verified static Bengaluru map data, historical monthly Bengaluru rainfall, and district-level daily IMD rainfall for Bangalore Rural. The daily district dataset does not represent Bengaluru Urban. It does **not** provide live flood detection. Loaded map layers are snapshots.

## Setup

Use Python 3.12 or 3.13 where possible (the current scaffold was inspected under Python 3.14.4). Install dependencies with `python -m pip install -r requirements.txt`. Install PostgreSQL separately, create an empty database and least-privilege user, copy `.env.example` to `.env`, and set `DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/crisiscope_x`.

## Commands

```powershell
python -m src.database.connection
python -m src.database.init_db
python -m src.database.register_datasets
python -m src.ingestion.inspect_data data/raw/bengaluru_flood_hotspots.kml
python -m src.cleaning.clean_geospatial data/raw/bengaluru_flood_hotspots.kml data/processed/bengaluru_flood_hotspots.geojson --id-column OBJECTID
python -m src.database.load_datasets data/processed/bengaluru_flood_hotspots.geojson blr_flood_hotspots --kind hotspot
python -m src.database.load_datasets data/processed/bengaluru_stormwater_primary_2022.geojson blr_stormwater_drains --kind asset --asset-type drain
python -m src.database.load_datasets data/processed/bengaluru_bbmp_road_width.geojson blr_bbmp_road_width --kind asset --asset-type road
python -m src.database.load_datasets data/raw/bengaluru_imd_monthly_rainfall_1900_2025.csv blr_rainfall_imd --kind rainfall --years 2025 --months 5 6
python -m src.database.load_datasets data/raw/rainfall_districtwise_daily_imd.csv india_imd_rain_daily --kind rainfall --rainfall-source district-daily-imd
python -m src.scenarios.generate_scenario --dry-run
python -m src.scenarios.generate_scenario
python -m src.ingestion.inspect_data data/raw/example.csv
python -m pytest -q
```

Raw downloads are ignored by Git and never overwritten. The source manifest records exact resource URLs, hashes, statuses, and limitations. Initialization is repeatable and does not drop tables. Never place credentials in source control. Details are in `docs/`.

## Team integration

Use `src.database.repositories` for parameterized, read-only access. See [data contracts](docs/data_contracts.md), [data dictionary](docs/data_dictionary.md), [pipeline](docs/data_pipeline.md), [schema](docs/database_schema.md), and [limitations](docs/limitations.md). Scenario `BLR-FLOOD-001` is synthetic and illustrative only.
