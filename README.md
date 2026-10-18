# CRISISCOPE X
### AI-Powered Disaster Intelligence & Urban Flood Scenario Analysis

**From disaster signals to actionable intelligence.**

Crisiscope-X is an AI-enabled disaster intelligence platform designed to explore urban flood scenarios, analyze infrastructure dependencies, visualize potential cascading disruptions, and support data-informed emergency response planning.

Built around a modular Flask application and an interactive web interface, Crisiscope-X combines geospatial visualization, 3D dependency exploration, analytical workflows, and machine-learning components in a unified environment.

> **Project status:** Active development  
> **Domain:** AI · Disaster Intelligence · Urban Flood Analysis · Decision Support  
> **Architecture:** Flask · Vanilla JavaScript · Machine Learning · Geospatial Visualization

> [!IMPORTANT]
> **Data provenance and safety:** The included weather observations, monitoring stations, road disruptions, hospital-capacity values, and dependency relationships are synthetic demonstration data. They are not verified live observations, official emergency alerts, or validated operational forecasts. Crisiscope-X is a prototype and must not be used as the sole basis for real-world emergency decisions.

---

## 01 — The Problem

Disaster response requires more than identifying a hazard. Decision-makers must interpret fragmented information, understand spatial exposure, investigate infrastructure dependencies, and evaluate alternative response scenarios under uncertainty.

Conventional dashboards may present individual indicators without providing a unified environment for exploring how disruptions could affect connected systems.

Crisiscope-X addresses this challenge by bringing scenario exploration, risk analysis, geospatial context, and infrastructure dependency visualization into one decision-support interface.

## 02 — The Solution

Crisiscope-X follows a decision-oriented workflow:

**Observe → Analyze → Visualize → Simulate → Evaluate**

The platform enables users to explore illustrative disaster conditions, inspect risk-related outputs, examine connected infrastructure relationships, and investigate how different scenario assumptions affect the displayed results.

Its purpose is to make complex disaster scenarios easier to explore and communicate—not to replace verified emergency systems or professional judgement.

## 03 — Key Capabilities

### Flood Scenario Intelligence
Explore configured rainfall and flood-related scenarios using the demonstration data and analytical workflows included in the application.

### Geospatial Situational Awareness
Use interactive maps to visualize location-oriented information and investigate the spatial context of represented risks and disruptions.

### Cascade Vision 3D
Explore infrastructure and dependency relationships through a Three.js-based 3D interface, helping users examine how a disruption may relate to connected components.

### Risk Analytics and Impact Assessment
Review risk indicators, analytical outputs, and scenario-dependent impact information through dashboard visualizations.

### Scenario Exploration and Response Lab
Investigate alternative assumptions and explore response-oriented workflows to support comparative analysis and planning discussions.

### Machine-Learning Pipeline
The repository includes model training, inference, and evaluation code for an illustrative inundation-classification use case. Model performance must be established through appropriate validation before predictions are treated as reliable.

### Modular Application Services
Flask Blueprints separate page handling, health checks, scenario operations, dataset access, alerts, analytics, and graph-related functionality.

### Interactive Interface
HTML, CSS, and vanilla JavaScript power the application interface, with dark/light theme switching and interactive visualizations.

---

## 04 — Technology Stack

| Layer | Technologies |
|---|---|
| Backend | Python, Flask 3, Jinja2 |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Geospatial visualization | Leaflet.js |
| 3D visualization | Three.js, OrbitControls, WebGL |
| Charts | Chart.js |
| Machine learning | scikit-learn, Logistic Regression |
| Data processing | NumPy, pandas, SciPy, joblib |
| Database integration | SQLAlchemy, PostgreSQL driver |
| Configuration | Environment variables, python-dotenv |
| Testing | pytest-based test suites |
| Portability target | Linux and IBM LinuxONE / s390x-compatible environments |

The Flask application serves its own templates and static assets; the documented implementation does not require a React frontend or FastAPI backend.

---

## 05 — Architecture

The application separates the web interface, backend routes, application services, database resources, and analytical components.

~~~text
                       CRISISCOPE X
                            |
                 Interactive Web Interface
                 HTML · CSS · JavaScript
                            |
                     Flask Application
                            |
          +-----------------+-----------------+
          |                 |                 |
      Page Routes      Scenario Routes    Data / API Routes
          |                 |                 |
          +-----------------+-----------------+
                            |
                     Service Layer
                            |
          +-----------------+-----------------+
          |                 |                 |
      Risk Analysis    Graph Analysis    Scenario Logic
          |                 |                 |
          +-----------------+-----------------+
                            |
                 ML Training / Inference
                            |
               Visualizations & Outputs
                            |
                Decision-Support Workflow
~~~

This is a high-level architectural overview. Actual behavior depends on the implementation and configuration of each component.

---

