"""
CRISISCOPE X — Dataset Service
Manages telemetric observations, infrastructure facilities, road segments, and dataset validation.
"""

import json
import csv
import io
import datetime
from typing import List, Dict, Any, Optional

INITIAL_RAINFALL_STATIONS = [
    {
        "stationId": "SYNTH-STN-01",
        "name": "Hebbal Lake Telemetric Basin",
        "latitude": 13.0358,
        "longitude": 77.5970,
        "intensityMmPerHour": 72.0,
        "accumulatedRainfallMm": 142.5,
        "timestamp": "2026-10-17T21:00:00Z",
        "sourceCategory": "Synthetic Telemetric Gauge Array",
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1",
        "status": "OPERATIONAL",
    },
    {
        "stationId": "SYNTH-STN-02",
        "name": "Bellandur Wetland Surcharge Station",
        "latitude": 12.9260,
        "longitude": 77.6762,
        "intensityMmPerHour": 94.0,
        "accumulatedRainfallMm": 188.0,
        "timestamp": "2026-10-17T21:00:00Z",
        "sourceCategory": "Synthetic Telemetric Gauge Array",
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1",
        "status": "OPERATIONAL",
    },
    {
        "stationId": "SYNTH-STN-03",
        "name": "Silk Board Junction Inundation Monitor",
        "latitude": 12.9176,
        "longitude": 77.6238,
        "intensityMmPerHour": 88.0,
        "accumulatedRainfallMm": 172.4,
        "timestamp": "2026-10-17T21:00:00Z",
        "sourceCategory": "Synthetic Telemetric Gauge Array",
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1",
        "status": "OPERATIONAL",
    },
    {
        "stationId": "SYNTH-STN-04",
        "name": "Majestic Urban Core Telemetry",
        "latitude": 12.9774,
        "longitude": 77.5708,
        "intensityMmPerHour": 54.0,
        "accumulatedRainfallMm": 110.2,
        "timestamp": "2026-10-17T21:00:00Z",
        "sourceCategory": "Synthetic Telemetric Gauge Array",
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1",
        "status": "OPERATIONAL",
    },
    {
        "stationId": "SYNTH-STN-05",
        "name": "Koramangala 80ft Storm Ridge Sensor",
        "latitude": 12.9352,
        "longitude": 77.6245,
        "intensityMmPerHour": 82.0,
        "accumulatedRainfallMm": 164.8,
        "timestamp": "2026-10-17T21:00:00Z",
        "sourceCategory": "Synthetic Telemetric Gauge Array",
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1",
        "status": "OPERATIONAL",
    },
    {
        "stationId": "SYNTH-STN-06",
        "name": "Marathahalli Rail Overbridge Gauge",
        "latitude": 12.9569,
        "longitude": 77.7011,
        "intensityMmPerHour": 68.0,
        "accumulatedRainfallMm": 139.0,
        "timestamp": "2026-10-17T21:00:00Z",
        "sourceCategory": "Synthetic Telemetric Gauge Array",
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1",
        "status": "OPERATIONAL",
    },
    {
        "stationId": "SYNTH-STN-07",
        "name": "Electronic City Elevated Tollway Gauge",
        "latitude": 12.8452,
        "longitude": 77.6602,
        "intensityMmPerHour": 42.0,
        "accumulatedRainfallMm": 86.4,
        "timestamp": "2026-10-17T21:00:00Z",
        "sourceCategory": "Synthetic Telemetric Gauge Array",
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1",
        "status": "OPERATIONAL",
    },
    {
        "stationId": "SYNTH-STN-08",
        "name": "Whitefield ITPL Catchment Unit",
        "latitude": 12.9840,
        "longitude": 77.7520,
        "intensityMmPerHour": 59.0,
        "accumulatedRainfallMm": 124.0,
        "timestamp": "2026-10-17T21:00:00Z",
        "sourceCategory": "Synthetic Telemetric Gauge Array",
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1",
        "status": "OPERATIONAL",
    },
]

