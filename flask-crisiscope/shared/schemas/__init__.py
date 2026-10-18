"""
CRISISCOPE X — Shared Data Schemas & Contracts
Portable across Python backend and data ingestion scripts.
"""

from typing import Dict, Any, List

SCENARIO_SCHEMA = {
    "type": "object",
    "properties": {
        "id": {"type": "string"},
        "name": {"type": "string"},
        "rainfallIntensityMmPerHour": {"type": "number", "minimum": 10, "maximum": 200},
        "rainfallDurationHours": {"type": "integer", "minimum": 1, "maximum": 48},
        "rainfallProfile": {"type": "string"},
        "catchmentZone": {"type": "string"},
        "declaredDisruptions": {"type": "array", "items": {"type": "string"}},
        "mitigationPumpsDeployed": {"type": "boolean"},
        "drainageClearanceActive": {"type": "boolean"},
        "trafficPreemptiveRerouting": {"type": "boolean"}
    },
    "required": ["rainfallIntensityMmPerHour", "rainfallDurationHours"]
}
