
"""Standalone entry point for CrisiscopeX."""

from backend.config import APP_NAME, APP_VERSION
from backend.data_loader import load_disaster_alerts
from backend.analysis import get_disaster_summary
from backend.risk_analysis import (
    calculate_risk_indicators,
    assign_risk_category,
)
from backend.simulation import simulate_disaster


def get_system_status():
    """Return the current status of CrisiscopeX."""
    return {
        "app_name": APP_NAME,
        "version": APP_VERSION,
        "status": "operational",
    }


def run_backend():
    """Run a basic backend health check and analysis."""
    status = get_system_status()

    print(f"\n{status['app_name']} v{status['version']}")
    print(f"System status: {status['status']}")

    alerts = load_disaster_alerts()
    summary = get_disaster_summary(alerts)

    print("\n--- Sample Disaster Summary ---")
    print(f"Total sample alerts: {summary['total_alerts']}")
    print(f"Active sample alerts: {summary['active_alerts']}")
    print(f"Regions monitored: {summary['regions_monitored']}")
    print(f"People affected in sample: {summary['people_affected']}")

    print("\n--- Risk Analysis ---")
    risk_data = calculate_risk_indicators(alerts)
    risk_data = assign_risk_category(risk_data)

    print(
        risk_data[
            ["alert_id", "severity", "risk_points", "risk_category"]
        ].to_string(index=False)
    )

    print("\nNote: Dataset records and risk categories are illustrative.")

    print("\n--- Example Simulation ---")
    scenario = simulate_disaster(
        event_type="Flood",
        location="Karnataka",
        severity="High",
        people_affected=1200,
    )
    print(scenario)
    print("\nSimulation is hypothetical; it is not a real disaster alert.")


if __name__ == "__main__":
    run_backend()