## 06 — Repository Structure

~~~text
Crisiscope-X/
├── README.md
└── flask-crisiscope/
    ├── app.py
    ├── config.py
    ├── requirements.txt
    ├── .env.example
    ├── backend/
    │   ├── routes/
    │   ├── services/
    │   └── tests/
    ├── database/
    │   ├── schema.sql
    │   ├── migrations/
    │   └── seed/
    ├── docs/
    ├── frontend/
    │   ├── templates/
    │   └── static/
    ├── ml/
    │   ├── data/
    │   ├── training/
    │   ├── inference/
    │   ├── evaluation/
    │   └── tests/
    ├── shared/
    ├── tests/
    └── test_acceptance.py
~~~

**Important directories**

- `backend/` — application routes, services, and backend tests.
- `database/` — SQL schema, migrations, and seed scripts.
- `docs/` — architecture and technical documentation.
- `frontend/` — HTML templates, stylesheets, JavaScript, visual assets, and media.
- `ml/` — example data, training, inference, and evaluation workflows.
- `tests/` — application-level tests.

---

## 07 — Getting Started

### Prerequisites

- Python 3.10 or newer recommended.
- Git.
- A terminal such as PowerShell or a Linux/macOS shell.
- PostgreSQL if testing database-backed functionality that requires it.

### Step 1: Clone the repository

~~~bash
git clone https://github.com/samarthshet91-oss/Crisiscope-X.git
cd Crisiscope-X/flask-crisiscope
~~~

### Step 2: Create a virtual environment

**Windows PowerShell**

~~~powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
~~~

**Linux / macOS**

~~~bash
python3 -m venv .venv
source .venv/bin/activate
~~~

### Step 3: Install dependencies

~~~bash
python -m pip install --upgrade pip
pip install -r requirements.txt
~~~

### Step 4: Configure the environment

Review `.env.example` and configure the environment variables required by your setup. Create a local `.env` file only if necessary.

Never commit credentials, API keys, passwords, or populated environment files.

### Step 5: Start the application

~~~bash
python app.py
~~~

The application defaults to port `3000`. Open:

**http://127.0.0.1:3000**

To use another port:

~~~bash
python app.py --port 5000
~~~

### Step 6: Run tests

From the `flask-crisiscope` directory:

~~~bash
python -m pytest
~~~

Some tests may require additional services or configuration. A successful local test run does not, by itself, establish production readiness.

---

## 08 — Data Integrity and Limitations

Crisiscope-X distinguishes between demonstration data, analytical outputs, and verified operational information.

- **Synthetic data:** Included fixtures are intended for demonstration and testing.
- **Scenario analysis:** Results depend on the assumptions and inputs used.
- **Model predictions:** Outputs require appropriate validation against representative data.
- **Live monitoring:** Real-time data availability must be independently verified; the presence of a dashboard does not establish a live data connection.
- **Emergency use:** The platform is not a certified forecasting or emergency-warning system.

These limitations are essential when interpreting disaster-related visualizations and model outputs.

---

## 09 — Security and Responsible Use

Before deploying the application beyond a local development environment:

- Review authentication and authorization requirements.
- Restrict CORS to trusted origins where appropriate.
- Protect environment variables and database credentials.
- Review network exposure, error handling, and logging.
- Validate incoming data and API requests.
- Evaluate model quality and uncertainty before operational use.

Do not rely on experimental outputs as a substitute for official warnings, verified data, or qualified emergency personnel.

---

## 10 — Future Development

Potential development directions include:

- Integration with verified rainfall and environmental data sources.
- Model validation using representative datasets and documented metrics.
- Improved uncertainty estimates for risk and scenario outputs.
- Expanded infrastructure dependency and cascading-impact analysis.
- More comprehensive scenario comparison.
- Deployment hardening, monitoring, and performance evaluation.

These are prospective improvements, not claims that every capability is already implemented.

---

## 11 — Contributing

Contributions, bug reports, and technical suggestions are welcome.

1. Describe the issue or proposed improvement.
2. Keep changes focused on the relevant component.
3. Add or update tests where appropriate.
4. Document configuration changes.
5. Avoid committing secrets, private data, or unlicensed datasets.

---

## Project Links

- **Repository:** [Crisiscope-X on GitHub](https://github.com/samarthshet91-oss/Crisiscope-X)
- **Flask application:** [Browse the source code](https://github.com/samarthshet91-oss/Crisiscope-X/tree/main/flask-crisiscope)
- **Architecture documentation:** [LinuxONE architecture](https://github.com/samarthshet91-oss/Crisiscope-X/blob/main/flask-crisiscope/docs/LINUXONE_ARCHITECTURE.md)

---

<div align="center">

**CRISISCOPE X**

*Explore scenarios. Understand dependencies. Support better-informed decisions.*

</div>
