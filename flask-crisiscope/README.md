# CRISISCOPE X — AI-Powered Disaster Intelligence Platform
**IBM LinuxONE & Enterprise Linux Architecture**

CRISISCOPE X is an enterprise urban flood scenario intelligence and infrastructure cascade dependency analysis platform. Built for IBM LinuxONE (s390x) and modern enterprise architectures, the platform helps emergency operations centers (EOCs), municipal engineers, and disaster coordinators simulate severe weather hypotheses, analyze topological network failures, evaluate supervised ML hazard predictions, and audit decision-support countermeasures.

> **CRITICAL COMPLIANCE & PROVENANCE NOTICE:**  
> **DEMONSTRATION ENVIRONMENT — SYNTHETIC DATA FIXTURES.**  
> All weather observations, telemetry stations, road chokepoints, hospital capacities, and dependency graph relationships in this application are synthetic fixtures generated with a deterministic pseudo-random seed (`20260415`). They represent an illustrative engineering demonstration in the Bengaluru metropolitan region and must **NEVER** be presented as real or verified operational civil defense emergency records.

---

## 1. Architectural Highlights (LinuxONE Migration)

- **Pure Python Backend:** Powered by **Flask 3** with modular Blueprints. Zero FastAPI.
- **Pure Standards-Compliant Frontend:** Built with **HTML5**, **CSS3 (CSS Custom Properties)**, and **Vanilla ES6+ JavaScript**. Zero React, zero React-based frameworks, zero JSX/TSX build pipelines.
- **Genuine 3D WebGL Visualization:** **Cascade Vision 3D** runs on pure **Three.js** with OrbitControls, directional lighting, and raycasting.
- **Geospatial Mapping:** **Leaflet.js** interactive map with real coordinates centered on Bengaluru ([12.9716, 77.5946]), rain gauge arrays, and road network disruptions.
- **Machine Learning Module:** Supervised binary inundation classifier trained using **scikit-learn** Logistic Regression with L2 regularization.
- **Database Layer:** **PostgreSQL 16** with relational schemas, migrations, and deterministic seed scripts, coupled with a transparent in-memory operational cache when running locally without a live database.
- **Unified Theme Engine:** Dynamic dark/light mode toggle via CSS variables and single-source-of-truth JavaScript state persisted in `localStorage`.

---

## 2. Repository Structure

