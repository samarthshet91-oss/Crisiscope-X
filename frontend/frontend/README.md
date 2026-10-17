# Crisiscope X — AI for a Safer Tomorrow
> AI-powered urban flood-risk intelligence and emergency-response decision-support dashboard for Bengaluru.  
> **Theme:** Real-Time AI for Critical Decisions (*Detect, Decide, Respond*).

---

## 1. Folder Map & Architecture

```text
/
├── src/
│   ├── contracts/             # TypeScript API types (PreparedData, ScenarioDefinition, RiskResult, InterventionResult, BackendResponse)
│   ├── api/                   # API client with Mock and Real adapters (switched by VITE_API_BASE)
│   │   └── mock/              # Mock fixtures strictly labelled "Mock data" with Bengaluru datasets
│   ├── shell/                 # Application shell (Collapsible dark navy Sidebar, TopBar with IST clock, DecisionStrip)
│   ├── features/
│   │   ├── dashboard/         # Dashboard (/console): Dark map hero, KPI cards, Rainfall telemetry, Data sources panel, 2x2 grid
│   │   ├── map/               # MapLibre GL 2D/3D map explorer, layers drawer, floating glass callouts
│   │   ├── cascade/           # CascadeVision (/console/cascade): 3D digital-twin, timeline, simulation control panel, progression list
│   │   ├── lab/               # Counterfactual Response Lab (/console/lab): Comparison matrix, Recommended marker, side map, decision trace
│   │   ├── risk/              # Risk analytics (/console/risk): Ward risk bar chart, contributing factors donut, uncertainty timeline
│   │   ├── impact/            # Impact assessment (/console/impact): Loss-of-access scale, infrastructure share (no economic loss)
│   │   ├── alerts/            # Scenario alerts (/console/alerts): Simulated warnings, severity filters, thumbnail previews
│   │   ├── evidence/          # Evidence & data (/console/evidence): s390x runtime badge, benchmark JSON dropzone, dataset registry
│   │   ├── landing/           # Landing page (/): Rain canvas hero, Why Bengaluru, Cascade sequence, Response Lab preview, pipeline
│   │   ├── scenarios/         # Guided demo walkthrough controller & step banners
│   │   ├── settings/          # System settings, runtime architecture toggle, fault injection testing
│   │   └── trust/             # Trust gate & data validation audit checking telemetry freshness
│   ├── i18n/                  # Multi-language localization (English en-IN, Kannada kn, Hindi hi)
│   ├── config/                # City configuration (Bengaluru), dark map basemaps, 10 datasets metadata, hero configs
│   └── store/                 # Zustand global application state store (useAppStore)
├── public/
│   └── evidence/              # manifest.json and REPRODUCE.md
└── package.json
```

---

## 2. Running in Mock Mode

Crisiscope X runs completely self-contained in mock mode with **zero backend dependencies required**:

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

Visit `http://localhost:3000` to interact with the application.

### Switching to Live API
When a real backend or LinuxONE microservice is connected, specify `VITE_API_BASE`:

```bash
export VITE_API_BASE=https://api.crisiscope.bengaluru.gov.in
npm run dev
```

---

## 3. Team Ownership Split (3 Parallel Engineers)

To maintain velocity across the team, features and folders are partitioned with strict contract boundaries:

| Engineer | Focus Areas | Key Folders | Responsibilities |
|---|---|---|---|
| **Engineer 1 (Platform & Shell)** | App Shell, Basemaps, Dashboard & Registry | `/src/shell`, `/src/contracts`, `/src/features/dashboard`, `/src/features/map`, `/src/config` | Global layout, top bar with IST clock, DecisionStrip, MapLibre basemap integration, 10-dataset registry, and responsive navigation drawer. |
| **Engineer 2 (Simulation & Dynamics)** | CascadeVision & Guided Demo | `/src/features/cascade`, `/src/features/scenarios`, `/src/features/landing` | 3D digital-twin simulation, scenario timeline player, rainfall intensity slider, contingency road/facility injection, and guided demo banner. |
| **Engineer 3 (Decision Intelligence & Verification)** | Response Lab, Risk, Impact & Evidence | `/src/features/lab`, `/src/features/risk`, `/src/features/impact`, `/src/features/alerts`, `/src/features/evidence`, `/src/features/trust` | Counterfactual comparison matrix, "Why this one" explainability panel, Trust Gate freshness validation, LinuxONE s390x verification badge, and benchmark dropzone. |

---

## 4. Content Rules & Design Guardrails

- **Bengaluru Only:** Hydrological modeling is strictly calibrated for Bengaluru's 198 BBMP wards (e.g., Bellandur, Outer Ring Road, Hebbal, Koramangala).
- **No Economic Claims:** Impact assessment reflects operational loss of vehicular access (Severe, Moderate, Minor, Unaffected). No economic loss or structural damage figures.
- **Honest Runtime Badges:** The runtime badge dynamically reflects `processingMetadata.runtimeArchitecture` (shows "Verified on s390x" only if the API returns `s390x`).
- **Simulated Warnings:** Alerts are clearly badged: *"Simulated alerts. Not official warnings."*
- **Relative Risk Scale:** No depth in metres; uses relative risk (Low, Moderate, High, Severe) labelled *"Model estimate"*.
- **Provenance Tags:** Every KPI, figure, and chart displays one of four distinct tags:
  1. `Observed` (historical / ground telemetry)
  2. `Synthetic scenario` (simulated contingency injection)
  3. `Model estimate` (predictive routing & runoff algorithm)
  4. `Rule-based` (deterministic emergency protocol)

---

## 5. Emergency Hotlines
In a real flood emergency in Bengaluru, contact:
- **Emergency Police / Disaster Management:** `112`
- **Emergency Ambulance Response:** `108`


---

## Cinematic hero (SpaceEdu-style)

The landing hero is a fixed composition measured from a 1353 x 1163 reference. Every length is `calc(N * var(--u))`, so it scales as one piece (six responsive tiers, burger nav on tablet/phone).

- `src/features/landing/CinematicHero.tsx` — markup, entrance sequence, stage switcher, burger menu
- `src/features/landing/hero.css` — all hero styles, scoped under `.sx`
- `src/config/hero.ts` — `HERO_SCENES` (Detect / Decide / Respond). One scene is featured; the other two fill the left/right slots. Click a slot to rotate.

Each scene can optionally set `cutout` (transparent PNG for the side slot), `clip` and `still` (looping backdrop video + poster, lazy-loaded). Without them the hero uses the built-in CSS orbs and the 3D flood twin.

### Opening shot: Earth -> flood city
On first load the hero plays a ~5 s intro (`EarthIntro.tsx`): planet Earth in space turns to India, the camera dives through the clouds toward Bengaluru, a white-out hands over to the 3D flood city (`CityTwin3D` descends from the sky via its `reveal` prop), and only then does the hero UI animate in. It is fully procedural (the continent mask is embedded in `earthMask.ts`), plays once per page load, can be skipped (button or Esc), and is skipped for `prefers-reduced-motion` or if WebGL is unavailable. Tune timing via `INTRO_DURATION` / `T_REVEAL` in `EarthIntro.tsx`.
