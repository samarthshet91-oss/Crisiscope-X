
import unittest

from backend.operating_modes import (
    OperatingMode,
    get_mode_description,
)


class TestOperatingModes(unittest.TestCase):

    def test_all_three_modes_exist(self):
        self.assertEqual(OperatingMode.HISTORICAL.value, "Historical")
        self.assertEqual(OperatingMode.LIVE.value, "Live Monitoring")
        self.assertEqual(OperatingMode.SIMULATION.value, "Simulation")

    def test_each_mode_has_a_description(self):
        for mode in OperatingMode:
            with self.subTest(mode=mode):
                description = get_mode_description(mode)
                self.assertIsInstance(description, str)
                self.assertTrue(description.strip())

    def test_invalid_mode_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "valid"):
            get_mode_description("Invalid Mode")


if __name__ == "__main__":
    unittest.main()
