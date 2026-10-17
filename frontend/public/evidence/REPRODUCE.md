# How to Reproduce the Crisiscope X Demo

This document outlines the exact deterministic steps to reproduce the flood simulation and counterfactual response decision verification on your local environment or IBM LinuxONE / s390x cloud instance.

## 1. System Requirements
- Node.js >= 20.x or 22.x
- Supported Architectures: IBM LinuxONE (`s390x`), `x86_64`, `arm64` (Apple Silicon)
- Modern evergreen browser with WebGL 2.0 support (Chrome, Firefox, Safari, Edge)

## 2. Running in Pure Mock Mode (Zero Backend Dependency)
Clone the repository and install frontend dependencies:
```bash
git clone https://github.com/crisiscope-x/frontend.git
cd crisiscope-x
npm install
npm run dev
```
Open `http://localhost:3000` in your browser. The application will boot immediately in **Mock data** mode using the verified Bengaluru fixtures.

## 3. Connecting to Live API (Optional)
To point the frontend to your live hydrodynamic solver or LinuxONE microservice:
```bash
export VITE_API_BASE=http://your-s390x-host:8080
npm run dev
```

## 4. Deterministic Simulation Steps
1. Navigate to **CascadeVision** (`/console/cascade`).
2. Select **Scenario 1: Outer Ring Road & Bellandur Convective Spike (72 mm/h)**.
3. Click **Run simulation**.
4. Observe the 4-step cascade sequence:
   - Step 1: Ecospace Underpass flooded
   - Step 2: Kadubeesanahalli Junction queue delays (+35 min)
   - Step 3: Emergency corridor saturation
   - Step 4: Sakra World Hospital western entrance restricted (facilities reachable drops from 5 to 3)
5. Navigate to **Response Lab** (`/console/lab`) to verify that **Alternative A (Reroute via HAL Old Airport Road)** is recommended (-18 min delay, 88% accessibility).

## 5. Attributions and Open Licences
- Bruhat Bengaluru Mahanagara Palike (BBMP) & KSRSAC: Government Open Data Licence (GODL)
- OpenStreetMap contributors: Open Database License (ODbL)
- Karnataka State Natural Disaster Monitoring Centre (KSNDMC): Public Telemetry
