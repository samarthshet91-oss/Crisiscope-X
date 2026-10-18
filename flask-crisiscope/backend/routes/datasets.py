"""
CRISISCOPE X — Datasets Blueprint
Manages spatial and telemetric datasets, facilities, road segments, and file validation.
"""

from flask import Blueprint, jsonify, request
from backend.services.dataset_service import dataset_service

datasets_bp = Blueprint("datasets", __name__)

@datasets_bp.route("/api/datasets", methods=["GET"])
def get_datasets():
    datasets = dataset_service.get_datasets_list()
    return jsonify({
        "datasets": datasets,
        "count": len(datasets),
    })

@datasets_bp.route("/api/datasets/stations", methods=["GET"])
def get_stations():
    stations = dataset_service.get_stations()
    return jsonify(stations)

@datasets_bp.route("/api/datasets/facilities", methods=["GET"])
def get_facilities():
    facilities = dataset_service.get_facilities()
    return jsonify(facilities)

@datasets_bp.route("/api/datasets/roads", methods=["GET"])
def get_roads():
    roads = dataset_service.get_roads()
    return jsonify(roads)

@datasets_bp.route("/api/datasets/upload", methods=["POST"])
def upload_dataset():
    if "file" not in request.files:
        return jsonify({"valid": False, "errors": ["No file part in multipart request"]}), 400
        
    uploaded_file = request.files["file"]
    if uploaded_file.filename == "":
        return jsonify({"valid": False, "errors": ["No selected file"]}), 400

    filename = uploaded_file.filename
    content = uploaded_file.read()
    
    # Infer type
    file_type = "CSV"
    if filename.lower().endswith(".geojson"):
        file_type = "GeoJSON"
    elif filename.lower().endswith(".json"):
        file_type = "JSON"

    result = dataset_service.validate_file(filename, content, file_type)
    status_code = 200 if result.get("valid") else 422
    return jsonify(result), status_code
