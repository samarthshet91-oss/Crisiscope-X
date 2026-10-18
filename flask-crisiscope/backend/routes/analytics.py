"""
CRISISCOPE X — ML Risk Analytics Blueprint
Supervised Machine Learning inference, feature importance, and performance evaluation metrics.
"""

from flask import Blueprint, jsonify, request
from backend.services.risk_service import risk_service

analytics_bp = Blueprint("analytics", __name__)

@analytics_bp.route("/api/ml/predict", methods=["POST"])
def predict():
    data = request.get_json() or {}
    prediction = risk_service.predict_inundation_risk(data)
    return jsonify(prediction)

@analytics_bp.route("/api/ml/metrics", methods=["GET"])
def get_metrics():
    metrics = risk_service.get_metrics()
    return jsonify(metrics)

@analytics_bp.route("/api/ml/features", methods=["GET"])
def get_features():
    metrics = risk_service.get_metrics()
    return jsonify({
        "features": metrics["features"],
        "modelArchitecture": metrics["algorithm"]
    })
