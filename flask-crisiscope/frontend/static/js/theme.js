/**
 * CRISISCOPE X — Application-Wide Theme Engine
 * Single source of truth for Light / Dark theme management.
 * Persists in localStorage, applies data-theme on document root, updates UI icons & labels,
 * and notifies active charts, maps, and WebGL renderers of theme changes.
 */

const ThemeManager = {
  STORAGE_KEY: "crisiscope_theme",
  listeners: [],

  init() {
    let savedTheme = "dark";
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        savedTheme = stored;
      }
    } catch (e) {
      console.warn("localStorage not accessible for theme persistence", e);
    }

    this.applyTheme(savedTheme, false);

    // Bind all theme toggles on the page
    document.querySelectorAll(".theme-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.toggleTheme());
    });
  },

  getCurrentTheme() {
    return document.documentElement.getAttribute("data-theme") || "dark";
  },

  applyTheme(theme, persist = true) {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }

    if (persist) {
      try {
        localStorage.setItem(this.STORAGE_KEY, theme);
      } catch (e) {
        console.warn("Failed to persist theme to localStorage", e);
      }
    }

    // Update toggle icons & labels across the document
    this.updateToggleElements(theme);

    // Notify registered listeners (Map, Three.js, Chart.js)
    this.listeners.forEach((callback) => {
      try {
        callback(theme);
      } catch (err) {
        console.error("Theme change listener error:", err);
      }
    });
  },

  toggleTheme() {
    const current = this.getCurrentTheme();
    const nextTheme = current === "dark" ? "light" : "dark";
    this.applyTheme(nextTheme, true);
  },

  updateToggleElements(theme) {
    document.querySelectorAll(".theme-toggle-btn").forEach((btn) => {
      const isDark = theme === "dark";
      const iconSpan = btn.querySelector(".theme-icon");
      const textSpan = btn.querySelector(".theme-label");

      if (iconSpan) {
        // Sun for light, Moon for dark
        iconSpan.innerHTML = isDark
          ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
          : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
      }

      if (textSpan) {
        textSpan.textContent = isDark ? "Light Mode" : "Dark Mode";
      }

      btn.setAttribute("title", isDark ? "Switch to Light Theme" : "Switch to Dark Theme");
      btn.setAttribute("aria-label", isDark ? "Switch to Light Theme" : "Switch to Dark Theme");
    });
  },

  onChange(callback) {
    if (typeof callback === "function") {
      this.listeners.push(callback);
    }
  }
};

window.ThemeManager = ThemeManager;

// Self-initialize early to prevent flash of wrong theme
document.addEventListener("DOMContentLoaded", () => {
  ThemeManager.init();
});
