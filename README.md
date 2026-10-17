# CrisiscopeX Data Pipeline

CrisiscopeX contains a Python pipeline for collecting, validating, and loading Bengaluru flood related datasets into PostgreSQL. It keeps the original files intact, records data quality reports, and preserves source details for later review.

This README covers the repository root pipeline (`src/`). A separate prototype lives in [`crisiscope_py/`](crisiscope_py/); see its [`README_DEPLOYMENT.md`](crisiscope_py/README_DEPLOYMENT.md) for that app.

## What the pipeline does

- Inspects CSV and geospatial files before processing.
- Downloads public data into `data/raw/` without overwriting an existing raw file.
- Cleans rainfall and vector datasets while retaining rejected rows or quality findings for audit.
- Loads source metadata and cleaned records into PostgreSQL.
- Stores repeat safe ingestion runs, quality reports, and deterministic record IDs.
- Builds a clearly labelled synthetic demonstration scenario.

The pipeline does not provide live flood warnings or current road status. See [Limitations](docs/limitations.md) before interpreting the data.

## Repository layout

```text
src/
  cleaning/       Rainfall and geospatial cleaners
  database/       PostgreSQL schema, loaders, and read-only repositories
  ingestion/      Dataset inspection and download helpers
  scenarios/      Synthetic demonstration scenario
  validation/     Shared normalization and quality checks
data/
  raw/            Original inputs; do not edit in place
  processed/      Normalized data products
  outputs/        Quality reports
  scenarios/      Synthetic scenario fixtures
docs/             Pipeline, schema, source, and data contract notes
tests/            Pipeline tests
crisiscope_py/    Separate application prototype and its tests
```

## Requirements and setup

Use Python and PostgreSQL. Install Python dependencies from the repository root:

### Windows PowerShell

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### macOS or Linux

```sh
python3 -m venv .venv
. .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

The `crisiscope_py/` prototype has its own dependency file at `crisiscope_py/requirements.txt`; install that file only when working on the prototype.

## Configure PostgreSQL

Create a PostgreSQL database and user, then copy `.env.example` to `.env` and set `DATABASE_URL` to the connection string for that database:

```text
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DATABASE
```

Keep `.env` private and never commit database credentials. The schema initializer uses additive, repeatable DDL. It does not create a database or user for you.

Initialize the schema and register the source catalogue:

```sh
python -m src.database.init_db
python -m src.database.register_datasets
```

`init_db` and `register_datasets` require a reachable PostgreSQL server. You can check the connection with:

```sh
python -m src.database.connection
```

## Common workflow

Run commands from the repository root. Raw files are immutable inputs; the downloader refuses to overwrite an existing destination.

Inspect a file:

```sh
python -m src.ingestion.inspect_data path/to/file.csv
```

Download a public source into `data/raw/`:

```sh
python -m src.ingestion.download_datasets URL data/raw/source-file.csv
```

Clean a vector dataset to GeoJSON and emit a quality report:

```sh
python -m src.cleaning.clean_geospatial \
  data/raw/source-file.kml \
  data/processed/source-file.geojson \
  --id-column SOURCE_ID
```

Load a cleaned geospatial dataset after initializing PostgreSQL and registering sources:

```sh
python -m src.database.load_datasets \
  data/processed/source-file.geojson DATASET_ID \
  --kind asset --asset-type road
```

Load a monthly IMD rainfall sample (this command also cleans the selected months):

```sh
python -m src.database.load_datasets \
  data/raw/bengaluru_imd_monthly_rainfall_1900_2025.csv \
  blr_rainfall_imd --kind rainfall --years 2025 --months 5 6
```

Load the daily district dataset with its district series kept separate:

```sh
python -m src.database.load_datasets \
  data/raw/rainfall_districtwise_daily_imd.csv \
  india_imd_rain_daily --kind rainfall --rainfall-source district-daily-imd
```

For the complete reproducible source commands and current dataset manifest, see [`docs/data_pipeline.md`](docs/data_pipeline.md) and [`docs/data_sources.csv`](docs/data_sources.csv).

## Tests

From the repository root, run:

```sh
python -m pytest -q
```

The suite covers both the root pipeline and the `crisiscope_py/` prototype. Tests use local fixtures and do not download data or require PostgreSQL.

## Data and interpretation notes

- `rainfall_mm` is always millimetres. Timestamps stored in the database are timezone aware and normalized to UTC.
- Monthly city aggregate rainfall has no station coordinates. Daily IMD/NWIC records represent Bangalore Rural district, not Bengaluru Urban.
- Vector features retain their full geometry in EPSG:4326. Line and polygon features do not receive invented point coordinates. This project does not require PostGIS and does not provide spatial SQL over those geometries.
- The demonstration scenario and its events are synthetic. They do not assert real road closures or facility conditions.

See [`docs/data_dictionary.md`](docs/data_dictionary.md), [`docs/data_contracts.md`](docs/data_contracts.md), and [`docs/database_schema.md`](docs/database_schema.md) for field semantics and database details.