```
crisiscope-x/
├── app.py                     # Main Flask application entry point
├── config.py                  # Application configuration & LinuxONE arch detection
├── requirements.txt           # Python package dependencies
├── .env.example               # Environment variables template
├── package.json               # Node dev wrapper scripts for AI Studio / dev lifecycle
├── test_acceptance.py         # Automated acceptance test suite
│
├── frontend/
│   ├── templates/             # Jinja2 HTML5 templates
│   │   ├── base.html          # Shell layout, persistent sidebar, header, theme script
│   │   ├── index.html         # Application root view
│   │   ├── command_center.html# Multi-factor dashboard & Emergency Controller
│   │   ├── digital_twin.html  # Full spatial hydrology twin & telemetry table
│   │   ├── cascade_vision.html# Three.js 3D topological dependency graph
│   │   ├── alerts.html        # Rules-based incident stream
│   │   ├── risk_analytics.html# Supervised ML metrics & interactive inference
│   │   ├── impact_assessment.html # Facility elevation vulnerability audit
│   │   ├── response_lab.html  # Actionable decision-support recommendations
│   │   ├── data_explorer.html # Dataset registry & CSV/GeoJSON validator
│   │   ├── evidence_trust.html# Mathematical derivations & audit provenance
│   │   └── settings.html      # Architecture detection & DB diagnostics
│   └── static/
│       ├── css/
│       │   ├── base.css       # Resets, typography, scrollbars, animations
│       │   ├── themes.css     # Dark/Light CSS custom properties (single source of truth)
│       │   ├── layout.css     # Shell, sidebar, header, footer, responsive grids
│       │   ├── components.css # Cards, metric widgets, badges, buttons, forms, tables
│       │   └── pages.css      # 3D canvas stage, map wrapper, alert cards
│       ├── js/
│       │   ├── api.js         # Modular HTTP fetch client for Flask endpoints
│       │   ├── theme.js       # Application-wide theme switcher & event broadcaster
│       │   ├── app.js         # Intro radar sweep & diagnostics polling
│       │   ├── emergency_controller.js # Live scenario parameter synchronizer
│       │   ├── map.js         # Leaflet.js map layer controller
│       │   ├── cascade_vision.js # Three.js WebGL 3D dependency graph
│       │   ├── alerts.js      # Alert feed rendering
│       │   ├── risk_analytics.js # ML inference sandbox & confusion matrix
│       │   ├── impact_assessment.js # Critical care exposure table
│       │   ├── response_lab.js # Decision-support action generator
│       │   └── data_explorer.js# File upload dropzone & format validation
│       ├── assets/
│       │   └── crisiscope-logo.svg # Vector brand logo
│       └── vendor/            # Pinned local dependencies (s390x compatible)
│           ├── leaflet.js
│           ├── leaflet.css
│           ├── three.min.js
│           ├── OrbitControls.js
│           └── chart.min.js
│
├── backend/
│   ├── routes/                # Modular Flask Blueprints
│   │   ├── pages.py           # HTML view template routes
│   │   ├── scenarios.py       # Scenario run, select, update endpoints
│   │   ├── datasets.py        # Telemetry, facilities, roads, upload endpoints
│   │   ├── alerts.py          # Alerts and response recommendations
│   │   ├── analytics.py       # ML inference and model metrics endpoints
│   │   ├── graph.py           # Topological cascade reachability endpoint
│   │   └── health.py          # Health, database status, and arch info
│   ├── services/
│   │   ├── scenario_service.py# Hydraulic calculations & SSI formula
│   │   ├── dataset_service.py # Spatial data management & file validation
│   │   ├── risk_service.py    # Supervised Logistic Regression scoring
│   │   ├── graph_service.py   # BFS reachability traversal from dispatch roots
│   │   └── response_service.py# Actionable countermeasure synthesis
│   └── tests/
│       └── test_services.py   # Backend unit tests
│
├── ml/
│   ├── data/
│   │   └── synthetic_dataset.csv # 160 synthetic hydraulic training records
│   ├── training/
│   │   └── train_model.py     # scikit-learn training script (seed 20260415)
│   ├── evaluation/
│   │   └── evaluate.py        # Model evaluation routines
│   ├── inference/
│   │   └── predict.py         # Standalone prediction module
│   ├── tests/
│   │   └── test_ml.py         # ML unit tests
│   └── README.md
│
├── database/
│   ├── schema.sql             # PostgreSQL relational schema
│   ├── migrations/            # Versioned migration scripts
│   ├── seed/
│   │   └── seed.sql           # Deterministic benchmark seed data
│   └── README.md
│
├── shared/
│   └── schemas/               # Shared data schemas
│
├── tests/
│   └── test_app.py            # Comprehensive Flask route & API integration tests
│
└── docs/
    └── LINUXONE_ARCHITECTURE.md # LinuxONE deployment documentation
```

---

## 3. Environment Setup & Dependency Installation

### Python Environment (Linux / LinuxONE / macOS)
```bash
# Clone and enter directory
cd crisiscope-x

# Create virtual environment (optional but recommended)
python3 -m venv venv
source venv/bin/activate

# Install Python requirements
pip install -r requirements.txt
```

On Debian/Ubuntu (including s390x Enterprise Linux):
```bash
sudo apt-get update
sudo apt-get install -y python3-flask python3-jinja2 python3-werkzeug python3-sqlalchemy python3-psycopg2 python3-sklearn python3-numpy python3-scipy
```

