# Data dictionary

All timestamps in database contracts use timezone-aware UTC. Coordinates use WGS84 decimal degrees (EPSG:4326) when present. `rainfall_mm` is millimetres. The staged rainfall data is historical; no live/current rainfall feed is loaded.

| Field | Type | Nullable | Meaning |
|---|---|---:|---|
| dataset_id | text | no | Stable source-catalogue key |
| source_dataset_id | text | yes | Foreign key to dataset_sources |
| observed_at | timestamptz | yes | Observation time, UTC |
| observation_key | text | yes | Unique deterministic natural key used for repeat-safe rainfall upserts |
| latitude / longitude | double precision | yes | WGS84 point coordinate; absent for non-point geometry |
| rainfall_mm | double precision | yes | Rain amount in millimetres |
| source_type | text | no | observed, historical, derived, synthetic, or model_estimate |
| quality_status | text | no | Validation state, e.g. accepted, rejected, unverified |
| raw_attributes / attributes | jsonb | no | Original flexible source properties |
| asset_id / hotspot_id | text | no | Stable source-derived identifier |
| scenario_id / event_id | text | no | Stable scenario/event identifiers; demo data is synthetic |

`infrastructure_assets.attributes.geometry` is a GeoJSON geometry object in EPSG:4326, retained for interoperability; it does not support PostGIS spatial SQL. `attributes` also retains source fields such as BBMP road width/hierarchy columns and source object IDs. City-level monthly IMD rainfall has null coordinates and `raw_attributes.temporal_resolution="monthly"`; query it by period, not by point bounds. NWIC/IMD daily rainfall similarly has null coordinates and `temporal_resolution="daily"`; the loaded records refer to Bangalore Rural district only. Query the two sources independently by `source_dataset_id` to preserve spatial/time-resolution semantics.
