"""
CRISISCOPE X — ML Unit Tests
"""

import unittest
from ml.inference.predict import predict
from ml.evaluation.evaluate import evaluate_model

class MLTests(unittest.TestCase):
    def test_prediction(self):
        result = predict({
            "rainfallIntensityMmHr": 85.0,
            "cumulativeRainfallMm": 170.0,
            "elevationMeters": 880.0,
            "soilSaturationPct": 80.0,
            "drainageMaintenanceScore": 3.0
        })
        self.assertIn("inundationProbability", result)
        self.assertIn("riskCategory", result)

    def test_evaluation_metrics(self):
        metrics = evaluate_model()
        self.assertGreaterEqual(metrics["accuracy"], 0.8)
        self.assertIn("confusionMatrix", metrics)

if __name__ == "__main__":
    unittest.main()
