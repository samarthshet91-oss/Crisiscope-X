
"""Operating modes for CRISCOPE-X."""

from enum import Enum


class OperatingMode(str, Enum):
    HISTORICAL = "Historical"
    LIVE = "Live Monitoring"
    SIMULATION = "Simulation"


MODE_DESCRIPTIONS = {
    OperatingMode.HISTORICAL: (
        "Analyze saved disaster records and historical observations."
    ),
    OperatingMode.LIVE: (
        "Monitor current weather observations from connected data sources."
    ),
    OperatingMode.SIMULATION: (
        "Test hypothetical disaster scenarios using controlled inputs."
    ),
}


def get_mode_description(mode: OperatingMode) -> str:
    """Return the description for a selected operating mode."""
    if not isinstance(mode, OperatingMode):
        raise ValueError("Select a valid CRISCOPE-X operating mode.")

    return MODE_DESCRIPTIONS[mode]
