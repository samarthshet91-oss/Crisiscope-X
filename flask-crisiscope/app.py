"""
CRISISCOPE X — Main Application Entry Point
Enterprise Disaster Intelligence Platform for IBM LinuxONE (s390x) & Linux Architectures.

Architecture:
- Backend: Flask 3 with modular Blueprints (Pure Python, zero FastAPI)
- Frontend: HTML5, CSS3, Vanilla ES6+ JavaScript, Leaflet.js, Three.js, Chart.js (Zero React)
- Database: PostgreSQL with transparent in-memory operational cache
"""

import os
import sys
from flask import Flask, jsonify
from config import Config

def create_app(config_class=Config):
    # Ensure correct template and static paths
    base_dir = os.path.abspath(os.path.dirname(__file__))
    templates_dir = os.path.join(base_dir, "frontend", "templates")
    static_dir = os.path.join(base_dir, "frontend", "static")

    app = Flask(
        __name__,
        template_folder=templates_dir,
        static_folder=static_dir,
        static_url_path="/static"
    )
    app.config.from_object(config_class)

    # Register modular blueprints
    from backend.routes.pages import pages_bp
    from backend.routes.health import health_bp
    from backend.routes.scenarios import scenarios_bp
    from backend.routes.datasets import datasets_bp
    from backend.routes.alerts import alerts_bp
    from backend.routes.analytics import analytics_bp
    from backend.routes.graph import graph_bp

    app.register_blueprint(pages_bp)
    app.register_blueprint(health_bp)
    app.register_blueprint(scenarios_bp)
    app.register_blueprint(datasets_bp)
    app.register_blueprint(alerts_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(graph_bp)

    # Consistent Error Handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({
            "error": "Not Found",
            "message": "The requested resource was not found on this server.",
            "status": 404
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "error": "Internal Server Error",
            "message": "An unexpected error occurred during operation execution.",
            "status": 500
        }), 500

    # Security & CORS Headers
    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET,PUT,POST,DELETE,OPTIONS"
        return response

    return app

app = create_app()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="CRISISCOPE X LinuxONE Disaster Intelligence Platform")
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", 3000)), help="Port to listen on")
    parser.add_argument("--host", type=str, default=os.environ.get("HOST", "0.0.0.0"), help="Host to bind to")
    args, unknown = parser.parse_known_args()

    port = args.port
    host = args.host
    print(f"================================================================")
    print(f" CRISISCOPE X — LinuxONE Disaster Intelligence Platform")
    print(f" Version: {Config.VERSION} | Python: {sys.version.split()[0]}")
    print(f" Platform Arch: {Config.SYSTEM_ARCH} (LinuxONE s390x Compatible)")
    print(f" Serving UI & APIs on http://{host}:{port}")
    print(f" Zero React | Zero FastAPI | Pure Vanilla Architecture")
    print(f"================================================================")
    app.run(host=host, port=port, debug=Config.DEBUG)
