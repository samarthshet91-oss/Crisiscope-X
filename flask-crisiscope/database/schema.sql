-- CRISISCOPE X — PostgreSQL Relational Schema
-- Database: crisiscope_db
-- Purpose: Persistent scenario assessment records, infrastructure assets, dependency topology, and incident alerts.

CREATE TABLE IF NOT EXISTS datasets (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    file_type VARCHAR(64) NOT NULL,
    record_count INTEGER NOT NULL DEFAULT 0,
    source_provenance VARCHAR(255) NOT NULL,
    classification VARCHAR(64) NOT NULL DEFAULT 'SYNTHETIC_FIXTURE',
    validation_status VARCHAR(64) NOT NULL DEFAULT 'SYNTHETIC_VERIFIED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS facilities (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    facility_type VARCHAR(64) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 0,
    current_utilization_pct INTEGER NOT NULL DEFAULT 0,
    generator_elevation_m DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    access_node_id VARCHAR(64) NOT NULL,
    backup_power_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    provenance VARCHAR(64) NOT NULL DEFAULT 'SYNTHETIC_DEMO_FIXTURE_V1',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS road_segments (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    from_node_id VARCHAR(64) NOT NULL,
    to_node_id VARCHAR(64) NOT NULL,
    coordinates JSONB NOT NULL,
    length_meters INTEGER NOT NULL,
    elevation_meters INTEGER NOT NULL,
    culvert_capacity_mm_per_hr INTEGER NOT NULL DEFAULT 40,
    vulnerability_index DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    is_disrupted BOOLEAN NOT NULL DEFAULT FALSE,
    disruption_reason TEXT,
    speed_limit_kmh INTEGER NOT NULL DEFAULT 50,
    provenance VARCHAR(64) NOT NULL DEFAULT 'SYNTHETIC_DEMO_FIXTURE_V1'
);

CREATE TABLE IF NOT EXISTS dependency_edges (
    id VARCHAR(64) PRIMARY KEY,
    from_node_id VARCHAR(64) NOT NULL,
    to_node_id VARCHAR(64) NOT NULL,
    dependency_type VARCHAR(64) NOT NULL,
    weight DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    criticality VARCHAR(32) NOT NULL DEFAULT 'HIGH',
    is_severed BOOLEAN NOT NULL DEFAULT FALSE,
    provenance VARCHAR(64) NOT NULL DEFAULT 'SYNTHETIC_DEMO_FIXTURE_V1'
);

CREATE TABLE IF NOT EXISTS scenarios (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rainfall_intensity_mm_per_hr DOUBLE PRECISION NOT NULL,
    rainfall_duration_hours INTEGER NOT NULL,
    rainfall_profile VARCHAR(64) NOT NULL,
    catchment_zone VARCHAR(128) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    declared_disruptions JSONB NOT NULL DEFAULT '[]'::jsonb,
    facility_capacity_reductions JSONB NOT NULL DEFAULT '{}'::jsonb,
    mitigation_pumps_deployed BOOLEAN NOT NULL DEFAULT FALSE,
    drainage_clearance_active BOOLEAN NOT NULL DEFAULT FALSE,
    traffic_preemptive_rerouting BOOLEAN NOT NULL DEFAULT FALSE,
    provenance VARCHAR(64) NOT NULL DEFAULT 'SYNTHETIC_DEMO_FIXTURE_V1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scenario_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id VARCHAR(64) REFERENCES scenarios(id) ON DELETE CASCADE,
    accumulated_rainfall_mm DOUBLE PRECISION NOT NULL,
    scenario_severity_index INTEGER NOT NULL,
    effective_soil_saturation_pct DOUBLE PRECISION NOT NULL,
    synthetic_runoff_volume_m3 BIGINT NOT NULL,
    declared_disruptions_count INTEGER NOT NULL,
    exposed_facilities_count INTEGER NOT NULL,
    isolated_facilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    severed_edges_count INTEGER NOT NULL,
    cascade_risk_score INTEGER NOT NULL,
    reachability_summary JSONB NOT NULL,
    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(32) NOT NULL,
    category VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    affected_asset_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    affected_asset_names JSONB NOT NULL DEFAULT '[]'::jsonb,
    source VARCHAR(128) NOT NULL,
    rule_origin VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Indices for rapid querying
CREATE INDEX IF NOT EXISTS idx_scenarios_catchment ON scenarios(catchment_zone);
CREATE INDEX IF NOT EXISTS idx_assessments_scenario_id ON scenario_assessments(scenario_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_facilities_access_node ON facilities(access_node_id);
