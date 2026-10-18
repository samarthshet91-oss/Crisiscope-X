-- CRISISCOPE X — Deterministic Seed Data
-- Seeds benchmark scenarios, facilities, and dataset records

INSERT INTO datasets (id, name, file_type, record_count, source_provenance, classification, validation_status)
VALUES 
('BUILTIN_BENGALURU_SYNTHETIC', 'Bengaluru Urban Metro Synthetic Benchmark Array', 'Composite', 32, 'Deterministic PRNG Seed (20260415)', 'SYNTHETIC_FIXTURE', 'SYNTHETIC_VERIFIED')
ON CONFLICT (id) DO NOTHING;

INSERT INTO scenarios (id, name, description, rainfall_intensity_mm_per_hr, rainfall_duration_hours, rainfall_profile, catchment_zone, start_time, declared_disruptions, mitigation_pumps_deployed, drainage_clearance_active, traffic_preemptive_rerouting)
VALUES
('SCENARIO-HEAVY-RAIN', 'Heavy Rainfall', 'Intense precipitation (65 mm/hr) over Hebbal Valley with all arterial corridors currently operational.', 65, 4, 'Convective Peak', 'Hebbal Valley', '2026-10-17 21:00:00+00', '[]'::jsonb, false, false, false),
('SCENARIO-URBAN-FLOOD', 'Urban Flooding Hypothesis', 'Sustained 85 mm/hr downpour over Bellandur Basin with multiple arterial inundations and Silk Board chokepoint severance.', 85, 5, 'Convective Peak', 'Bellandur Basin', '2026-10-17 21:00:00+00', '["SYNTH-ROAD-05", "SYNTH-ROAD-06", "SYNTH-ROAD-07"]'::jsonb, false, false, false),
('SCENARIO-ROAD-DISRUPTION', 'Road Disruption', 'Moderate rain (45 mm/hr) coupled with physical blockades on Koramangala and Majestic arterial corridors.', 45, 3, 'Uniform Steady', 'Koramangala Ridge', '2026-10-17 21:00:00+00', '["SYNTH-ROAD-04", "SYNTH-ROAD-05"]'::jsonb, false, true, true),
('SCENARIO-MULTI-INFRA', 'Multi-Infrastructure Emergency', 'Severe cloudburst (110 mm/hr) over Bellandur with power substation outage and severed ambulance corridors.', 110, 6, 'Back-loaded Surge', 'Bellandur Basin', '2026-10-17 21:00:00+00', '["SYNTH-ROAD-04", "SYNTH-ROAD-05", "SYNTH-ROAD-06", "SYNTH-ROAD-07", "SYNTH-ROAD-10"]'::jsonb, true, false, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO facilities (id, name, facility_type, latitude, longitude, capacity, current_utilization_pct, generator_elevation_m, access_node_id, backup_power_status)
VALUES
('SYNTH-HOSP-01', 'Victoria Central Care Synth Hospital', 'HOSPITAL', 12.9644, 77.5746, 450, 78, 1.8, 'NODE-CENTRAL-MAJESTIC', 'ACTIVE'),
('SYNTH-HOSP-02', 'Bowring Lady Curzon Synth Medical', 'HOSPITAL', 12.9818, 77.6042, 320, 82, 2.1, 'NODE-MG-ROAD-JUNCTION', 'ACTIVE'),
('SYNTH-HOSP-03', 'St. John Trauma & Tertiary Synth', 'HOSPITAL', 12.9315, 77.6190, 600, 91, 0.9, 'NODE-KORAMANGALA-SONY', 'STANDBY'),
('SYNTH-HOSP-04', 'Manipal East Synthetic Healthcare', 'HOSPITAL', 12.9580, 77.6490, 380, 74, 2.4, 'NODE-INDIRANAGAR-100FT', 'ACTIVE'),
('SYNTH-HOSP-05', 'Sakra World Multi-Specialty Synth', 'HOSPITAL', 12.9272, 77.6854, 290, 86, 0.8, 'NODE-BELLANDUR-ECOSPACE', 'AT_RISK'),
('SYNTH-POWER-01', 'BESCOM 220kV Master Substation Synth', 'POWER_SUBSTATION', 12.9150, 77.6320, 500, 88, 0.7, 'NODE-SILKBOARD-JUNCTION', 'AT_RISK')
ON CONFLICT (id) DO NOTHING;
