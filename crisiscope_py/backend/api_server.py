
"""CrisiscopeX JSON API using Python's built-in HTTP server."""

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

from backend.config import APP_NAME, APP_VERSION
from backend.data_loader import load_disaster_alerts
from backend.analysis import get_disaster_summary
from backend.risk_analysis import (
    calculate_risk_indicators,
    assign_risk_category,
)
from backend.live_weather import fetch_live_weather


HOST = "127.0.0.1"
PORT = 8000


class CrisiscopeXHandler(BaseHTTPRequestHandler):
    """Handle CrisiscopeX JSON API requests."""

    def send_json(self, data, status=200):
        """Send a JSON response with an HTTP status code."""
        body = json.dumps(
            data,
            indent=2,
            default=str,
            allow_nan=False,
        ).encode("utf-8")

        self.send_response(status)
        self.send_header(
            "Content-Type",
            "application/json; charset=utf-8",
        )
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        """Route GET requests to the appropriate endpoint."""
        path = urlparse(self.path).path

        if path == "/":
            self.send_json({
                "app": APP_NAME,
                "message": "CrisiscopeX JSON API",
                "endpoints": [
                    "/",
                    "/health",
                    "/api/alerts",
                    "/api/summary",
                    "/api/risks",
                    "/api/weather",
                ],
            })

        elif path == "/health":
            self.send_json({
                "app_name": APP_NAME,
                "version": APP_VERSION,
                "status": "operational",
            })

        elif path == "/api/alerts":
            try:
                alerts = load_disaster_alerts()
                self.send_json({
                    "count": len(alerts),
                    "data": alerts.to_dict(orient="records"),
                    "note": (
                        "Sample dataset; records are illustrative."
                    ),
                })
            except (OSError, ValueError, KeyError) as exc:
                self.send_json({
                    "error": "Could not load disaster alerts",
                    "details": str(exc),
                }, 500)

        elif path == "/api/summary":
            try:
                alerts = load_disaster_alerts()
                summary = get_disaster_summary(alerts)
                self.send_json(summary)
            except (OSError, ValueError, KeyError) as exc:
                self.send_json({
                    "error": "Could not calculate disaster summary",
                    "details": str(exc),
                }, 500)

        elif path == "/api/risks":
            try:
                alerts = load_disaster_alerts()
                risks = calculate_risk_indicators(alerts)
                risks = assign_risk_category(risks)

                self.send_json({
                    "count": len(risks),
                    "data": risks.to_dict(orient="records"),
                    "note": (
                        "Risk points are illustrative, not "
                        "calibrated probabilities."
                    ),
                })
            except (OSError, ValueError, KeyError) as exc:
                self.send_json({
                    "error": "Could not calculate risk indicators",
                    "details": str(exc),
                }, 500)

        elif path == "/api/weather":
            try:
                weather = fetch_live_weather()
                self.send_json(weather)
            except (RuntimeError, ValueError) as exc:
                self.send_json({
                    "error": "Weather data unavailable",
                    "details": str(exc),
                }, 503)

        else:
            self.send_json({
                "error": "Endpoint not found",
                "path": path,
            }, 404)

    def log_message(self, format, *args):
        """Keep request logging concise."""
        print(f"[CrisiscopeX API] {args[0]}")


def main():
    """Start the local CrisiscopeX API server."""
    server = ThreadingHTTPServer((HOST, PORT), CrisiscopeXHandler)
    print(f"{APP_NAME} JSON API running at http://{HOST}:{PORT}")
    print("Press Ctrl+C to stop.")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping CrisiscopeX API...")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
