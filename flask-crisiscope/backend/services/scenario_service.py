"""
CRISISCOPE X — Scenario Service
Calculates scenario severity index (SSI), hydrology approximations, and risk composites.
"""

from typing import List, Dict, Any, Optional
import datetime
from .graph_service import graph_service
from .dataset_service import INITIAL_ROAD_SEGMENTS, INITIAL_FACILITIES

PRESET_SCENARIOS = [
    {
        "id": "SCEN-URBAN-FLOOD-HYPOTHESIS",
        "name": "Urban Flooding Hypothesis",
        "description": "Severe convective rainfall concentrated over Bellandur and Koramangala basins.",
        "rainfallIntensityMmPerHour": 85.0,
        "rainfallDurationHours": 5,
        "rainfallProfile": "Convective Peak",
        "catchmentZone": "Bellandur Basin",
        "startTime": "2026-10-17T21:00:00Z",
        "declaredDisruptions": ["SYNTH-ROAD-05"],
        "facilityCapacityReductions": {"SYNTH-HOSP-03": 25},
        "mitigationPumpsDeployed": False,
        "drainageClearanceActive": False,
        "trafficPreemptiveRerouting": False,
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1",
        "createdAt": "2026-10-17T21:00:00Z",
    },
    {
        "id": "SCEN-FLASH-SURGE-HEBBAL",
        "name": "Flash Inundation Surge",
        "description": "Intense cloudburst over Hebbal Valley arterial corridors with rapid runoff.",
        "rainfallIntensityMmPerHour": 110.0,
        "rainfallDurationHours": 3,
        "rainfallProfile": "Front-loaded Burst",
        "catchmentZone": "Hebbal Valley",
        "startTime": "2026-10-17T21:00:00Z",
        "declaredDisruptions": ["SYNTH-ROAD-01", "SYNTH-ROAD-06"],
        "facilityCapacityReductions": {},
        "mitigationPumpsDeployed": False,
        "drainageClearanceActive": False,
        "trafficPreemptiveRerouting": True,
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1",
        "createdAt": "2026-10-17T21:00:00Z",
    },
    {
        "id": "SCEN-MONSOON-BASELINE",
        "name": "Monsoon Surcharge Baseline",
        "description": "Continuous steady precipitation across Vrishabhavathi basin.",
        "rainfallIntensityMmPerHour": 45.0,
        "rainfallDurationHours": 12,
        "rainfallProfile": "Uniform Steady",
        "catchmentZone": "Vrishabhavathi Basin",
        "startTime": "2026-10-17T21:00:00Z",
        "declaredDisruptions": [],
        "facilityCapacityReductions": {},
        "mitigationPumpsDeployed": False,
        "drainageClearanceActive": True,
        "trafficPreemptiveRerouting": False,
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1",
        "createdAt": "2026-10-17T21:00:00Z",
    },
    {
        "id": "SCEN-MITIGATED-RESILIENCE",
        "name": "Mitigated Resilience Model",
        "description": "High-intensity storm with active municipal pumps, desilted canals, and automated rerouting.",
        "rainfallIntensityMmPerHour": 85.0,
        "rainfallDurationHours": 5,
        "rainfallProfile": "Convective Peak",
        "catchmentZone": "Bellandur Basin",
        "startTime": "2026-10-17T21:00:00Z",
        "declaredDisruptions": ["SYNTH-ROAD-05"],
        "facilityCapacityReductions": {},
        "mitigationPumpsDeployed": True,
        "drainageClearanceActive": True,
        "trafficPreemptiveRerouting": True,
        "provenance": "SYNTHETIC_DEMO_FIXTURE_V1",
        "createdAt": "2026-10-17T21:00:00Z",
    },
]

