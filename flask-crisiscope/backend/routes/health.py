"""
CRISISCOPE X — Health & System Diagnostics Blueprint
"""

import os
import platform
import datetime
from flask import Blueprint, jsonify
from config import Config

health_bp = Blueprint("health", __name__)

@health_bp.route("/api/health", methods=["GET"])
def get_health():
    return jsonify({
        "status": "healthy",
        "service": Config.APP_NAME,
        "tagline": Config.TAGLINE,
        "version": Config.VERSION,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "arch": platform.machine(),
        "framework": "Flask 3 (Enterprise Python)",
        "frontend": "Vanilla ES6+ / HTML5 / CSS3 (No React / No FastAPI)",
    })

@health_bp.route("/api/database/status", methods=["GET"])
def get_database_status():
    db_url = Config.DATABASE_URL
    # Check if database is reachable
    connected = False
    message = "PostgreSQL schema defined in database/schema.sql. Running in transparent high-fidelity in-memory state engine."
    
    try:
        from sqlalchemy import create_engine, text
        # Attempt quick connection with 1-second timeout
        engine = create_engine(db_url, connect_args={"connect_timeout": 1})
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            connected = True
            message = "Connected to persistent PostgreSQL database."
    except Exception as e:
        connected = False
        message = f"PostgreSQL not connected locally ({type(e).__name__}). In-memory operational cache active."

    return jsonify({
        "connected": connected,
        "engine": "PostgreSQL 16 Enterprise / LinuxONE Compatible",
        "database": "crisiscope_db",
        "statusMessage": message,
        "connectionStringMasked": "postgresql://postgres:***@localhost:5432/crisiscope_db",
        "lastChecked": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "inMemoryFallbackActive": not connected,
    })

@health_bp.route("/api/system/arch-info", methods=["GET"])
def get_arch_info():
    return jsonify(Config.get_system_summary())
