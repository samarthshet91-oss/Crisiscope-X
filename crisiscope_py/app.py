import streamlit as st
import pandas as pd
from datetime import datetime

from backend.analysis import get_disaster_summary
from backend.data_loader import load_disaster_alerts
from backend.live_weather import fetch_live_weather
from backend.main import get_system_status
from backend.operating_modes import OperatingMode, get_mode_description
from backend.risk_analysis import calculate_risk_indicators, assign_risk_category
from backend.simulation import simulate_disaster, compare_scenarios

st.set_page_config(
    page_title="CrisiscopeX | Disaster Intelligence",
    page_icon="🌍",
    layout="wide",
)

st.markdown("""
<style>
.stApp { background-color: #f5f7fb; }
[data-testid="stSidebar"] { background-color: #eaf0f8; }
div[data-testid="stMetric"] {
    background: white;
    padding: 14px;
    border: 1px solid #e0e7f0;
    border-radius: 12px;
}
</style>
""", unsafe_allow_html=True)

with st.sidebar:
    st.title("🌍 CrisiscopeX")
    st.caption("Disaster Intelligence & Decision Support")
    selected_mode_label = st.radio(
        "Operating Mode",
        [
            OperatingMode.HISTORICAL.value,
            OperatingMode.LIVE.value,
            OperatingMode.SIMULATION.value,
        ],
    )
    mode_lookup = {mode.value: mode for mode in OperatingMode}
    selected_mode = mode_lookup[selected_mode_label]
    st.info(get_mode_description(selected_mode))

st.title("🌍 CrisiscopeX")
st.caption("Disaster Intelligence, Risk Analysis and Scenario Planning")
st.caption(f"Dashboard refreshed: {datetime.now().strftime('%d %b %Y, %H:%M:%S')}")

# LIVE MONITORING MODE
if selected_mode == OperatingMode.LIVE:
    st.header("🌦️ Live Weather Monitoring")
    st.write(
        "Fetch current weather observations from the connected weather "
        "provider. Weather observations alone cannot confirm a disaster."
    )
    if st.button("🔄 Fetch Latest Weather", type="primary"):
        try:
            weather_data = fetch_live_weather()
            if not isinstance(weather_data, dict):
                raise ValueError("Unexpected response from weather provider.")
            st.session_state["live_weather_data"] = weather_data
            st.session_state.pop("live_weather_error", None)
        except Exception as exc:
            st.session_state["live_weather_error"] = str(exc)

    weather_data = st.session_state.get("live_weather_data")
    weather_error = st.session_state.get("live_weather_error")

    if weather_error:
        st.warning(
            "Live weather is temporarily unavailable. "
            "You can switch to Historical or Simulation mode."
        )
        st.caption(f"Connection details: {weather_error}")
    elif weather_data is None:
        st.info("Click Fetch Latest Weather to retrieve current observations.")
    else:
        st.subheader("📍 Observation Details")
        st.write("**Source:**", weather_data.get("source", "Not specified"))
        st.write("**Location:**", weather_data.get("location", "Not specified"))
        st.write("**Observation time:**", weather_data.get("observation_time", "Not provided"))
        st.write("**Fetched at (UTC):**", weather_data.get("fetched_at_utc", "Not provided"))

        observations = weather_data.get("observations", {})
        if isinstance(observations, dict) and observations:
            cols = st.columns(min(3, len(observations)))
            for index, (name, value) in enumerate(observations.items()):
                with cols[index % len(cols)]:
                    label = str(name).replace("_", " ").title()
                    st.metric(label, str(value) if value is not None else "Unavailable")
        else:
            st.info("No measurements were returned.")
            st.json(weather_data)

        if weather_data.get("flood_confirmed") is False:
            st.warning(
                "The weather response does not confirm a flood. "
                "Use authoritative sources for verified disaster alerts."
            )

# HISTORICAL MODE
elif selected_mode == OperatingMode.HISTORICAL:
    st.markdown("---")
    st.header("📚 Historical Disaster Records")
    st.caption(
        "This mode currently uses a fictional development dataset. "
        "It is not a verified historical or live disaster feed."
    )

    try:
        system_status = get_system_status()
        df = load_disaster_alerts()
        summary = get_disaster_summary(df)
        df = calculate_risk_indicators(df)
        df = assign_risk_category(df)

        st.success(
            f"{system_status['app_name']} backend "
            f"v{system_status['version']} loaded successfully."
        )

        st.markdown("### 📌 Sample Situation Overview")
        col1, col2, col3 = st.columns(3)
        col1.metric("Active Sample Alerts", summary["active_alerts"])
        col2.metric("Regions in Sample", summary["regions_monitored"])
        col3.metric(
            "People Affected in Sample",
            f"{summary['people_affected']:,}",
        )

        st.markdown("---")
        severity_order = ["Low", "Medium", "High", "Critical"]

        st.subheader("📊 Sample Alert Severity")
        severity_counts = (
            df["severity"].value_counts().reindex(severity_order, fill_value=0)
        )
        st.bar_chart(severity_counts)

        st.subheader("📈 Illustrative Risk Category Distribution")
        st.caption(
            "Categories use provisional demo thresholds, "
            "not official emergency classifications."
        )
        risk_counts = (
            df["risk_category"]
            .value_counts()
            .reindex(severity_order, fill_value=0)
        )
        st.bar_chart(risk_counts)

        st.markdown("---")
        st.sidebar.header("🔎 Filter Sample Alerts")
        severity_options = sorted(df["severity"].unique().tolist())
        event_options = sorted(df["event_type"].unique().tolist())
        region_options = sorted(df["location"].unique().tolist())

        selected_severities = st.sidebar.multiselect(
            "Filter by Severity",
            options=severity_options,
            default=severity_options,
        )
        selected_events = st.sidebar.multiselect(
            "Filter by Disaster Type",
            options=event_options,
            default=event_options,
        )
        selected_regions = st.sidebar.multiselect(
            "Filter by Region",
            options=region_options,
            default=region_options,
        )

        filtered_df = df[
            df["severity"].isin(selected_severities)
            & df["event_type"].isin(selected_events)
            & df["location"].isin(selected_regions)
        ].copy()
        st.caption(f"Showing {len(filtered_df)} of {len(df)} sample alerts")

        st.subheader("🚨 Highest-Ranked Sample Alerts")
        st.caption("Ranked using illustrative rule-based risk points.")
        display_columns = [
            "alert_id", "event_type", "location", "severity",
            "people_affected", "risk_points", "risk_category", "status",
        ]
        ranked_alerts = filtered_df.sort_values(
            by="risk_points",
            ascending=False,
        )
        if not ranked_alerts.empty:
            st.dataframe(
                ranked_alerts.head(3)[display_columns],
                use_container_width=True,
                hide_index=True,
            )
        else:
            st.info("No alerts match your filters.")

        st.markdown("---")
        st.subheader("?? Explore All Sample Alerts")
        if not filtered_df.empty:
            st.dataframe(
                filtered_df.sort_values(by="risk_points", ascending=False),
                use_container_width=True,
                hide_index=True,
            )
        else:
            st.info("No sample alerts to display.")

        st.caption(
            "Sample alerts are fictional development records, not verified "
            "reports. Risk points and categories are illustrative, not "
            "calibrated probabilities or official emergency risk scores."
        )

    except (FileNotFoundError, ValueError, OSError) as exc:
        st.error(f"Unable to load historical sample data: {exc}")




