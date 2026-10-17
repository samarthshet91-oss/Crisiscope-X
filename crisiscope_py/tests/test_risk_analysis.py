
import unittest

import pandas as pd

from backend.risk_analysis import (
    calculate_risk_indicators,
    assign_risk_category,
)


class TestRiskAnalysis(unittest.TestCase):

    def make_dataframe(self):
        return pd.DataFrame({
            "alert_id": ["D001", "D002", "D003", "D004"],
            "severity": ["Low", "Medium", "High", "Critical"],
            "people_affected": [0, 100, 1200, 8500],
        })

    def test_calculates_risk_points(self):
        df = self.make_dataframe()
        result = calculate_risk_indicators(df)

        self.assertEqual(
            result["risk_points"].tolist(),
            [1.0, 6.01, 12.24, 19.72],
        )

    def test_does_not_modify_original_dataframe(self):
        df = self.make_dataframe()
        original = df.copy(deep=True)

        calculate_risk_indicators(df)

        pd.testing.assert_frame_equal(df, original)

    def test_rejects_invalid_severity(self):
        df = self.make_dataframe()
        df.loc[0, "severity"] = "Extreme"

        with self.assertRaisesRegex(ValueError, "valid severity"):
            calculate_risk_indicators(df)

    def test_rejects_negative_population(self):
        df = self.make_dataframe()
        df.loc[0, "people_affected"] = -1

        with self.assertRaisesRegex(ValueError, "non-negative whole numbers"):
            calculate_risk_indicators(df)

    def test_assigns_categories(self):
        df = pd.DataFrame({
            "risk_points": [3.0, 5.0, 5.01, 10.0, 10.01, 15.0, 15.01]
        })

        result = assign_risk_category(df)

        self.assertEqual(
            result["risk_category"].astype(str).tolist(),
            ["Low", "Low", "Medium", "Medium", "High", "High", "Critical"],
        )


if __name__ == "__main__":
    unittest.main()
