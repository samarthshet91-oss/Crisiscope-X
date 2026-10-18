/**
 * CRISISCOPE X — Alerts & Incident Feed Engine
 */

const AlertsView = {
  async init() {
    const container = document.getElementById("alerts-feed-list");
    if (!container) return;

    this.renderLoading(container);

    try {
      const data = await API.getAlerts();
      this.renderAlerts(container, data.alerts || []);
      this.updateCounters(data);
    } catch (err) {
      console.error("Failed to load alerts:", err);
      container.innerHTML = `<div class="card" style="color:var(--accent-red);">Failed to fetch active alerts from server.</div>`;
    }

    if (window.EmergencyController) {
      window.EmergencyController.onStateChange(() => {
        this.refreshAlerts();
      });
    }
  },

  renderLoading(container) {
    container.innerHTML = `
      <div style="padding:40px; text-align:center; color:var(--text-muted);">
        <div class="animate-spin" style="display:inline-block; width:24px; height:24px; border:2px solid var(--accent-cyan); border-top-color:transparent; border-radius:50%; margin-bottom:10px;"></div>
        <div>Evaluating hydrological rules and corridor severance...</div>
      </div>
    `;
  },

  renderAlerts(container, alerts) {
    if (alerts.length === 0) {
      container.innerHTML = `<div class="card" style="text-align:center; padding:30px; color:var(--text-muted);">No active emergency alerts recorded. System operational within nominal baseline.</div>`;
      return;
    }

    container.innerHTML = alerts
      .map((alert) => {
        const severityClass = alert.severity.toLowerCase();
        let badgeColor = "cyan";
        if (alert.severity === "CRITICAL") badgeColor = "red";
        else if (alert.severity === "WARNING") badgeColor = "amber";
        else if (alert.severity === "ADVISORY") badgeColor = "blue";

        return `
        <div class="alert-row ${severityClass}">
          <div class="alert-icon-wrap" style="background:var(--accent-${badgeColor}-subtle); color:var(--accent-${badgeColor});">
            ${alert.severity === 'CRITICAL' ? '⚠️' : alert.severity === 'WARNING' ? '⚡' : 'ℹ️'}
          </div>
          <div class="alert-content">
            <div class="alert-title">
              <span>${alert.title}</span>
              <span class="badge badge-${badgeColor}">${alert.severity}</span>
              <span class="badge badge-cyan" style="margin-left:auto;">${alert.category}</span>
            </div>
            <div class="alert-desc">${alert.description}</div>
            <div class="alert-meta">
              <span>Source: <strong>${alert.source}</strong></span>
              <span>&bull;</span>
              <span>Rule: <code class="font-mono">${alert.ruleOrigin || 'RULE_EVAL_PASS'}</code></span>
              <span>&bull;</span>
              <span>Time: ${new Date(alert.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      `;
      })
      .join("");
  },

  updateCounters(data) {
    const totalEl = document.getElementById("alert-count-total");
    if (totalEl) totalEl.textContent = data.activeCount || 0;

    const critEl = document.getElementById("alert-count-critical");
    if (critEl) critEl.textContent = data.criticalCount || 0;

    const warnEl = document.getElementById("alert-count-warning");
    if (warnEl) warnEl.textContent = data.warningCount || 0;
  },

  async refreshAlerts() {
    const container = document.getElementById("alerts-feed-list");
    if (!container) return;
    try {
      const data = await API.getAlerts();
      this.renderAlerts(container, data.alerts || []);
      this.updateCounters(data);
    } catch (e) {
      console.error("Alerts refresh error:", e);
    }
  }
};

window.AlertsView = AlertsView;

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("alerts-feed-list")) {
    AlertsView.init();
  }
});
