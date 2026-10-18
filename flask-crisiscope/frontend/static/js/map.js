/**
 * CRISISCOPE X — Interactive Geospatial Map Engine
 * Vanilla Leaflet.js implementation for Bengaluru Urban Flood Intelligence.
 */

const CrisisMap = {
  map: null,
  stationsLayer: null,
  facilitiesLayer: null,
  roadsLayer: null,
  catchmentLayer: null,
  tileLayer: null,

  BENGALURU_CENTER: [12.9716, 77.5946],
  DEFAULT_ZOOM: 12,

  init(containerId = "crisiscope-map") {
    const el = document.getElementById(containerId);
    if (!el || typeof L === "undefined") {
      console.warn("Map container or Leaflet library not found.");
      return;
    }

    // Clean any prior instance
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map(containerId, {
      center: this.BENGALURU_CENTER,
      zoom: this.DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: false
    });

    // Basemap: Standard OSM tiles styled via theme.css filter
    this.tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18
    }).addTo(this.map);

    // Feature group layers
    this.catchmentLayer = L.layerGroup().addTo(this.map);
    this.roadsLayer = L.layerGroup().addTo(this.map);
    this.stationsLayer = L.layerGroup().addTo(this.map);
    this.facilitiesLayer = L.layerGroup().addTo(this.map);

    // Render static and telemetric entities
    this.renderCatchments();
    this.loadDataAndRender();

    // Listen to emergency controller changes
    if (window.EmergencyController) {
      window.EmergencyController.onStateChange((scenario, results) => {
        this.updateDisruptions(scenario, results);
      });
    }

    // Invalidate map size after layout settles
    setTimeout(() => {
      this.map.invalidateSize();
    }, 250);
  },

  renderCatchments() {
    this.catchmentLayer.clearLayers();

    const basins = [
      {
        name: "Bellandur Basin",
        color: "#06b6d4",
        coords: [
          [12.965, 77.630],
          [12.970, 77.695],
          [12.915, 77.710],
          [12.905, 77.650],
          [12.930, 77.620]
        ]
      },
      {
        name: "Hebbal Valley",
        color: "#3b82f6",
        coords: [
          [13.060, 77.560],
          [13.065, 77.630],
          [13.010, 77.640],
          [13.000, 77.580]
        ]
      },
      {
        name: "Koramangala Storm Corridor",
        color: "#f59e0b",
        coords: [
          [12.950, 77.605],
          [12.955, 77.645],
          [12.915, 77.640],
          [12.910, 77.610]
        ]
      }
    ];

    basins.forEach((b) => {
      L.polygon(b.coords, {
        color: b.color,
        fillColor: b.color,
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: "4, 4"
      })
        .bindPopup(`<strong>${b.name}</strong><br><span style="font-size:11px;color:#64748b;">Synthetic Catchment Drainage Basin</span>`)
        .addTo(this.catchmentLayer);
    });
  },

  async loadDataAndRender() {
    try {
      const [stations, facilities, roads] = await Promise.all([
        API.getStations(),
        API.getFacilities(),
        API.getRoads()
      ]);

      this.renderStations(stations);
      this.renderFacilities(facilities);
      this.renderRoads(roads);
    } catch (err) {
      console.error("Error loading map data:", err);
    }
  },

  renderStations(stations) {
    this.stationsLayer.clearLayers();

    stations.forEach((stn) => {
      const marker = L.circleMarker([stn.latitude, stn.longitude], {
        radius: 7,
        fillColor: "#06b6d4",
        color: "#ffffff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      });

      marker.bindPopup(`
        <div style="font-family:sans-serif;">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px;color:var(--text-heading);">${stn.name}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">ID: ${stn.stationId} &bull; ${stn.status}</div>
          <div style="display:flex;gap:10px;font-family:monospace;font-size:12px;">
            <div>Intensity: <strong>${stn.intensityMmPerHour} mm/hr</strong></div>
            <div>Accum: <strong>${stn.accumulatedRainfallMm} mm</strong></div>
          </div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:4px;">${stn.provenance}</div>
        </div>
      `);

      marker.addTo(this.stationsLayer);
    });
  },

  renderFacilities(facilities) {
    this.facilitiesLayer.clearLayers();

    facilities.forEach((fac) => {
      let color = "#3b82f6";
      let iconSymbol = "🏥";

      if (fac.type === "HOSPITAL") {
        color = fac.backupPowerStatus === "AT_RISK" ? "#ef4444" : "#10b981";
        iconSymbol = "🏥";
      } else if (fac.type === "RELIEF_SHELTER") {
        color = "#8b5cf6";
        iconSymbol = "⛺";
      } else if (fac.type === "POWER_SUBSTATION") {
        color = "#f59e0b";
        iconSymbol = "⚡";
      } else if (fac.type === "EMERGENCY_OPS") {
        color = "#06b6d4";
        iconSymbol = "🛡️";
      }

      const icon = L.divIcon({
        className: "custom-map-icon",
        html: `<div style="background-color:${color};width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 6px rgba(0,0,0,0.5);border:2px solid #ffffff;font-size:12px;">${iconSymbol}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([fac.latitude, fac.longitude], { icon });

      marker.bindPopup(`
        <div style="font-family:sans-serif;min-width:200px;">
          <div style="font-weight:700;font-size:13px;margin-bottom:2px;">${fac.name}</div>
          <div style="font-size:11px;font-weight:600;color:${color};margin-bottom:6px;">${fac.type} &bull; Generator: +${fac.generatorElevationM}m</div>
          <div style="font-size:11px;color:var(--text-secondary);margin-bottom:6px;">${fac.notes || ""}</div>
          <div style="font-family:monospace;font-size:11px;background:var(--bg-secondary);padding:4px 6px;border-radius:4px;">
            Capacity: ${fac.capacity} &bull; Access Node: ${fac.accessNodeId}
          </div>
        </div>
      `);

      marker.addTo(this.facilitiesLayer);
    });
  },

  renderRoads(roads) {
    this.roadsLayer.clearLayers();

    roads.forEach((road) => {
      const isDisrupted = Boolean(road.isDisrupted);
      const color = isDisrupted ? "#ef4444" : "#10b981";

      const polyline = L.polyline(road.coordinates, {
        color: color,
        weight: isDisrupted ? 5 : 3.5,
        dashArray: isDisrupted ? "6, 6" : null,
        opacity: 0.85
      });

      polyline.bindPopup(`
        <div style="font-family:sans-serif;">
          <div style="font-weight:700;font-size:13px;margin-bottom:2px;">${road.name}</div>
          <div style="font-size:11px;font-weight:600;color:${color};margin-bottom:6px;">
            ${isDisrupted ? "⚠️ DISRUPTED / IMPASSABLE" : "✓ OPEN CORRIDOR"}
          </div>
          <div style="font-family:monospace;font-size:11px;color:var(--text-secondary);">
            Length: ${road.lengthMeters}m &bull; Vuln: ${(road.vulnerabilityIndex * 100).toFixed(0)}%
          </div>
          ${road.disruptionReason ? `<div style="font-size:11px;color:#ef4444;margin-top:4px;">${road.disruptionReason}</div>` : ""}
        </div>
      `);

      polyline.addTo(this.roadsLayer);
    });
  },

  async updateDisruptions(scenario, results) {
    if (!this.roadsLayer) return;
    try {
      const roads = await API.getRoads();
      const activeDisruptions = new Set(scenario ? scenario.declaredDisruptions : []);

      const updated = roads.map((r) => ({
        ...r,
        isDisrupted: activeDisruptions.has(r.id),
        disruptionReason: activeDisruptions.has(r.id) ? "Active Scenario Declared Obstruction" : null
      }));

      this.renderRoads(updated);
    } catch (e) {
      console.error("Failed to update road disruptions on map:", e);
    }
  }
};

window.CrisisMap = CrisisMap;

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("crisiscope-map")) {
    CrisisMap.init();
  }
});
