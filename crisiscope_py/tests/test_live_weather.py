
import unittest
from unittest.mock import patch, MagicMock

from backend.live_weather import fetch_live_weather


class TestLiveWeather(unittest.TestCase):

    def test_rejects_invalid_latitude(self):
        with self.assertRaisesRegex(ValueError, "Latitude"):
            fetch_live_weather(latitude=91)

    def test_rejects_invalid_longitude(self):
        with self.assertRaisesRegex(ValueError, "Longitude"):
            fetch_live_weather(longitude=181)

    def test_handles_missing_current_observations(self):
        response = MagicMock()
        response.status = 200
        response.read.return_value = b'{"timezone": "Asia/Kolkata"}'

        with patch(
            "backend.live_weather.urlopen",
            return_value=response,
        ):
            with response:
                pass

            # Mock the context manager used by urlopen.
            response.__enter__.return_value = response

            with self.assertRaisesRegex(
                RuntimeError, "current observations"
            ):
                fetch_live_weather()

    def test_returns_weather_metadata(self):
        payload = {
            "timezone": "Asia/Kolkata",
            "current_units": {
                "temperature_2m": "°C",
                "relative_humidity_2m": "%",
            },
            "current": {
                "time": "2026-10-17T10:00",
                "temperature_2m": 28.0,
                "relative_humidity_2m": 65,
                "precipitation": 0.0,
                "rain": 0.0,
                "weather_code": 1,
                "wind_speed_10m": 12.0,
                "wind_gusts_10m": 18.0,
            },
        }

        response = MagicMock()
        response.status = 200
        response.read.return_value = __import__("json").dumps(
            payload
        ).encode("utf-8")

        manager = MagicMock()
        manager.__enter__.return_value = response
        manager.__exit__.return_value = False

        with patch(
            "backend.live_weather.urlopen",
            return_value=manager,
        ):
            result = fetch_live_weather()

        self.assertEqual(result["source"], "Open-Meteo")
        self.assertEqual(result["mode"], "Live")
        self.assertEqual(result["observations"]["temperature_2m"], 28.0)
        self.assertFalse(result["flood_confirmed"])


if __name__ == "__main__":
    unittest.main()
