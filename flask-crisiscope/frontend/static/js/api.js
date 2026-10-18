/**
 * CRISISCOPE X — Central API Client
 * Modular, vanilla JavaScript client for all Flask JSON endpoints.
 */

const API = {
  async get(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      console.error(`API GET error on ${url}:`, err);
      throw err;
    }
  },

  async post(url, data) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      console.error(`API POST error on ${url}:`, err);
      throw err;
    }
  },

  async upload(url, formData) {
    try {
      const res = await fetch(url, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      console.error(`API upload error on ${url}:`, err);
      throw err;
    }
  },

  // Scenarios
  getActiveScenario() {
    return this.get("/api/scenarios/active");
  },
  getPresetScenarios() {
    return this.get("/api/scenarios/presets");
  },
  selectScenario(scenarioId) {
    return this.post("/api/scenarios/select", { scenarioId });
  },
  updateScenario(updates) {
    return this.post("/api/scenarios/update", updates);
  },
  runScenario(config) {
    return this.post("/api/scenarios/run", config);
  },

  // Datasets
  getDatasets() {
    return this.get("/api/datasets");
  },
  getStations() {
    return this.get("/api/datasets/stations");
  },
  getFacilities() {
    return this.get("/api/datasets/facilities");
  },
  getRoads() {
    return this.get("/api/datasets/roads");
  },
  uploadDataset(formData) {
    return this.upload("/api/datasets/upload", formData);
  },

  // Graph & Cascade
  getCascadeGraph() {
    return this.get("/api/graph/cascade");
  },

  // Alerts & Recommendations
  getAlerts() {
    return this.get("/api/alerts");
  },
  getRecommendations() {
    return this.get("/api/response/recommendations");
  },

  // Machine Learning
  getMLMetrics() {
    return this.get("/api/ml/metrics");
  },
  predictML(features) {
    return this.post("/api/ml/predict", features);
  },

  // Diagnostics & Database
  getHealth() {
    return this.get("/api/health");
  },
  getDatabaseStatus() {
    return this.get("/api/database/status");
  },
  getArchInfo() {
    return this.get("/api/system/arch-info");
  }
};

window.API = API;
