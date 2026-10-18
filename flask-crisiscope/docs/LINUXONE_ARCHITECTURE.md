# CRISISCOPE X — IBM LinuxONE (s390x) Architecture & Deployment Guide

## 1. Executive Summary
CRISISCOPE X has been refactored to eliminate all React, React.js, React-based frameworks, JSX/TSX build steps, and FastAPI dependencies. The platform runs on an enterprise-grade pure Python (Flask 3) backend and standards-compliant vanilla HTML5/CSS3/ES6+ frontend with Leaflet.js, Three.js, and Chart.js.

## 2. IBM LinuxONE (s390x) Technical Compatibility
- **Architecture Independence:** Pure Python and vanilla web assets avoid proprietary binary wheel incompatibilities common in s390x distributions.
- **Backend Stack:** Python 3.10+ / 3.11+, Flask 3, Werkzeug, Jinja2, SQLAlchemy 2, psycopg2.
- **Database Engine:** PostgreSQL 15+ Enterprise, running natively on Linux on IBM Z / LinuxONE or via standard container images.
- **Machine Learning Engine:** scikit-learn Logistic Regression classifier with L2 regularization, executed deterministically across big-endian and little-endian hardware.
- **Frontend Engine:** Native browser DOM, WebGL (Three.js), and CSS variables. Zero node runtime or transpilation needed in production.

## 3. Database Deployment
Apply the migration and seed schemas:
```bash
# Initialize schema
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d crisiscope_db -f database/schema.sql

# Seed initial benchmark facilities, road networks, and telemetry stations
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d crisiscope_db -f database/seed/seed.sql
```

## 4. Production Service Execution
Run via Gunicorn or standard WSGI:
```bash
gunicorn --bind 0.0.0.0:3000 --workers 4 "app:create_app()"
```
Or native Python:
```bash
python3 app.py
```
