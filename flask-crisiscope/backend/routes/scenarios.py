"""
CRISISCOPE X — Scenarios Blueprint
Handles emergency situation parameters, severity index calculations, and scenario switching.
"""

from flask import Blueprint, jsonify, request
from backend.services.scenario_service import scenario_service

scenarios_bp = Blueprint("scenarios", __name__)

@scenarios_bp.route("/api/scenarios/active", methods=["GET"])
def get_active_scenario():
    scenario = scenario_service.get_active_scenario()
    results = scenario_service.calculate_scenario(scenario)
    return jsonify({
        "scenario": scenario,
        "results": results,
    })

@scenarios_bp.route("/api/scenarios/presets", methods=["GET"])
def get_presets():
    presets = scenario_service.list_presets()
    return jsonify(presets)

@scenarios_bp.route("/api/scenarios/select", methods=["POST"])
def select_scenario():
    data = request.get_json() or {}
    scenario_id = data.get("id") or data.get("scenarioId")
    if not scenario_id:
        return jsonify({"error": "Missing scenario id"}), 400
    
    scenario = scenario_service.set_active_scenario(scenario_id)
    if not scenario:
        return jsonify({"error": f"Scenario {scenario_id} not found"}), 404
        
    results = scenario_service.calculate_scenario(scenario)
    return jsonify({
        "scenario": scenario,
        "results": results,
    })

@scenarios_bp.route("/api/scenarios/run", methods=["POST"])
def run_scenario():
    data = request.get_json() or {}
    # If run on custom parameters without persisting
    results = scenario_service.calculate_scenario(data)
    return jsonify({
        "status": "computed",
        "scenario_name": data.get("name", "Custom Urban Run"),
        "results": results,
        "provenance": "SYNTHETIC_SIMULATION",
    })

@scenarios_bp.route("/api/scenarios/update", methods=["POST"])
def update_scenario():
    data = request.get_json() or {}
    active_scenario = scenario_service.get_active_scenario()
    scenario_id = active_scenario.get("id", "SCEN-URBAN-FLOOD-HYPOTHESIS")
    
    updated = scenario_service.update_scenario(scenario_id, data)
    results = scenario_service.calculate_scenario(updated)
    return jsonify({
        "scenario": updated,
        "results": results,
    })
