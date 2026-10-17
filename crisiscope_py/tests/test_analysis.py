
import unittest

import pandas as pd

from backend.analysis import get_disaster_summary
from backend.data_loader import load_disaster_alerts


class TestDisasterAnalysis(unittest.TestCase):

    def test_summary_matches_sample_dataset(self):
        """Summary metrics should match the loaded dataset."""
        df = load_disaster_alerts()
        summary = get_disaster_summary(df)

        self.assertEqual(summary["total_alerts"], len(df))

        self.assertEqual(
            summary["active_alerts"],
            int(df["status"].str.casefold().eq("active").sum()),
        )

        self.assertEqual(
            summary["regions_monitored"],
            int(df["location"].nunique()),
        )

        self.assertEqual(
            summary["people_affected"],
            int(df["people_affected"].sum()),
        )

    def test_severity_counts_match_dataset(self):
        """Severity counts should match the loaded dataset."""
        df = load_disaster_alerts()
        summary = get_disaster_summary(df)

        expected = {
            str(severity): int(count)
            for severity, count in df["severity"].value_counts().items()
        }

        self.assertEqual(summary["severity_counts"], expected)

    def test_rejects_missing_required_column(self):
        """Analysis should reject data missing a required column."""
        invalid_df = pd.DataFrame(
            {
                "alert_id": ["D999"],
                "event_type": ["Flood"],
                "location": ["Karnataka"],
                "severity": ["High"],
                "status": ["Active"],
            }
        )

        with self.assertRaisesRegex(
            ValueError, "Missing required columns"
        ):
            get_disaster_summary(invalid_df)


if __name__ == "__main__":
    unittest.main()
