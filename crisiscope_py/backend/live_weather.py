
"""Fetch current weather observations for CRISCOPE-X."""

from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
import json


API_URL = "https://api.open-meteo.com/v1/forecast"

DEFAULT_LOCATION = {
    "name": "Bengaluru",
    "latitude": 12.9716,
    "longitude": 77.5946,
}


def fetch_live_weather(
    latitude: float = DEFAULT_LOCATION["latitude"],
    longitude: float = DEFAULT_LOCATION["longitude"],
    location_name: str = DEFAULT_LOCATION["name"],
) -> dict:
    """Fetch current weather and return source and timestamp metadata."""

    if not -90 <= latitude <= 90:
        raise ValueError("Latitude must be between -90 and 90.")

    if not -180 <= longitude <= 180:
        raise ValueError("Longitude must be between -180 and 180.")

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "precipitation,"
            "rain,"
            "weather_code,"
            "wind_speed_10m,"
            "wind_gusts_10m"
        ),
        "timezone": "Asia/Kolkata",
    }

    url = f"{API_URL}?{urlencode(params)}"

    request = Request(
        url,
        headers={"User-Agent": "Crisiscope-X/1.0"},
    )

    try:
        with urlopen(request, timeout=15) as response:
            if response.status != 200:
                raise RuntimeError(
                    f"Weather API returned HTTP {response.status}."
                )

            payload = json.loads(response.read().decode("utf-8"))

    except HTTPError as exc:
        raise RuntimeError(
            f"Weather API request failed: HTTP {exc.code}."
        ) from exc

    except URLError as exc:
        raise RuntimeError(
            f"Could not reach the weather API: {exc.reason}"
        ) from exc

    current = payload.get("current")

    if not isinstance(current, dict) or not current.get("time"):
        raise RuntimeError(
            "Weather API response did not contain current observations."
        )

    required_values = [
        "temperature_2m",
        "relative_humidity_2m",
        "precipitation",
        "rain",
        "weather_code",
        "wind_speed_10m",
        "wind_gusts_10m",
    ]

    missing = [
        field for field in required_values
        if current.get(field) is None
    ]

    if missing:
        raise RuntimeError(
            f"Weather response is missing fields: {missing}"
        )

    return {
        "mode": "Live",
        "source": "Open-Meteo",
        "location": location_name,
        "latitude": latitude,
        "longitude": longitude,
        "observation_time": current["time"],
        "fetched_at_utc": datetime.now(
            timezone.utc
        ).isoformat(),
        "timezone": payload.get("timezone", "Asia/Kolkata"),
        "units": payload.get("current_units", {}),
        "observations": {
            field: current[field]
            for field in required_values
        },
        "data_type": "Weather observations",
        "flood_confirmed": False,
    }
