/**
 * CRISISCOPE X — Global Application Shell & Diagnostics
 */

const App = {
  init() {
    this.pollSystemDiagnostics();
  },

  async pollSystemDiagnostics() {
    try {
      const [health, db] = await Promise.all([
        API.getHealth(),
        API.getDatabaseStatus()
      ]);

      const dbBadge = document.getElementById("footer-db-status");
      if (dbBadge) {
        dbBadge.textContent = db.connected ? "PostgreSQL: Connected" : "In-Memory Demonstration Engine";
        dbBadge.style.color = db.connected ? "var(--accent-green)" : "var(--accent-amber)";
      }

      const archBadge = document.getElementById("footer-arch-status");
      if (archBadge) {
        archBadge.textContent = `${health.arch} (LinuxONE Ready)`;
      }
    } catch (e) {
      console.warn("Diagnostics check error:", e);
    }
  }
};

window.App = App;

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