INITIAL_FACILITIES = [
    {
        "id": "SYNTH-HOSP-01",
        "name": "Victoria Central Care Hospital",
        "type": "HOSPITAL",
        "latitude": 12.9644,
        "longitude": 77.5746,
        "capacity": 450,
        "currentUtilizationPct": 78,
        "generatorElevationM": 1.8,
        "accessNodeId": "NODE-CENTRAL-MAJESTIC",
        "backupPowerStatus": "ACTIVE",
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1",
        "notes": "Regional primary trauma care center. High reliance on Majestic interchange."
    },
    {
        "id": "SYNTH-HOSP-02",
        "name": "Manipal Emergency Trauma Center",
        "type": "HOSPITAL",
        "latitude": 12.9582,
        "longitude": 77.6492,
        "capacity": 320,
        "currentUtilizationPct": 85,
        "generatorElevationM": 2.4,
        "accessNodeId": "NODE-INDIRANAGAR-100FT",
        "backupPowerStatus": "ACTIVE",
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1",
        "notes": "Critical cardiac and pediatric units. Direct ambulance corridor via Old Airport Rd."
    },
    {
        "id": "SYNTH-HOSP-03",
        "name": "St. John's Super-Specialty Medical Hub",
        "type": "HOSPITAL",
        "latitude": 12.9312,
        "longitude": 77.6205,
        "capacity": 550,
        "currentUtilizationPct": 92,
        "generatorElevationM": 0.4,
        "accessNodeId": "NODE-KORAMANGALA-SONY",
        "backupPowerStatus": "AT_RISK",
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1",
        "notes": "Low basement generator elevation at 0.4m. Highly vulnerable to Koramangala runoff surge."
    },
    {
        "id": "SYNTH-HOSP-04",
        "name": "Sakra World Healthcare Complex",
        "type": "HOSPITAL",
        "latitude": 12.9268,
        "longitude": 77.6835,
        "capacity": 280,
        "currentUtilizationPct": 70,
        "generatorElevationM": 1.5,
        "accessNodeId": "NODE-BELLANDUR-ECOSPACE",
        "backupPowerStatus": "ACTIVE",
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1",
        "notes": "Bellandur basin catchment adjacency. High risk of road isolation if ORR floods."
    },
    {
        "id": "SYNTH-SHELTER-01",
        "name": "Kanteerava Multi-Purpose Relief Shelter",
        "type": "RELIEF_SHELTER",
        "latitude": 12.9698,
        "longitude": 77.5928,
        "capacity": 1200,
        "currentUtilizationPct": 22,
        "generatorElevationM": 3.0,
        "accessNodeId": "NODE-MG-ROAD-JUNCTION",
        "backupPowerStatus": "ACTIVE",
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1",
        "notes": "Main civic staging arena for displaced persons with 1,200 emergency bedding capacity."
    },
    {
        "id": "SYNTH-POWER-01",
        "name": "Koramangala 220kV Master Substation",
        "type": "POWER_SUBSTATION",
        "latitude": 12.9388,
        "longitude": 77.6180,
        "capacity": 220,
        "currentUtilizationPct": 88,
        "generatorElevationM": 0.8,
        "accessNodeId": "NODE-KORAMANGALA-SONY",
        "backupPowerStatus": "ACTIVE",
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1",
        "notes": "Feeds electrical power to St. John's Hospital and Sony Signal pumping relays."
    },
    {
        "id": "SYNTH-HQ-01",
        "name": "Bengaluru Disaster Management Operations Center",
        "type": "EMERGENCY_OPS",
        "latitude": 12.9774,
        "longitude": 77.5850,
        "capacity": 150,
        "currentUtilizationPct": 95,
        "generatorElevationM": 4.5,
        "accessNodeId": "NODE-CENTRAL-MAJESTIC",
        "backupPowerStatus": "ACTIVE",
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1",
        "notes": "Central emergency dispatch and unified command headquarters. Primary network root."
    },
]

