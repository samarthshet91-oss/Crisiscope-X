"""
CRISISCOPE X — Dependency Graph & Cascade Intelligence Blueprint
"""

from flask import Blueprint, jsonify, request
from backend.services.graph_service import graph_service
from backend.services.scenario_service import scenario_service

graph_bp = Blueprint("graph", __name__)

@graph_bp.route("/api/graph/cascade", methods=["GET"])
def get_cascade_graph():
    # Evaluate cascade under active scenario disruptions
    active_scenario = scenario_service.get_active_scenario()
    disruptions = active_scenario.get("declaredDisruptions", [])
    cascade_result = graph_service.analyze_cascade(disruptions)
    return jsonify({
        "scenarioId": active_scenario.get("id"),
        "scenarioName": active_scenario.get("name"),
        "declaredDisruptions": disruptions,
        **cascade_result
    })

@graph_bp.route("/api/graph/analyze", methods=["POST"])
def analyze_custom_graph():
    data = request.get_json() or {}
    disruptions = data.get("declaredDisruptions", [])
    result = graph_service.analyze_cascade(disruptions)
    return jsonify(result)
