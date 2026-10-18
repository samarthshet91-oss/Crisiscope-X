"""
CRISISCOPE X — Backend Services Unit Tests
"""

import unittest
from backend.services.scenario_service import scenario_service
from backend.services.graph_service import graph_service
from backend.services.risk_service import risk_service
from backend.services.dataset_service import dataset_service
from backend.services.response_service import response_service

class BackendServicesTest(unittest.TestCase):
    def test_scenario_calculation(self):
        scenario = scenario_service.get_active_scenario()
        result = scenario_service.calculate_scenario(scenario)
        self.assertIn("scenarioSeverityIndex", result)
        self.assertIn("syntheticRunoffVolumeM3", result)
        self.assertIn("isolatedFacilities", result)

    def test_graph_severance_traversal(self):
        # Sever Silk Board underpass
        result = graph_service.analyze_cascade(["SYNTH-ROAD-05"])
        self.assertGreater(result["severedEdgesCount"], 0)
        self.assertIn("reachabilitySummary", result)

    def test_ml_risk_service(self):
        pred = risk_service.predict_inundation_risk({
            "rainfallIntensityMmHr": 100.0,
            "cumulativeRainfallMm": 220.0,
            "elevationMeters": 870.0,
            "soilSaturationPct": 92.0,
            "drainageMaintenanceScore": 2.0
        })
        self.assertGreater(pred["inundationProbability"], 0.5)
        self.assertEqual(pred["predictedAlert"], True)

    def test_response_service(self):
        scenario = scenario_service.get_active_scenario()
        res = scenario_service.calculate_scenario(scenario)
        facilities = dataset_service.get_facilities()
        options = response_service.generate_response_options(scenario, res, facilities)
        self.assertGreater(len(options), 0)
        self.assertTrue(any(o["priority"] in ("IMMEDIATE", "HIGH", "MEDIUM") for o in options))

if __name__ == "__main__":
    unittest.main()
