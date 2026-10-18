"""
CRISISCOPE X — Automated Test Suite
Tests Flask routes, scenario calculations, ML inference, and dataset validation.
"""

import unittest
import json
from app import create_app

class CrisiscopeTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()

    def test_health_endpoint(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("Flask 3", data["framework"])
        self.assertTrue(len(data["arch"]) > 0)

    def test_database_status_endpoint(self):
        res = self.client.get("/api/database/status")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("connected", data)
        self.assertEqual(data["database"], "crisiscope_db")

    def test_active_scenario_endpoint(self):
        res = self.client.get("/api/scenarios/active")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("scenario", data)
        self.assertIn("results", data)
        self.assertGreaterEqual(data["results"]["scenarioSeverityIndex"], 5)
        self.assertLessEqual(data["results"]["scenarioSeverityIndex"], 100)

    def test_scenario_calculation(self):
        payload = {
            "rainfallIntensityMmPerHour": 120.0,
            "rainfallDurationHours": 6,
            "rainfallProfile": "Convective Peak",
            "declaredDisruptions": ["SYNTH-ROAD-01", "SYNTH-ROAD-05"],
            "mitigationPumpsDeployed": True,
            "drainageClearanceActive": True,
            "trafficPreemptiveRerouting": True
        }
        res = self.client.post("/api/scenarios/run", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "computed")
        self.assertGreater(data["results"]["accumulatedRainfallMm"], 0)

    def test_cascade_graph_endpoint(self):
        res = self.client.get("/api/graph/cascade")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("nodes", data)
        self.assertIn("edges", data)
        self.assertGreater(len(data["nodes"]), 0)
        self.assertGreater(len(data["edges"]), 0)

    def test_ml_prediction_endpoint(self):
        payload = {
            "rainfallIntensityMmHr": 80.0,
            "cumulativeRainfallMm": 180.0,
            "elevationMeters": 880.0,
            "soilSaturationPct": 85.0,
            "drainageMaintenanceScore": 3.0
        }
        res = self.client.post("/api/ml/predict", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("inundationProbability", data)
        self.assertIn("riskCategory", data)
        self.assertIn("featureContributions", data)

    def test_alerts_endpoint(self):
        res = self.client.get("/api/alerts")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("alerts", data)
        self.assertGreater(len(data["alerts"]), 0)

    def test_page_routes_render(self):
        pages = [
            "/",
            "/command-center",
            "/digital-twin",
            "/cascade-vision",
            "/alerts",
            "/risk-analytics",
            "/impact-assessment",
            "/response-lab",
            "/data-explorer",
            "/evidence-trust",
            "/settings"
        ]
        for page in pages:
            res = self.client.get(page)
            self.assertEqual(res.status_code, 200, f"Page {page} failed to render")
            self.assertIn(b"CRISISCOPE", res.data)

if __name__ == "__main__":
    unittest.main()
