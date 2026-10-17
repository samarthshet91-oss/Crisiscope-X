# Data contracts

Import read-only functions from `src.database.repositories`: `rainfall_for_area(start_utc, end_utc, west, south, east, north)` for geolocated observations, `rainfall_for_period(start_utc, end_utc, dataset_id=None)` for temporal data including city/month aggregates without coordinates, `flood_hotspots(dataset_id=None)`, `infrastructure_assets(asset_type=None, dataset_id=None)`, `dataset_status()`, `quality_reports(dataset_id=None)`, and `scenario(scenario_id)`. They return SQLAlchemy mapping rows (scenario returns `{scenario, events}` or `None`). Bounds and times are inclusive west/south, exclusive end time; rainfall units are mm and coordinates are EPSG:4326 when supplied.

IDs are stable text keys sourced from source IDs or deterministic hashes. Null coordinates mean a feature is not a point; do not infer a point from a line/polygon. Processed features retain full EPSG:4326 GeoJSON geometry in the PostgreSQL `attributes.geometry` JSONB member and processed GeoJSON file, plus the source CRS in `attributes.source_crs` and `attributes.geometry_repair_method` when a repair was needed. This does not enable spatial SQL. The loaded BBMP road-width records expose `asset_id`, `asset_type='road'`, `name` when supplied, and original BBMP properties including `OBJECTID`, road-width and hierarchy fields under JSONB `attributes`; OSM IDs are unavailable because Overpass failed. `source_type` distinguishes observed, historical, derived, synthetic, and model_estimate. The demonstration `BLR-FLOOD-001` and both events are synthetic, with unmatched asset IDs (`null`).

Rainfall dataset IDs intentionally separate resolutions and locations: `blr_rainfall_imd` is a Bengaluru city aggregate at monthly resolution (May-June 2025 sample), and `india_imd_rain_daily` is a Bangalore Rural district daily series (2026-08-19 through 2026-10-16). The latter is not a Bengaluru Urban series. Both have null coordinates and belong in `rainfall_for_period`; use `dataset_id` to avoid mixing incompatible series. The NWIC resource reports no license provided.

Sample record (matches the generated scenario payload):

```json
{"scenario_id":"BLR-FLOOD-001","data_mode":"synthetic","hazard":"urban_flooding","illustrative_rainfall":{"amount_mm":85,"duration_hours":3,"source_type":"synthetic"}}
```

`docs/data_samples.json` contains examples and dataset row counts sampled from the populated PostgreSQL tables.
