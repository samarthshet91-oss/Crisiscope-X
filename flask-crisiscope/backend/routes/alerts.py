"""
CRISISCOPE X — Alerts & Response Recommendations Blueprint
"""

import datetime
from flask import Blueprint, jsonify
from backend.services.scenario_service import scenario_service
from backend.services.dataset_service import dataset_service
from backend.services.response_service import response_service

alerts_bp = Blueprint("alerts", __name__)

@alerts_bp.route("/api/alerts", methods=["GET"])
def get_alerts():
    scenario = scenario_service.get_active_scenario()
    results = scenario_service.calculate_scenario(scenario)
    roads = dataset_service.get_roads()
    facilities = dataset_service.get_facilities()
    
    alerts = []
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    intensity = float(scenario.get("rainfallIntensityMmPerHour", 85.0))
    duration = int(scenario.get("rainfallDurationHours", 5))
    disruptions = scenario.get("declaredDisruptions", [])
    isolated_facilities = results.get("isolatedFacilities", [])

    # 1. Extreme precipitation
    if intensity >= 75:
        alerts.append({
            "id": "ALERT-PRECIP-CRITICAL",
            "title": "Extreme Storm Surcharge & Cloudburst Alert",
            "description": f"Catchment area [{scenario.get('catchmentZone', 'Urban Core')}] is under peak precipitation load of {intensity} mm/hr for {duration} hours. Total accumulated hydraulic volume exceeds macro-drain capacity.",
            "severity": "CRITICAL",
            "category": "HYDROLOGICAL",
            "status": "ACTIVE",
            "affectedAssetIds": [scenario.get("catchmentZone", "Urban Core")],
            "affectedAssetNames": [scenario.get("catchmentZone", "Urban Core")],
            "timestamp": now,
            "source": "Catchment Hydro-Sensor Array (Synthetic)",
            "ruleOrigin": "RULE_HYDRO_INTENSITY_GE_75",
        })
    elif intensity >= 45:
        alerts.append({
            "id": "ALERT-PRECIP-WARNING",
            "title": "Elevated Precipitation & Surface Pooling Advisory",
            "description": f"Sustained rainfall at {intensity} mm/hr. Soil saturation estimated at {results.get('effectiveSoilSaturationPct')}%.",
            "severity": "WARNING",
            "category": "HYDROLOGICAL",
            "status": "ACTIVE",
            "affectedAssetIds": [scenario.get("catchmentZone", "Urban Core")],
            "affectedAssetNames": [scenario.get("catchmentZone", "Urban Core")],
            "timestamp": now,
            "source": "Catchment Hydro-Sensor Array (Synthetic)",
            "ruleOrigin": "RULE_HYDRO_INTENSITY_GE_45",
        })

    # 2. Road disruptions
    if disruptions:
        disrupted_roads = [r for r in roads if r["id"] in disruptions]
        road_names = [r["name"] for r in disrupted_roads]
        alerts.append({
            "id": "ALERT-CORRIDOR-SEVERANCE",
            "title": f"Declared Road Chokepoint: {len(disruptions)} Segments Disrupted",
            "description": f"Physical traffic movement is obstructed on {', '.join(road_names) if road_names else 'designated corridors'}. Emergency logistics impedance increased.",
            "severity": "CRITICAL" if len(disruptions) >= 2 else "WARNING",
            "category": "CORRIDOR",
            "status": "ACTIVE",
            "affectedAssetIds": disruptions,
            "affectedAssetNames": road_names,
            "timestamp": now,
            "source": "Scenario Disruption Controller",
            "ruleOrigin": "RULE_CORRIDOR_DECLARED_DISRUPTION",
        })

    # 3. Isolated facilities
    if isolated_facilities:
        isolated_hospitals = [f for f in isolated_facilities if f.get("type") == "HOSPITAL"]
        if isolated_hospitals:
            h_names = [h.get("name") for h in isolated_hospitals]
            alerts.append({
                "id": "ALERT-HOSPITAL-ISOLATION",
                "title": f"Trauma Center Corridor Severance: {len(isolated_hospitals)} Hospitals Unreachable",
                "description": f"Downstream graph traversal indicates zero intact primary or secondary ambulance corridors connecting emergency roots to: {', '.join(h_names)}.",
                "severity": "CRITICAL",
                "category": "INFRASTRUCTURE",
                "status": "ACTIVE",
                "affectedAssetIds": [h.get("id") for h in isolated_hospitals],
                "affectedAssetNames": h_names,
                "timestamp": now,
                "source": "Cascade Graph Reachability Engine",
                "ruleOrigin": "RULE_GRAPH_HOSPITAL_ISOLATION",
            })

        isolated_substations = [f for f in isolated_facilities if f.get("type") == "POWER_SUBSTATION"]
        if isolated_substations:
            s_names = [s.get("name") for s in isolated_substations]
            alerts.append({
                "id": "ALERT-GRID-SUBSTATION-RISK",
                "title": "Master Substation Inundation Risk & Feeder Trip",
                "description": f"Substation {', '.join(s_names)} has low switchyard elevation. Risk of localized drainage pump power failure.",
                "severity": "CRITICAL",
                "category": "GRID",
                "status": "ACTIVE",
                "affectedAssetIds": [s.get("id") for s in isolated_substations],
                "affectedAssetNames": s_names,
                "timestamp": now,
                "source": "Substation Elevation Survey (Synthetic)",
                "ruleOrigin": "RULE_GRID_SUBSTATION_LOW_ELEVATION",
            })

    if not alerts:
        alerts.append({
            "id": "ALERT-ROUTINE-MONITORING",
            "title": "Routine Meteorological Monitoring Active",
            "description": f"Scenario [{scenario.get('name')}] operational conditions are within nominal drainage thresholds. No critical asset corridors severed.",
            "severity": "ADVISORY",
            "category": "HYDROLOGICAL",
            "status": "ACTIVE",
            "affectedAssetIds": ["ALL_SYSTEMS"],
            "affectedAssetNames": ["Urban Drainage Grid"],
            "timestamp": now,
            "source": "System Health Supervisor",
            "ruleOrigin": "RULE_SYSTEM_NOMINAL",
        })

    return jsonify({
        "alerts": alerts,
        "activeCount": len([a for a in alerts if a["status"] == "ACTIVE"]),
        "criticalCount": len([a for a in alerts if a["severity"] == "CRITICAL"]),
        "warningCount": len([a for a in alerts if a["severity"] == "WARNING"]),
    })

@alerts_bp.route("/api/response/recommendations", methods=["GET"])
def get_recommendations():
    scenario = scenario_service.get_active_scenario()
    results = scenario_service.calculate_scenario(scenario)
    facilities = dataset_service.get_facilities()
    options = response_service.generate_response_options(scenario, results, facilities)
    return jsonify({
        "scenarioId": scenario.get("id"),
        "options": options,
        "count": len(options),
    })
