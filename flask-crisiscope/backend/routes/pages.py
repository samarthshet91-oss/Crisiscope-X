"""
CRISISCOPE X — UI Pages Blueprint
Serves pure HTML5 / Vanilla JS views for each operational domain.
Zero React, zero JSX/TSX.
"""

from flask import Blueprint, render_template
from config import Config
from backend.services.scenario_service import scenario_service

pages_bp = Blueprint("pages", __name__)

def get_common_context(active_tab):
    active_scenario = scenario_service.get_active_scenario()
    presets = scenario_service.list_presets()
    return {
        "app_name": Config.APP_NAME,
        "tagline": Config.TAGLINE,
        "version": Config.VERSION,
        "active_tab": active_tab,
        "active_scenario": active_scenario,
        "presets": presets,
        "is_linuxone": Config.IS_LINUXONE,
        "system_arch": Config.SYSTEM_ARCH,
    }

@pages_bp.route("/", methods=["GET"])
@pages_bp.route("/command-center", methods=["GET"])
def command_center():
    ctx = get_common_context("command_center")
    return render_template("command_center.html", **ctx)

@pages_bp.route("/digital-twin", methods=["GET"])
def digital_twin():
    ctx = get_common_context("digital_twin")
    return render_template("digital_twin.html", **ctx)

@pages_bp.route("/cascade-vision", methods=["GET"])
def cascade_vision():
    ctx = get_common_context("cascade_vision")
    return render_template("cascade_vision.html", **ctx)

@pages_bp.route("/alerts", methods=["GET"])
def alerts():
    ctx = get_common_context("alerts_incidents")
    return render_template("alerts.html", **ctx)

@pages_bp.route("/risk-analytics", methods=["GET"])
def risk_analytics():
    ctx = get_common_context("risk_analytics")
    return render_template("risk_analytics.html", **ctx)

@pages_bp.route("/impact-assessment", methods=["GET"])
def impact_assessment():
    ctx = get_common_context("impact_assessment")
    return render_template("impact_assessment.html", **ctx)

@pages_bp.route("/response-lab", methods=["GET"])
def response_lab():
    ctx = get_common_context("response_lab")
    return render_template("response_lab.html", **ctx)

@pages_bp.route("/data-explorer", methods=["GET"])
def data_explorer():
    ctx = get_common_context("data_explorer")
    return render_template("data_explorer.html", **ctx)

@pages_bp.route("/evidence-trust", methods=["GET"])
def evidence_trust():
    ctx = get_common_context("evidence_trust")
    return render_template("evidence_trust.html", **ctx)

@pages_bp.route("/settings", methods=["GET"])
def settings():
    ctx = get_common_context("settings")
    return render_template("settings.html", **ctx)