INITIAL_ROAD_SEGMENTS = [
    {
        "id": "SYNTH-ROAD-01",
        "name": "Outer Ring Road (Bellandur - Marathahalli)",
        "fromNodeId": "NODE-BELLANDUR-ECOSPACE",
        "toNodeId": "NODE-MARATHAHALLI-BRIDGE",
        "coordinates": [[12.9260, 77.6762], [12.9380, 77.6890], [12.9569, 77.7011]],
        "lengthMeters": 4200,
        "elevationMeters": 882,
        "culvertCapacityMmPerHr": 35,
        "vulnerabilityIndex": 0.88,
        "isDisrupted": False,
        "disruptionReason": None,
        "speedLimitKmh": 50,
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1"
    },
    {
        "id": "SYNTH-ROAD-02",
        "name": "Koramangala 100ft Intermediate Arterial",
        "fromNodeId": "NODE-KORAMANGALA-SONY",
        "toNodeId": "NODE-SILKBOARD-JUNCTION",
        "coordinates": [[12.9352, 77.6245], [12.9250, 77.6240], [12.9176, 77.6238]],
        "lengthMeters": 2100,
        "elevationMeters": 888,
        "culvertCapacityMmPerHr": 40,
        "vulnerabilityIndex": 0.82,
        "isDisrupted": False,
        "disruptionReason": None,
        "speedLimitKmh": 40,
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1"
    },
    {
        "id": "SYNTH-ROAD-03",
        "name": "MG Road - Indiranagar Metro Corridor",
        "fromNodeId": "NODE-MG-ROAD-JUNCTION",
        "toNodeId": "NODE-INDIRANAGAR-100FT",
        "coordinates": [[12.9754, 77.6080], [12.9760, 77.6250], [12.9784, 77.6408]],
        "lengthMeters": 3600,
        "elevationMeters": 918,
        "culvertCapacityMmPerHr": 65,
        "vulnerabilityIndex": 0.28,
        "isDisrupted": False,
        "disruptionReason": None,
        "speedLimitKmh": 50,
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1"
    },
    {
        "id": "SYNTH-ROAD-04",
        "name": "Majestic - MG Road Central Link",
        "fromNodeId": "NODE-CENTRAL-MAJESTIC",
        "toNodeId": "NODE-MG-ROAD-JUNCTION",
        "coordinates": [[12.9774, 77.5708], [12.9765, 77.5900], [12.9754, 77.6080]],
        "lengthMeters": 4100,
        "elevationMeters": 922,
        "culvertCapacityMmPerHr": 70,
        "vulnerabilityIndex": 0.25,
        "isDisrupted": False,
        "disruptionReason": None,
        "speedLimitKmh": 50,
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1"
    },
    {
        "id": "SYNTH-ROAD-05",
        "name": "Silk Board Junction Undercrossing",
        "fromNodeId": "NODE-SILKBOARD-JUNCTION",
        "toNodeId": "NODE-ELECTRONIC-CITY-TOLL",
        "coordinates": [[12.9176, 77.6238], [12.8800, 77.6400], [12.8452, 77.6602]],
        "lengthMeters": 8500,
        "elevationMeters": 878,
        "culvertCapacityMmPerHr": 30,
        "vulnerabilityIndex": 0.94,
        "isDisrupted": True,
        "disruptionReason": "Synthetic declared disruption: Water logging chokepoint at Silk Board Underpass.",
        "speedLimitKmh": 60,
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1"
    },
    {
        "id": "SYNTH-ROAD-06",
        "name": "Hebbal Elevated Expressway North",
        "fromNodeId": "NODE-HEBBAL-FLYOVER",
        "toNodeId": "NODE-MG-ROAD-JUNCTION",
        "coordinates": [[13.0358, 77.5970], [13.0000, 77.6000], [12.9754, 77.6080]],
        "lengthMeters": 7200,
        "elevationMeters": 915,
        "culvertCapacityMmPerHr": 60,
        "vulnerabilityIndex": 0.38,
        "isDisrupted": False,
        "disruptionReason": None,
        "speedLimitKmh": 60,
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1"
    },
    {
        "id": "SYNTH-ROAD-07",
        "name": "Marathahalli - Whitefield Hope Farm Connector",
        "fromNodeId": "NODE-MARATHAHALLI-BRIDGE",
        "toNodeId": "NODE-WHITEFIELD-HOPE-FARM",
        "coordinates": [[12.9569, 77.7011], [12.9700, 77.7250], [12.9840, 77.7520]],
        "lengthMeters": 6300,
        "elevationMeters": 885,
        "culvertCapacityMmPerHr": 45,
        "vulnerabilityIndex": 0.52,
        "isDisrupted": False,
        "disruptionReason": None,
        "speedLimitKmh": 50,
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1"
    },
]

