
import unittest
import pandas as pd

from backend.simulation import simulate_disaster, compare_scenarios


class TestSimulation(unittest.TestCase):

    def test_creates_hypothetical_scenario(self):
        result = simulate_disaster(
            event_type="Flood",
            location="Karnataka",
            severity="High",
            people_affected=1200,
        )

        self.assertEqual(result["event_type"], "Flood")
        self.assertEqual(result["location"], "Karnataka")
        self.assertEqual(result["risk_points"], 12.24)
        self.assertEqual(result["risk_category"], "High")
        self.assertEqual(result["mode"], "Simulation")
        self.assertTrue(result["is_simulated"])

    def test_rejects_empty_event_type(self):
        with self.assertRaisesRegex(ValueError, "cannot be empty"):
            simulate_disaster("", "Karnataka", "High", 100)

    def test_rejects_empty_location(self):
        with self.assertRaisesRegex(ValueError, "cannot be empty"):
            simulate_disaster("Flood", "  ", "High", 100)

    def test_rejects_invalid_severity(self):
        with self.assertRaisesRegex(ValueError, "Severity must be"):
            simulate_disaster("Flood", "Karnataka", "Extreme", 100)

    def test_rejects_negative_population(self):
        with self.assertRaisesRegex(ValueError, "non-negative whole number"):
            simulate_disaster("Flood", "Karnataka", "High", -1)

    def test_rejects_decimal_population(self):
        with self.assertRaisesRegex(ValueError, "non-negative whole number"):
            simulate_disaster("Flood", "Karnataka", "High", 10.5)

    def test_compares_multiple_scenarios(self):
        first = simulate_disaster("Flood", "Karnataka", "High", 1200)
        second = simulate_disaster("Cyclone", "Odisha", "Critical", 8500)

        result = compare_scenarios([first, second])

        self.assertIsInstance(result, pd.DataFrame)
        self.assertEqual(len(result), 2)
        self.assertEqual(
            result["event_type"].tolist(),
            ["Flood", "Cyclone"],
        )

    def test_handles_empty_scenario_list(self):
        result = compare_scenarios([])

        self.assertIsInstance(result, pd.DataFrame)
        self.assertEqual(len(result), 0)
        self.assertIn("risk_points", result.columns)


if __name__ == "__main__":
    unittest.main()
