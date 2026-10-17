
import unittest
from unittest.mock import patch

import pandas as pd

from backend.data_loader import load_disaster_alerts


class TestDataLoader(unittest.TestCase):

    def make_dataframe(self):
        return pd.DataFrame({
            "alert_id": ["D999"],
            "event_type": ["Flood"],
            "location": ["Karnataka"],
            "severity": ["High"],
            "people_affected": [1200],
            "status": ["Active"],
        })

    def test_rejects_duplicate_alert_ids(self):
        df = self.make_dataframe()
        df = pd.concat([df, df], ignore_index=True)

        with patch("backend.data_loader.pd.read_csv", return_value=df):
            with self.assertRaisesRegex(ValueError, "Duplicate alert IDs"):
                load_disaster_alerts()

    def test_rejects_negative_people_affected(self):
        df = self.make_dataframe()
        df.loc[0, "people_affected"] = -1

        with patch("backend.data_loader.pd.read_csv", return_value=df):
            with self.assertRaisesRegex(ValueError, "non-negative whole numbers"):
                load_disaster_alerts()

    
    def test_rejects_nonnumeric_people_affected(self):
        df = self.make_dataframe()
        df["people_affected"] = ["unknown"]

        with patch("backend.data_loader.pd.read_csv", return_value=df):
            with self.assertRaises((ValueError, TypeError)):
                load_disaster_alerts()


    def test_rejects_invalid_severity(self):
        df = self.make_dataframe()
        df.loc[0, "severity"] = "Extreme"

        with patch("backend.data_loader.pd.read_csv", return_value=df):
            with self.assertRaisesRegex(ValueError, "Invalid severity"):
                load_disaster_alerts()

    def test_rejects_invalid_status(self):
        df = self.make_dataframe()
        df.loc[0, "status"] = "Unknown"

        with patch("backend.data_loader.pd.read_csv", return_value=df):
            with self.assertRaisesRegex(ValueError, "Invalid status"):
                load_disaster_alerts()

    def test_rejects_blank_location(self):
        df = self.make_dataframe()
        df.loc[0, "location"] = "   "

        with patch("backend.data_loader.pd.read_csv", return_value=df):
            with self.assertRaisesRegex(ValueError, "empty values"):
                load_disaster_alerts()


if __name__ == "__main__":
    unittest.main()
