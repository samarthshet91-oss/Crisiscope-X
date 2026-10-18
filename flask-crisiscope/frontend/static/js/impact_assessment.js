/**
 * CRISISCOPE X — Impact Assessment Engine
 * Synthesizes critical infrastructure vulnerability, generator inundation risks, and isolation factors.
 */

const ImpactAssessment = {
  async init() {
    await this.renderAssessment();

    if (window.EmergencyController) {
      window.EmergencyController.onStateChange(() => {
        this.renderAssessment();
      });
    }
  },

  async renderAssessment() {
    try {
      const [scenarioRes, facilities, roads] = await Promise.all([
        API.getActiveScenario(),
        API.getFacilities(),
        API.getRoads()
      ]);

      const scenario = scenarioRes.scenario;
      const results = scenarioRes.results;
      const isolatedIds = new Set((results.isolatedFacilities || []).map((f) => f.id));

      // 1. Overview counts
      const hospIsolated = (results.isolatedFacilities || []).filter((f) => f.type === "HOSPITAL").length;
      const hospTotal = facilities.filter((f) => f.type === "HOSPITAL").length;

      const hospCountEl = document.getElementById("impact-hospitals-severed");
      if (hospCountEl) hospCountEl.textContent = `${hospIsolated} / ${hospTotal}`;

      const runoffVolumeEl = document.getElementById("impact-runoff-volume");
      if (runoffVolumeEl) runoffVolumeEl.textContent = `${(results.syntheticRunoffVolumeM3 / 1000).toLocaleString()} m³`;

      const satEl = document.getElementById("impact-soil-saturation");
      if (satEl) satEl.textContent = `${results.effectiveSoilSaturationPct}%`;

      // 2. Facilities table
      const tbody = document.getElementById("impact-facilities-tbody");
      if (tbody) {
        tbody.innerHTML = facilities
          .map((fac) => {
            const isIsolated = isolatedIds.has(fac.id);
            const isGenAtRisk = fac.generatorElevationM < 1.0;

            return `
            <tr>
              <td>
                <div style="font-weight:700;">${fac.name}</div>
                <div style="font-size:10px; color:var(--text-muted);">${fac.id} &bull; Node: ${fac.accessNodeId}</div>
              </td>
              <td><span class="badge badge-cyan">${fac.type}</span></td>
              <td class="font-mono">${fac.capacity}</td>
              <td>
                <span class="badge ${isGenAtRisk ? 'badge-red' : 'badge-green'}">
                  +${fac.generatorElevationM}m ${isGenAtRisk ? '⚠️ VULNERABLE' : '✓ SECURE'}
                </span>
              </td>
              <td>
                <span class="badge ${isIsolated ? 'badge-red' : 'badge-green'}">
                  ${isIsolated ? '🔴 SEVERED' : '🟢 REACHABLE'}
                </span>
              </td>
            </tr>
          `;
          })
          .join("");
      }

      // 3. Severed corridors summary
      const corridorList = document.getElementById("impact-corridors-list");
      if (corridorList) {
        const disruptions = scenario.declaredDisruptions || [];
        const disruptedRoads = roads.filter((r) => disruptions.includes(r.id));
        if (disruptedRoads.length === 0) {
          corridorList.innerHTML = `<div style="color:var(--text-muted); font-size:12px;">No active corridor disruptions declared in current scenario.</div>`;
        } else {
          corridorList.innerHTML = disruptedRoads
            .map(
              (r) => `
              <div style="padding:10px 12px; margin-bottom:8px; border-radius:6px; background:var(--bg-secondary); border-left:3px solid var(--accent-red); font-size:12px;">
                <div style="font-weight:700; color:var(--text-heading);">${r.name}</div>
                <div style="color:var(--text-muted); font-size:11px; margin-top:2px;">
                  Length: ${r.lengthMeters}m &bull; Culvert Limit: ${r.culvertCapacityMmPerHr} mm/hr &bull; Vulnerability: ${(r.vulnerabilityIndex * 100).toFixed(0)}%
                </div>
              </div>`
            )
            .join("");
        }
      }
    } catch (err) {
      console.error("Impact assessment rendering failed:", err);
    }
  }
};

window.ImpactAssessment = ImpactAssessment;

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("impact-assessment-view")) {
    ImpactAssessment.init();
  }
});
