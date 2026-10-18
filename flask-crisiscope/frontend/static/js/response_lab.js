/**
 * CRISISCOPE X — Response Lab Decision-Support Engine
 */

const ResponseLab = {
  async init() {
    await this.loadRecommendations();

    if (window.EmergencyController) {
      window.EmergencyController.onStateChange(() => {
        this.loadRecommendations();
      });
    }
  },

  async loadRecommendations() {
    const container = document.getElementById("response-options-list");
    if (!container) return;

    try {
      const data = await API.getRecommendations();
      this.renderOptions(container, data.options || []);
    } catch (err) {
      console.error("Failed to load recommendations:", err);
      container.innerHTML = `<div class="card" style="color:var(--accent-red);">Failed to load response strategies.</div>`;
    }
  },

  renderOptions(container, options) {
    if (options.length === 0) {
      container.innerHTML = `<div class="card" style="padding:20px; text-align:center; color:var(--text-muted);">No urgent countermeasures required for current nominal scenario.</div>`;
      return;
    }

    container.innerHTML = options
      .map((opt) => {
        const isImmediate = opt.priority === "IMMEDIATE";
        const priorityColor = isImmediate ? "red" : opt.priority === "HIGH" ? "amber" : "cyan";

        return `
        <div class="action-card ${opt.priority.toLowerCase()}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
            <div>
              <div style="font-size:14px; font-weight:800; color:var(--text-heading); margin-bottom:4px;">
                ${opt.title}
              </div>
              <div style="display:flex; gap:8px; align-items:center;">
                <span class="badge badge-${priorityColor}">PRIORITY: ${opt.priority}</span>
                <span class="badge badge-cyan">${opt.category}</span>
                <span class="font-mono text-muted" style="font-size:11px;">${opt.id}</span>
              </div>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="alert('Guidance logged to operational dispatch journal.')">
              Authorize Guidance
            </button>
          </div>

          <div style="font-size:13px; color:var(--text-primary); line-height:1.4; background:var(--bg-secondary); padding:10px 14px; border-radius:6px; border:1px solid var(--border-color);">
            <strong>Proposed Operational Action:</strong><br>${opt.proposedAction}
          </div>

          <!-- Supporting Evidence & Rationale -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:12px; font-size:11px;">
            <div>
              <div style="font-weight:700; color:var(--accent-cyan); text-transform:uppercase; margin-bottom:4px;">Supporting Evidence</div>
              <ul style="padding-left:16px; color:var(--text-secondary); display:flex; flex-direction:column; gap:2px;">
                ${opt.supportingEvidence.map((e) => `<li>${e}</li>`).join("")}
              </ul>
            </div>

            <div>
              <div style="font-weight:700; color:var(--accent-amber); text-transform:uppercase; margin-bottom:4px;">Critical Assumptions</div>
              <ul style="padding-left:16px; color:var(--text-secondary); display:flex; flex-direction:column; gap:2px;">
                ${opt.assumptions.map((a) => `<li>${a}</li>`).join("")}
              </ul>
            </div>
          </div>

          <!-- Expected Effect & Operational Limitations -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:12px; font-size:11px; padding-top:8px; border-top:1px solid var(--border-subtle);">
            <div>
              <div style="font-weight:700; color:var(--accent-green); text-transform:uppercase; margin-bottom:2px;">Expected Qualitative Effect</div>
              <div style="color:var(--text-secondary);">${opt.expectedQualitativeEffect}</div>
            </div>

            <div>
              <div style="font-weight:700; color:var(--accent-red); text-transform:uppercase; margin-bottom:2px;">Operational Limitations</div>
              <div style="color:var(--text-secondary);">${opt.operationalLimitations.join(", ")}</div>
            </div>
          </div>

          <div style="font-size:10px; color:var(--text-muted); font-style:italic;">
            Decision-support analysis synthesized at: ${new Date(opt.suggestedAt).toLocaleString()} &bull; Not civil defense orders.
          </div>
        </div>
      `;
      })
      .join("");
  }
};

window.ResponseLab = ResponseLab;

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("response-options-list")) {
    ResponseLab.init();
  }
});
