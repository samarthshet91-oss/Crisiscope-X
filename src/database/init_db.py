from sqlalchemy import text

from src.database.connection import get_engine

SCHEMA_SQL = [
    """
    CREATE TABLE IF NOT EXISTS dataset_sources (
        dataset_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        source_url TEXT,
        local_path TEXT,
        file_format TEXT,
        licence TEXT,
        status TEXT NOT NULL DEFAULT 'planned',
        downloaded_at TIMESTAMPTZ,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS rainfall_observations (
        observation_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        source_dataset_id TEXT REFERENCES dataset_sources(dataset_id),
        observed_at TIMESTAMPTZ,
        location_name TEXT,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        rainfall_mm DOUBLE PRECISION,
        source_type TEXT NOT NULL DEFAULT 'historical',
        quality_status TEXT NOT NULL DEFAULT 'unverified',
        raw_attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        observation_key TEXT,
        CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
        CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
        CHECK (rainfall_mm IS NULL OR rainfall_mm >= 0)
    )
    """,
    "ALTER TABLE rainfall_observations ADD COLUMN IF NOT EXISTS observation_key TEXT",
    "CREATE UNIQUE INDEX IF NOT EXISTS uq_rainfall_observation_key ON rainfall_observations(observation_key)",
    """
    CREATE TABLE IF NOT EXISTS flood_hotspots (
        hotspot_id TEXT PRIMARY KEY,
        source_dataset_id TEXT REFERENCES dataset_sources(dataset_id),
        name TEXT,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        source_type TEXT NOT NULL DEFAULT 'historical',
        raw_attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
        CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
        CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS infrastructure_assets (
        asset_id TEXT PRIMARY KEY,
        asset_type TEXT NOT NULL,
        name TEXT,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        source_dataset_id TEXT REFERENCES dataset_sources(dataset_id),
        source_type TEXT NOT NULL DEFAULT 'observed',
        attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
        CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
        CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
    )
    """,
    "ALTER TABLE infrastructure_assets ALTER COLUMN source_type SET DEFAULT 'observed'",
    """
    CREATE TABLE IF NOT EXISTS scenarios (
        scenario_id TEXT PRIMARY KEY,
        scenario_name TEXT NOT NULL,
        city TEXT NOT NULL,
        hazard TEXT NOT NULL,
        data_mode TEXT NOT NULL,
        scenario_payload JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS scenario_events (
        event_id TEXT PRIMARY KEY,
        scenario_id TEXT NOT NULL REFERENCES scenarios(scenario_id)
            ON DELETE CASCADE,
        event_type TEXT NOT NULL,
        asset_id TEXT,
        severity TEXT,
        source_type TEXT NOT NULL,
        event_payload JSONB NOT NULL DEFAULT '{}'::jsonb
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS data_quality_reports (
        report_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        dataset_id TEXT REFERENCES dataset_sources(dataset_id),
        checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        status TEXT NOT NULL,
        rows_checked BIGINT,
        issue_count INTEGER NOT NULL DEFAULT 0,
        details JSONB NOT NULL DEFAULT '{}'::jsonb
    )
    """,
    """CREATE TABLE IF NOT EXISTS ingestion_runs (
        run_id TEXT PRIMARY KEY, dataset_id TEXT REFERENCES dataset_sources(dataset_id),
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), finished_at TIMESTAMPTZ,
        status TEXT NOT NULL, rows_read BIGINT NOT NULL DEFAULT 0,
        rows_accepted BIGINT NOT NULL DEFAULT 0, rows_rejected BIGINT NOT NULL DEFAULT 0,
        details JSONB NOT NULL DEFAULT '{}'::jsonb
    )""",
    """
    CREATE INDEX IF NOT EXISTS idx_rainfall_observed_at
    ON rainfall_observations(observed_at)
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_assets_type
    ON infrastructure_assets(asset_type)
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_scenario_events_scenario
    ON scenario_events(scenario_id)
    """,
    "CREATE INDEX IF NOT EXISTS idx_rainfall_source_dataset ON rainfall_observations(source_dataset_id)",
    "CREATE INDEX IF NOT EXISTS idx_assets_source_dataset ON infrastructure_assets(source_dataset_id)",
    "CREATE INDEX IF NOT EXISTS idx_quality_source_dataset ON data_quality_reports(dataset_id)",
]


def main() -> None:
    engine = get_engine()

    with engine.begin() as connection:
        for statement in SCHEMA_SQL:
            connection.execute(text(statement))

    print("Crisiscope X database schema created successfully.")


if __name__ == "__main__":
    main()
