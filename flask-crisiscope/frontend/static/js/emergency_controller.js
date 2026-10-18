/**
 * CRISISCOPE X — Emergency Situation Controller
 * Synchronizes scenario parameters, live recalculation, and broadcasts state to all view engines.
 */

const EmergencyController = {
  activeScenario: null,
  activeResults: null,
  presets: [],
  listeners: [],

  async init() {
    try {
      const [scenarioRes, presetsRes] = await Promise.all([
        API.getActiveScenario(),
        API.getPresetScenarios()
      ]);

      this.activeScenario = scenarioRes.scenario;
      this.activeResults = scenarioRes.results;
      this.presets = presetsRes;

      this.renderControls();
      this.bindEvents();
      this.updateMetricsUI();
    } catch (err) {
      console.error("Failed to initialize Emergency Situation Controller:", err);
    }
  },

  onStateChange(callback) {
    if (typeof callback === "function") {
      this.listeners.push(callback);
    }
  },

  notifyListeners() {
    this.listeners.forEach((cb) => {
      try {
        cb(this.activeScenario, this.activeResults);
      } catch (e) {
        console.error("EmergencyController listener error:", e);
      }
    });
  },

  renderControls() {
    const presetSelect = document.getElementById("scenario-preset-select");
    if (presetSelect && this.presets.length > 0) {
      presetSelect.innerHTML = this.presets
        .map(
          (p) => `<option value="${p.id}" ${p.id === this.activeScenario.id ? "selected" : ""}>${p.name}</option>`
        )
        .join("");
    }

    // Set slider and input values
    const intensityInput = document.getElementById("input-rainfall-intensity");
    const intensityVal = document.getElementById("val-rainfall-intensity");
    if (intensityInput && this.activeScenario) {
      intensityInput.value = this.activeScenario.rainfallIntensityMmPerHour;
      if (intensityVal) intensityVal.textContent = `${this.activeScenario.rainfallIntensityMmPerHour} mm/hr`;
    }

    const durationInput = document.getElementById("input-rainfall-duration");
    const durationVal = document.getElementById("val-rainfall-duration");
    if (durationInput && this.activeScenario) {
      durationInput.value = this.activeScenario.rainfallDurationHours;
      if (durationVal) durationVal.textContent = `${this.activeScenario.rainfallDurationHours} hrs`;
    }

    const profileSelect = document.getElementById("input-rainfall-profile");
    if (profileSelect && this.activeScenario) {
      profileSelect.value = this.activeScenario.rainfallProfile || "Convective Peak";
    }

    const catchmentSelect = document.getElementById("input-catchment-zone");
    if (catchmentSelect && this.activeScenario) {
      catchmentSelect.value = this.activeScenario.catchmentZone || "Bellandur Basin";
    }

    // Toggles
    const pumpToggle = document.getElementById("toggle-mitigation-pumps");
    if (pumpToggle && this.activeScenario) {
      pumpToggle.checked = Boolean(this.activeScenario.mitigationPumpsDeployed);
    }

    const drainageToggle = document.getElementById("toggle-drainage-clearance");
    if (drainageToggle && this.activeScenario) {
      drainageToggle.checked = Boolean(this.activeScenario.drainageClearanceActive);
    }

    const rerouteToggle = document.getElementById("toggle-traffic-reroute");
    if (rerouteToggle && this.activeScenario) {
      rerouteToggle.checked = Boolean(this.activeScenario.trafficPreemptiveRerouting);
    }

    // Road disruptions
    this.renderDisruptionCheckboxes();
  },

  renderDisruptionCheckboxes() {
    const container = document.getElementById("disruptions-checkbox-list");
    if (!container) return;

    const roadOptions = [
      { id: "SYNTH-ROAD-01", name: "Outer Ring Road (Bellandur - Marathahalli)" },
      { id: "SYNTH-ROAD-02", name: "Koramangala 100ft Intermediate Arterial" },
      { id: "SYNTH-ROAD-03", name: "MG Road - Indiranagar Corridor" },
      { id: "SYNTH-ROAD-04", name: "Majestic - MG Road Central Link" },
      { id: "SYNTH-ROAD-05", name: "Silk Board Underpass Chokepoint" },
      { id: "SYNTH-ROAD-06", name: "Hebbal Elevated Expressway North" },
      { id: "SYNTH-ROAD-07", name: "Marathahalli - Whitefield Hope Farm" }
    ];

    const activeSet = new Set(this.activeScenario ? this.activeScenario.declaredDisruptions : []);

    container.innerHTML = roadOptions
      .map(
        (r) => `
        <label class="switch-label" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; font-size:12px;">
          <span>${r.name}</span>
          <input type="checkbox" class="disruption-checkbox" data-road-id="${r.id}" ${activeSet.has(r.id) ? "checked" : ""} style="cursor:pointer;" />
        </label>`
      )
      .join("");

    container.querySelectorAll(".disruption-checkbox").forEach((box) => {
      box.addEventListener("change", () => {
        this.collectAndRecalculate();
      });
    });
  },

  bindEvents() {
    const presetSelect = document.getElementById("scenario-preset-select");
    if (presetSelect) {
      presetSelect.addEventListener("change", async (e) => {
        const scenarioId = e.target.value;
        try {
          const res = await API.selectScenario(scenarioId);
          this.activeScenario = res.scenario;
          this.activeResults = res.results;
          this.renderControls();
          this.updateMetricsUI();
          this.notifyListeners();
        } catch (err) {
          console.error("Failed to select scenario:", err);
        }
      });
    }

    const intensityInput = document.getElementById("input-rainfall-intensity");
    const intensityVal = document.getElementById("val-rainfall-intensity");
    if (intensityInput) {
      intensityInput.addEventListener("input", (e) => {
        if (intensityVal) intensityVal.textContent = `${e.target.value} mm/hr`;
        this.collectAndRecalculate();
      });
    }

    const durationInput = document.getElementById("input-rainfall-duration");
    const durationVal = document.getElementById("val-rainfall-duration");
    if (durationInput) {
      durationInput.addEventListener("input", (e) => {
        if (durationVal) durationVal.textContent = `${e.target.value} hrs`;
        this.collectAndRecalculate();
      });
    }

    const profileSelect = document.getElementById("input-rainfall-profile");
    if (profileSelect) {
      profileSelect.addEventListener("change", () => this.collectAndRecalculate());
    }

    const catchmentSelect = document.getElementById("input-catchment-zone");
    if (catchmentSelect) {
      catchmentSelect.addEventListener("change", () => this.collectAndRecalculate());
    }

    ["toggle-mitigation-pumps", "toggle-drainage-clearance", "toggle-traffic-reroute"].forEach((id) => {
      const toggle = document.getElementById(id);
      if (toggle) {
        toggle.addEventListener("change", () => this.collectAndRecalculate());
      }
    });
  },

  async collectAndRecalculate() {
    const intensity = parseFloat(document.getElementById("input-rainfall-intensity")?.value || 85.0);
    const duration = parseInt(document.getElementById("input-rainfall-duration")?.value || 5);
    const profile = document.getElementById("input-rainfall-profile")?.value || "Convective Peak";
    const catchment = document.getElementById("input-catchment-zone")?.value || "Bellandur Basin";

    const pumps = Boolean(document.getElementById("toggle-mitigation-pumps")?.checked);
    const drainage = Boolean(document.getElementById("toggle-drainage-clearance")?.checked);
    const rerouting = Boolean(document.getElementById("toggle-traffic-reroute")?.checked);

    const disruptions = [];
    document.querySelectorAll(".disruption-checkbox:checked").forEach((box) => {
      disruptions.push(box.getAttribute("data-road-id"));
    });

    const updates = {
      rainfallIntensityMmPerHour: intensity,
      rainfallDurationHours: duration,
      rainfallProfile: profile,
      catchmentZone: catchment,
      mitigationPumpsDeployed: pumps,
      drainageClearanceActive: drainage,
      trafficPreemptiveRerouting: rerouting,
      declaredDisruptions: disruptions
    };

    try {
      const res = await API.updateScenario(updates);
      this.activeScenario = res.scenario;
      this.activeResults = res.results;
      this.updateMetricsUI();
      this.notifyListeners();
    } catch (err) {
      console.error("Recalculation error:", err);
    }
  },

  updateMetricsUI() {
    if (!this.activeResults) return;

    // Update global stat boxes if present on page
    const ssiEl = document.getElementById("metric-ssi-val");
    if (ssiEl) ssiEl.textContent = `${this.activeResults.scenarioSeverityIndex}/100`;

    const rainEl = document.getElementById("metric-rain-val");
    if (rainEl) rainEl.textContent = `${this.activeResults.accumulatedRainfallMm} mm`;

    const satEl = document.getElementById("metric-sat-val");
    if (satEl) satEl.textContent = `${this.activeResults.effectiveSoilSaturationPct}%`;

    const runoffEl = document.getElementById("metric-runoff-val");
    if (runoffEl) runoffEl.textContent = `${(this.activeResults.syntheticRunoffVolumeM3 / 1000000).toFixed(2)}M m³`;

    const severedEl = document.getElementById("metric-severed-val");
    if (severedEl) severedEl.textContent = this.activeResults.severedEdgesCount;

    const isolatedEl = document.getElementById("metric-isolated-val");
    if (isolatedEl) isolatedEl.textContent = this.activeResults.isolatedFacilities.length;

    // Header badge
    const headerBadge = document.getElementById("header-scenario-name");
    if (headerBadge && this.activeScenario) {
      headerBadge.textContent = this.activeScenario.name;
    }
  }
};

window.EmergencyController = EmergencyController;

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("scenario-controller-container")) {
    EmergencyController.init();
  }
});