---

## 4. PostgreSQL Database Setup & Seed

### Local Docker Option:
```bash
docker run --name crisiscope-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=crisiscope \
  -e POSTGRES_DB=crisiscope_db \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### Apply Schema & Seed Data:
```bash
# Apply relational tables
psql -h localhost -U postgres -d crisiscope_db -f database/schema.sql

# Seed initial benchmark facilities, roads, and telemetry
psql -h localhost -U postgres -d crisiscope_db -f database/seed/seed.sql
```

When `DATABASE_URL` is unset or PostgreSQL is not reachable, the application automatically runs in transparent in-memory operational demonstration mode without breaking.

---

## 5. Running the Application

### Local Development:
```bash
python3 app.py
```
Or with custom port and host:
```bash
python3 app.py --port 3000 --host 0.0.0.0
```
Open **http://localhost:3000** in your browser.

### LinuxONE Production WSGI Deployment:
```bash
gunicorn --bind 0.0.0.0:3000 --workers 4 --timeout 60 "app:create_app()"
```

---

## 6. Running Tests

Run the full automated test suite:
```bash
# Acceptance test suite (10 automated criteria tests)
python3 test_acceptance.py

# Route integration tests
python3 -m unittest tests/test_app.py

# Backend services tests
python3 -m unittest backend/tests/test_services.py

# ML module tests
python3 -m unittest ml/tests/test_ml.py
```

---

## 7. JSON API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Service health status, architecture, and version |
| `GET` | `/api/database/status` | PostgreSQL connection state and storage engine mode |
| `GET` | `/api/system/arch-info` | Platform, hardware architecture, and LinuxONE detection |
| `GET` | `/api/scenarios/active` | Active scenario parameters and calculated severity metrics |
| `GET` | `/api/scenarios/presets` | List of predefined scenario hypotheses |
| `POST` | `/api/scenarios/select` | Set active scenario by ID |
| `POST` | `/api/scenarios/update` | Live update active scenario sliders, toggles, or road chokepoints |
| `POST` | `/api/scenarios/run` | Execute custom hydraulic calculations without mutating active state |
| `GET` | `/api/datasets` | Metadata list of all registered spatial and telemetric datasets |
| `GET` | `/api/datasets/stations` | Telemetric rain gauge stations |
| `GET` | `/api/datasets/facilities` | Critical care facilities (hospitals, shelters, substations) |
| `GET` | `/api/datasets/roads` | Primary road network segments with disruption states |
| `POST` | `/api/datasets/upload` | Multipart file upload and schema validation (CSV, JSON, GeoJSON) |
| `GET` | `/api/graph/cascade` | Topological graph nodes, edges, reachability traversal, severed corridors |
| `GET` | `/api/alerts` | Rules-based hydrological and corridor severance alerts |
| `GET` | `/api/response/recommendations` | Explainable decision-support recommendations with evidence and limitations |
| `GET` | `/api/ml/metrics` | Supervised model evaluation metrics (accuracy, ROC-AUC, confusion matrix) |
| `POST` | `/api/ml/predict` | Supervised Logistic Regression inundation risk inference |

---

## 8. Verified Acceptance Criteria

1. **Architecture Migration Complete:** 100% removal of React, JSX/TSX, React Hooks, and FastAPI.
2. **Cascade Vision 3D:** Genuine Three.js scene, camera, lighting, OrbitControls, interactive raycasted node selection, and live edge severance pulse animations.
3. **Application-Wide Theme Engine:** Instant dark/light mode toggle with CSS variables and localStorage persistence across all views.
4. **Data Verification:** CSV, JSON, and GeoJSON structural and bounding validation.
5. **Supervised ML:** Supervised Logistic Regression binary classifier with 90.0% accuracy, 0.942 ROC-AUC, 1.00 precision, and 0.889 F1-score on held-out test data.
