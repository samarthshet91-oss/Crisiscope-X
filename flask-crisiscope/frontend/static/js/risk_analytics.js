/**
 * CRISISCOPE X — Machine Learning Risk Analytics Engine
 * Supervised Logistic Regression evaluation & interactive inference sandbox.
 */

const MLRiskAnalytics = {
  async init() {
    this.bindInferenceForm();
    await this.loadMetrics();
    // Run default initial inference
    this.runInference();
  },

  async loadMetrics() {
    try {
      const metrics = await API.getMLMetrics();
      this.renderMetrics(metrics);
    } catch (err) {
      console.error("Failed to load ML metrics:", err);
    }
  },

  renderMetrics(m) {
    const accEl = document.getElementById("metric-ml-accuracy");
    if (accEl) accEl.textContent = `${(m.accuracy * 100).toFixed(1)}%`;

    const aucEl = document.getElementById("metric-ml-auc");
    if (aucEl) aucEl.textContent = m.aucRoc.toFixed(3);

    const f1El = document.getElementById("metric-ml-f1");
    if (f1El) f1El.textContent = m.f1Score.toFixed(3);

    const precEl = document.getElementById("metric-ml-precision");
    if (precEl) precEl.textContent = `${(m.precision * 100).toFixed(0)}%`;

    const recEl = document.getElementById("metric-ml-recall");
    if (recEl) recEl.textContent = `${(m.recall * 100).toFixed(0)}%`;

    // Render confusion matrix
    if (m.confusionMatrix) {
      const cm = m.confusionMatrix;
      const tn = document.getElementById("cm-tn");
      const fp = document.getElementById("cm-fp");
      const fn = document.getElementById("cm-fn");
      const tp = document.getElementById("cm-tp");
      if (tn) tn.textContent = cm.trueNegatives;
      if (fp) fp.textContent = cm.falsePositives;
      if (fn) fn.textContent = cm.falseNegatives;
      if (tp) tp.textContent = cm.truePositives;
    }

    // Render feature weights
    const featureContainer = document.getElementById("ml-feature-weights-list");
    if (featureContainer && m.features) {
      featureContainer.innerHTML = m.features
        .map((f) => {
          const isPos = f.importance > 0;
          const barWidth = Math.abs(f.importance) * 100;
          return `
          <div style="margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
              <span class="font-mono"><strong>${f.name}</strong></span>
              <span style="color:${isPos ? 'var(--accent-red)' : 'var(--accent-green)'}; font-weight:700;">
                ${isPos ? '+' : ''}${f.importance.toFixed(2)}
              </span>
            </div>
            <div style="height:6px; background:var(--bg-secondary); border-radius:3px; overflow:hidden;">
              <div style="height:100%; width:${barWidth}%; background-color:${isPos ? 'var(--accent-red)' : 'var(--accent-green)'}; border-radius:3px;"></div>
            </div>
            <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">${f.impact}</div>
          </div>`;
        })
        .join("");
    }
  },

  bindInferenceForm() {
    const inputs = [
      "ml-input-rain",
      "ml-input-cum-rain",
      "ml-input-elevation",
      "ml-input-soil-sat",
      "ml-input-drainage"
    ];

    inputs.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", () => {
          const valDisplay = document.getElementById(`${id}-val`);
          if (valDisplay) valDisplay.textContent = el.value;
          this.runInference();
        });
      }
    });

    document.getElementById("btn-run-ml-inference")?.addEventListener("click", () => {
      this.runInference();
    });
  },

  async runInference() {
    const rain = parseFloat(document.getElementById("ml-input-rain")?.value || 75.0);
    const cum = parseFloat(document.getElementById("ml-input-cum-rain")?.value || 160.0);
    const elev = parseFloat(document.getElementById("ml-input-elevation")?.value || 890.0);
    const sat = parseFloat(document.getElementById("ml-input-soil-sat")?.value || 78.0);
    const drainage = parseFloat(document.getElementById("ml-input-drainage")?.value || 4.0);

    const payload = {
      rainfallIntensityMmHr: rain,
      cumulativeRainfallMm: cum,
      elevationMeters: elev,
      soilSaturationPct: sat,
      drainageMaintenanceScore: drainage
    };

    try {
      const res = await API.predictML(payload);
      this.renderInferenceResults(res);
    } catch (err) {
      console.error("Inference prediction error:", err);
    }
  },

  renderInferenceResults(res) {
    const probEl = document.getElementById("ml-result-prob");
    if (probEl) probEl.textContent = `${(res.inundationProbability * 100).toFixed(1)}%`;

    const progBar = document.getElementById("ml-result-prob-bar");
    if (progBar) {
      const pct = (res.inundationProbability * 100).toFixed(0);
      progBar.style.width = `${pct}%`;
      progBar.style.backgroundColor = res.inundationProbability >= 0.7 ? "var(--accent-red)" : res.inundationProbability >= 0.4 ? "var(--accent-amber)" : "var(--accent-green)";
    }

    const catEl = document.getElementById("ml-result-category");
    if (catEl) {
      catEl.textContent = res.riskCategory;
      catEl.className = `badge badge-${res.riskCategory === 'CRITICAL' ? 'red' : res.riskCategory === 'ELEVATED' ? 'amber' : 'green'}`;
    }

    const confEl = document.getElementById("ml-result-confidence");
    if (confEl) confEl.textContent = `${(res.confidenceScore * 100).toFixed(0)}%`;

    const alertStatusEl = document.getElementById("ml-result-alert-status");
    if (alertStatusEl) {
      alertStatusEl.textContent = res.predictedAlert ? "POSITIVE [1] — INUNDATION THRESHOLD EXCEEDED" : "NEGATIVE [0] — NOMINAL CAPACITY";
      alertStatusEl.style.color = res.predictedAlert ? "var(--accent-red)" : "var(--accent-green)";
    }

    // Breakdown
    const breakdownEl = document.getElementById("ml-feature-contributions");
    if (breakdownEl && res.featureContributions) {
      breakdownEl.innerHTML = Object.entries(res.featureContributions)
        .map(([name, score]) => `
          <div style="display:flex; justify-content:space-between; font-size:11px; padding:4px 0; border-bottom:1px solid var(--border-subtle);">
            <span>${name}</span>
            <span class="font-mono" style="font-weight:700; color:${score >= 0 ? 'var(--accent-red)' : 'var(--accent-green)'}">
              ${score >= 0 ? '+' : ''}${score}
            </span>
          </div>
        `)
        .join("");
    }
  }
};

window.MLRiskAnalytics = MLRiskAnalytics;

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("ml-risk-analytics-view")) {
    MLRiskAnalytics.init();
  }
});