class ScenarioService:
    def __init__(self):
        self.scenarios = {s["id"]: dict(s) for s in PRESET_SCENARIOS}
        self.active_scenario_id = "SCEN-URBAN-FLOOD-HYPOTHESIS"

    def get_active_scenario(self) -> Dict[str, Any]:
        return self.scenarios.get(self.active_scenario_id, PRESET_SCENARIOS[0])

    def list_presets(self) -> List[Dict[str, Any]]:
        return list(self.scenarios.values())

    def set_active_scenario(self, scenario_id: str) -> Optional[Dict[str, Any]]:
        if scenario_id in self.scenarios:
            self.active_scenario_id = scenario_id
            return self.scenarios[scenario_id]
        return None

    def calculate_scenario(self, scenario: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates scenario severity index (SSI) and runs topological cascade analysis.
        """
        intensity = float(scenario.get("rainfallIntensityMmPerHour", 85.0))
        duration = int(scenario.get("rainfallDurationHours", 5))
        profile = scenario.get("rainfallProfile", "Convective Peak")
        disruptions = scenario.get("declaredDisruptions", [])
        pumps = bool(scenario.get("mitigationPumpsDeployed", False))
        drainage = bool(scenario.get("drainageClearanceActive", False))
        rerouting = bool(scenario.get("trafficPreemptiveRerouting", False))

        profile_multipliers = {
            "Convective Peak": 1.25,
            "Uniform Steady": 1.0,
            "Front-loaded Burst": 1.35,
            "Back-loaded Surge": 1.20,
        }
        multiplier = profile_multipliers.get(profile, 1.1)

        accumulated_rain = round(intensity * duration * multiplier, 1)
        soil_saturation = min(100.0, round(38.0 + (accumulated_rain / 2.8) * 0.88, 1))

        # Cascade Graph Analysis
        graph_results = graph_service.analyze_cascade(disruptions)

        # Composite Scenario Severity Index (SSI, 0 to 100)
        norm_rain = min(100.0, (accumulated_rain / 320.0) * 100.0)
        norm_disruptions = min(100.0, (len(disruptions) / 4.0) * 100.0)
        norm_isolated = min(100.0, (len(graph_results["isolatedFacilities"]) / 3.0) * 100.0)

        mitigation_credit = (14 if pumps else 0) + (10 if drainage else 0) + (8 if rerouting else 0)
        
        raw_ssi = (0.35 * norm_rain) + (0.30 * norm_disruptions) + (0.25 * norm_isolated) + (0.10 * (soil_saturation / 100.0) * 100)
        ssi = max(5, min(100, int(raw_ssi - mitigation_credit * 0.5)))

        catchment_area_m2 = 38 * 1000 * 1000
        runoff_m3 = int(catchment_area_m2 * (soil_saturation / 100.0) * 0.72 * (accumulated_rain / 1000.0))

        return {
            "accumulatedRainfallMm": accumulated_rain,
            "scenarioSeverityIndex": ssi,
            "effectiveSoilSaturationPct": soil_saturation,
            "syntheticRunoffVolumeM3": runoff_m3,
            "declaredDisruptionsCount": len(disruptions),
            "exposedFacilitiesCount": len(INITIAL_FACILITIES),
            "isolatedFacilities": graph_results["isolatedFacilities"],
            "severedEdgesCount": graph_results["severedEdgesCount"],
            "cascadeRiskScore": min(100, graph_results["severedEdgesCount"] * 18 + len(graph_results["isolatedFacilities"]) * 22),
            "reachabilitySummary": graph_results["reachabilitySummary"],
            "mitigationImpact": {
                "pumpsActive": pumps,
                "drainageClearanceActive": drainage,
                "reroutingActive": rerouting,
                "reductionPoints": int(mitigation_credit * 0.5),
            },
            "provenance": "SYNTHETIC_SIMULATION_CALCULATION",
        }

    def update_scenario(self, scenario_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        target = self.scenarios.get(scenario_id, dict(PRESET_SCENARIOS[0]))
        target.update(updates)
        self.scenarios[scenario_id] = target
        return target

scenario_service = ScenarioService()