class DatasetService:
    def __init__(self):
        self.stations = list(INITIAL_RAINFALL_STATIONS)
        self.facilities = list(INITIAL_FACILITIES)
        self.roads = list(INITIAL_ROAD_SEGMENTS)
        self.uploaded_datasets: List[Dict[str, Any]] = [
            {
                "id": "DS-BENGALURU-TELEMETRY-V1",
                "name": "Bengaluru Telemetric Rain Gauges",
                "fileType": "JSON",
                "recordCount": len(self.stations),
                "sourceProvenance": "Synthetic Telemetric Fixture",
                "classification": "SYNTHETIC_FIXTURE",
                "validationStatus": "SYNTHETIC_VERIFIED",
                "createdAt": "2026-10-17T21:00:00Z"
            },
            {
                "id": "DS-INFRA-CRITICAL-V1",
                "name": "Critical Care Facilities & Emergency Hubs",
                "fileType": "JSON",
                "recordCount": len(self.facilities),
                "sourceProvenance": "Synthetic Facility Registry",
                "classification": "SYNTHETIC_FIXTURE",
                "validationStatus": "SYNTHETIC_VERIFIED",
                "createdAt": "2026-10-17T21:00:00Z"
            },
            {
                "id": "DS-ROAD-NETWORK-V1",
                "name": "Bengaluru Primary Corridor Segments",
                "fileType": "GeoJSON",
                "recordCount": len(self.roads),
                "sourceProvenance": "Synthetic Network Fixture",
                "classification": "SYNTHETIC_FIXTURE",
                "validationStatus": "SYNTHETIC_VERIFIED",
                "createdAt": "2026-10-17T21:00:00Z"
            }
        ]

    def get_stations(self) -> List[Dict[str, Any]]:
        return self.stations

    def get_facilities(self) -> List[Dict[str, Any]]:
        return self.facilities

    def get_roads(self) -> List[Dict[str, Any]]:
        return self.roads

    def get_datasets_list(self) -> List[Dict[str, Any]]:
        return self.uploaded_datasets

    def validate_file(self, filename: str, content: bytes, file_type: str) -> Dict[str, Any]:
        """
        Validates uploaded CSV, JSON, or GeoJSON dataset files.
        Checks structure, coordinates, column types, and bounding box.
        """
        issues = []
        record_count = 0
        preview_rows = []

        try:
            if file_type.lower() == 'csv' or filename.endswith('.csv'):
                text = content.decode('utf-8', errors='replace')
                reader = csv.DictReader(io.StringIO(text))
                headers = reader.fieldnames or []
                
                required_cols = {"latitude", "longitude"}
                missing = [c for c in required_cols if not any(h.lower() == c for h in headers)]
                if missing:
                    issues.append(f"Missing recommended spatial coordinates: {', '.join(missing)}")

                rows = list(reader)
                record_count = len(rows)
                preview_rows = rows[:5]

            elif file_type.lower() in ('json', 'geojson') or filename.endswith(('.json', '.geojson')):
                data = json.loads(content.decode('utf-8', errors='replace'))
                if isinstance(data, list):
                    record_count = len(data)
                    preview_rows = data[:5]
                elif isinstance(data, dict):
                    if "features" in data:
                        record_count = len(data["features"])
                        preview_rows = data["features"][:5]
                    else:
                        record_count = 1
                        preview_rows = [data]
            else:
                return {
                    "valid": False,
                    "record_count": 0,
                    "errors": ["Unsupported file format. Please upload CSV, JSON, or GeoJSON."],
                    "preview": [],
                }

            is_valid = len(issues) == 0
            dataset_record = {
                "id": f"DS-UPLOAD-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}",
                "name": filename,
                "fileType": file_type.upper(),
                "recordCount": record_count,
                "sourceProvenance": "User Uploaded Observation",
                "classification": "IMPORTED_OBSERVATION",
                "validationStatus": "VERIFIED_IMPORTED" if is_valid else "VALIDATION_WARNING",
                "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            }
            self.uploaded_datasets.append(dataset_record)

            return {
                "valid": is_valid,
                "dataset_id": dataset_record["id"],
                "record_count": record_count,
                "errors": issues,
                "preview": preview_rows,
                "metadata": dataset_record,
            }
        except Exception as e:
            return {
                "valid": False,
                "record_count": 0,
                "errors": [f"Failed to parse file: {str(e)}"],
                "preview": [],
            }

dataset_service = DatasetService()
