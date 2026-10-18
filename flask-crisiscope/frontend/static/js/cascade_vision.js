/**
 * CRISISCOPE X — Cascade Vision 3D Geographical Map Engine
 * Genuine 3D geographical map of Bengaluru using MapLibre GL JS with 3D building extrusions,
 * real road network corridors, geographically anchored dependency arcs, interactive asset inspector,
 * and live integration with the Emergency Situation Controller.
 *
 * Zero React, zero JSX/TSX. Compatible with IBM LinuxONE & standards-compliant browsers.
 */

const CascadeVision = {
  map: null,
  is3DMode: true,
  currentTheme: "dark",
  markers: [],
  selectedFeature: null,

  // Bengaluru Geographical Center
  BENGALURU_CENTER: [77.5946, 12.9716], // [lng, lat]
  DEFAULT_ZOOM: 12.3,
  DEFAULT_PITCH_3D: 58,
  DEFAULT_BEARING_3D: -18,

  // Active Layer Visibility State
  layerVisibility: {
    buildings: true,
    roads: true,
    dependencies: true,
    catchments: true,
    infrastructure: true
  },

  // Active Data State
  graphData: { nodes: [], edges: [] },
  facilities: [],
  roads: [],
  activeScenario: null,
  activeResults: null,

  async init(containerId = "cascade-map-mount") {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn("Cascade map container not found:", containerId);
      return;
    }

    if (typeof maplibregl === "undefined") {
      console.error("MapLibre GL library not loaded. Check vendor/maplibre-gl.js");
      this.showErrorState("Map engine could not be initialized (MapLibre GL JS unavailable).");
      return;
    }

    this.showLoadingState(true);
    this.currentTheme = document.documentElement.getAttribute("data-theme") || "dark";

    try {
      // 1. Fetch data in parallel
      const [scenarioRes, graphRes, facRes, roadsRes] = await Promise.all([
        API.getActiveScenario(),
        API.getCascadeGraph(),
        API.getFacilities(),
        API.getRoads()
      ]);

      this.activeScenario = scenarioRes.scenario;
      this.activeResults = scenarioRes.results;
      this.graphData = graphRes;
      this.facilities = facRes;
      this.roads = roadsRes;

      // 2. Initialize MapLibre GL Map
      this.initMap(containerId);
      this.bindUIControls();

      // 3. Listen for global emergency controller updates
      if (window.EmergencyController) {
        window.EmergencyController.onStateChange((scenario, results) => {
          this.onScenarioUpdated(scenario, results);
        });
      }

      // 4. Listen for application theme changes
      if (window.ThemeManager) {
        window.ThemeManager.onChange((theme) => {
          this.onThemeChanged(theme);
        });
      }
    } catch (err) {
      console.error("Failed to initialize Cascade Vision 3D Map:", err);
      this.showErrorState("Failed to load scenario and geospatial datasets from backend.");
    }
  },

  getMapStyle(theme) {
    const isDark = theme !== "light";
    const tileUrl = isDark
      ? "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
      : "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png";

    return {
      version: 8,
      sources: {
        "carto-tiles": {
          type: "raster",
          tiles: [tileUrl],
          tileSize: 256,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }
      },
      layers: [
        {
          id: "carto-base-layer",
          type: "raster",
          source: "carto-tiles",
          minzoom: 0,
          maxzoom: 20
        }
      ]
    };
  },

  initMap(containerId) {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    this.map = new maplibregl.Map({
      container: containerId,
      style: this.getMapStyle(this.currentTheme),
      center: this.BENGALURU_CENTER,
      zoom: this.DEFAULT_ZOOM,
      pitch: this.is3DMode ? this.DEFAULT_PITCH_3D : 0,
      bearing: this.is3DMode ? this.DEFAULT_BEARING_3D : 0,
      maxPitch: 85,
      antialias: true
    });

    // Add navigation controls (zoom, compass with pitch)
    this.map.addControl(
      new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true
      }),
      "bottom-right"
    );

    this.map.on("load", () => {
      this.showLoadingState(false);
      this.buildGeoLayers();
      this.renderInfrastructureMarkers();
      this.updateCascadeSummary();
      this.map.resize();
    });

    this.map.on("error", (e) => {
      console.warn("MapLibre tile/render warning:", e);
    });
  },

  buildGeoLayers() {
    if (!this.map || !this.map.isStyleLoaded()) return;

    // 1. Catchment Basins GeoJSON
    this.addCatchmentLayer();

    // 2. Physical Road Network GeoJSON
    this.addRoadsLayer();

    // 3. 3D Building Extrusions (Bengaluru Urban Centers)
    this.add3DBuildingsLayer();

    // 4. Geographically Anchored Dependency Graph Arcs
    this.addDependencyArcsLayer();
  },

  addCatchmentLayer() {
    const catchmentGeoJSON = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            name: "Bellandur Basin Surcharge Zone",
            area: "38 km²",
            risk: "HIGH",
            provenance: "Hypothetical Scenario Surcharge Model"
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [77.630, 12.965],
                [77.695, 12.970],
                [77.710, 12.915],
                [77.650, 12.905],
                [77.620, 12.930],
                [77.630, 12.965]
              ]
            ]
          }
        },
        {
          type: "Feature",
          properties: {
            name: "Hebbal Valley Drainage Corridor",
            area: "29 km²",
            risk: "ELEVATED",
            provenance: "Hypothetical Scenario Surcharge Model"
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [77.560, 13.060],
                [77.630, 13.065],
                [77.640, 13.010],
                [77.580, 13.000],
                [77.560, 13.060]
              ]
            ]
          }
        },
        {
          type: "Feature",
          properties: {
            name: "Koramangala Storm Basin",
            area: "18 km²",
            risk: "CRITICAL",
            provenance: "Hypothetical Scenario Surcharge Model"
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [77.605, 12.950],
                [77.645, 12.955],
                [77.640, 12.915],
                [77.610, 12.910],
                [77.605, 12.950]
              ]
            ]
          }
        }
      ]
    };

    if (this.map.getSource("catchments-src")) {
      this.map.getSource("catchments-src").setData(catchmentGeoJSON);
    } else {
      this.map.addSource("catchments-src", {
        type: "geojson",
        data: catchmentGeoJSON
      });

      this.map.addLayer({
        id: "catchments-fill",
        type: "fill",
        source: "catchments-src",
        paint: {
          "fill-color": [
            "match",
            ["get", "risk"],
            "CRITICAL", "#ef4444",
            "HIGH", "#f59e0b",
            "#06b6d4"
          ],
          "fill-opacity": 0.14
        }
      });

      this.map.addLayer({
        id: "catchments-outline",
        type: "line",
        source: "catchments-src",
        paint: {
          "line-color": [
            "match",
            ["get", "risk"],
            "CRITICAL", "#ef4444",
            "HIGH", "#f59e0b",
            "#06b6d4"
          ],
          "line-width": 1.75,
          "line-dasharray": [3, 2]
        }
      });

      this.map.on("click", "catchments-fill", (e) => {
        if (!e.features || !e.features[0]) return;
        const p = e.features[0].properties;
        new maplibregl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(
            `<div style="font-size:12px;">
              <strong style="color:var(--text-heading);">${p.name}</strong><br>
              <span class="badge badge-amber" style="margin:4px 0;">Risk: ${p.risk}</span><br>
              Catchment Area: ${p.area}<br>
              <span style="font-size:10px; color:var(--text-muted);">${p.provenance}</span>
            </div>`
          )
          .addTo(this.map);
      });
    }
  },

  addRoadsLayer() {
    const disruptions = new Set(this.activeScenario ? this.activeScenario.declaredDisruptions : []);
    const roadFeatures = this.roads.map((road) => {
      const isDisrupted = disruptions.has(road.id) || Boolean(road.isDisrupted);
      // MapLibre requires [lng, lat] coordinate order
      const lngLatCoords = road.coordinates.map((c) => [c[1], c[0]]);

      return {
        type: "Feature",
        id: road.id,
        properties: {
          id: road.id,
          name: road.name,
          lengthMeters: road.lengthMeters,
          culvertCapacityMmPerHr: road.culvertCapacityMmPerHr,
          vulnerabilityIndex: road.vulnerabilityIndex,
          isDisrupted: isDisrupted,
          disruptionReason: isDisrupted ? "Scenario Declared Arterial Obstruction" : "Intact Highway Corridor"
        },
        geometry: {
          type: "LineString",
          coordinates: lngLatCoords
        }
      };
    });

    const roadsGeoJSON = { type: "FeatureCollection", features: roadFeatures };

    if (this.map.getSource("roads-src")) {
      this.map.getSource("roads-src").setData(roadsGeoJSON);
    } else {
      this.map.addSource("roads-src", {
        type: "geojson",
        data: roadsGeoJSON
      });

      this.map.addLayer({
        id: "roads-glow",
        type: "line",
        source: "roads-src",
        paint: {
          "line-color": ["case", ["get", "isDisrupted"], "#ef4444", "#10b981"],
          "line-width": ["case", ["get", "isDisrupted"], 8, 5],
          "line-opacity": 0.35,
          "line-blur": 3
        }
      });

      this.map.addLayer({
        id: "roads-core",
        type: "line",
        source: "roads-src",
        paint: {
          "line-color": ["case", ["get", "isDisrupted"], "#ef4444", "#10b981"],
          "line-width": ["case", ["get", "isDisrupted"], 4.5, 3],
          "line-dasharray": ["case", ["get", "isDisrupted"], ["literal", [3, 2]], ["literal", [1, 0]]]
        }
      });

      this.map.on("click", "roads-core", (e) => {
        if (!e.features || !e.features[0]) return;
        const p = e.features[0].properties;
        this.inspectRoad(p);
      });
    }
  },

  add3DBuildingsLayer() {
    // Verified prominent urban complexes and tech centers in Bengaluru with 3D heights
    const buildingFeatures = [
      // 1. UB City & Commercial District (MG Road)
      { name: "UB City Concorde & Canberra Towers", lng: 77.5960, lat: 12.9718, w: 0.0016, h: 0.0014, height: 125, base: 0 },
      { name: "MG Road Metro Boulevard Central", lng: 77.6080, lat: 12.9754, w: 0.0015, h: 0.0012, height: 60, base: 0 },
      { name: "Public Utility Building (MG Road)", lng: 77.6065, lat: 12.9740, w: 0.0010, h: 0.0010, height: 106, base: 0 },

      // 2. State Executive Seat (Vidhana Soudha & High Court)
      { name: "Vidhana Soudha State Legislature", lng: 77.5906, lat: 12.9797, w: 0.0022, h: 0.0018, height: 45, base: 0 },
      { name: "Karnataka High Court (Attara Kacheri)", lng: 77.5930, lat: 12.9785, w: 0.0018, h: 0.0012, height: 28, base: 0 },

      // 3. Central Transit Gateway (Majestic)
      { name: "Majestic City Railway Transit Terminal", lng: 77.5708, lat: 12.9774, w: 0.0025, h: 0.0020, height: 32, base: 0 },
      { name: "Victoria Hospital Trauma & Specialty Blocks", lng: 77.5746, lat: 12.9644, w: 0.0020, h: 0.0018, height: 26, base: 0 },
      { name: "Kanteerava Indoor Stadium Complex", lng: 77.5926, lat: 12.9698, w: 0.0018, h: 0.0016, height: 30, base: 0 },

      // 4. Manipal Hospital Corridor (HAL Old Airport Rd)
      { name: "Manipal Emergency Trauma Complex", lng: 77.6492, lat: 12.9582, w: 0.0018, h: 0.0015, height: 38, base: 0 },
      { name: "HAL Aerospace Administrative Blocks", lng: 77.6650, lat: 12.9560, w: 0.0022, h: 0.0016, height: 24, base: 0 },

      // 5. Koramangala & St. John's Medical Hub
      { name: "St. John's Super-Specialty Medical Campus", lng: 77.6205, lat: 12.9312, w: 0.0022, h: 0.0020, height: 32, base: 0 },
      { name: "Koramangala Indoor Arena", lng: 77.6208, lat: 12.9344, w: 0.0016, h: 0.0014, height: 25, base: 0 },
      { name: "BESCOM Master Substation Control Center", lng: 77.6310, lat: 12.9385, w: 0.0015, h: 0.0014, height: 20, base: 0 },
      { name: "Forum Mall & Commercial Center", lng: 77.6110, lat: 12.9348, w: 0.0018, h: 0.0014, height: 42, base: 0 },

      // 6. Outer Ring Road & Bellandur Tech Valley
      { name: "Bellandur Ecospace Business Park Towers", lng: 77.6830, lat: 12.9265, w: 0.0030, h: 0.0024, height: 50, base: 0 },
      { name: "Sakra World Healthcare Complex", lng: 77.6835, lat: 12.9268, w: 0.0016, h: 0.0014, height: 34, base: 0 },
      { name: "Cessna Business Park Tech Enclave", lng: 77.6920, lat: 12.9360, w: 0.0025, h: 0.0020, height: 48, base: 0 },
      { name: "Prestige Tech Park ORR", lng: 77.6970, lat: 12.9430, w: 0.0022, h: 0.0018, height: 44, base: 0 },

      // 7. Silk Board & Electronic City Gateway
      { name: "Silk Board Underpass Flyover Pylons", lng: 77.6238, lat: 12.9176, w: 0.0016, h: 0.0014, height: 26, base: 0 },
      { name: "Electronic City Flyover Tollway Towers", lng: 77.6602, lat: 12.8452, w: 0.0024, h: 0.0020, height: 45, base: 0 },

      // 8. Hebbal & North Gateway
      { name: "Hebbal Elevated Expressway Interchange", lng: 77.5970, lat: 13.0358, w: 0.0025, h: 0.0020, height: 35, base: 0 },
      { name: "Manyata Embassy Business Park", lng: 77.6200, lat: 13.0450, w: 0.0035, h: 0.0028, height: 55, base: 0 }
    ];

    const features = buildingFeatures.map((b, idx) => {
      const halfW = b.w / 2;
      const halfH = b.h / 2;
      return {
        type: "Feature",
        id: idx + 1,
        properties: {
          name: b.name,
          height: b.height,
          base_height: b.base
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [b.lng - halfW, b.lat - halfH],
              [b.lng + halfW, b.lat - halfH],
              [b.lng + halfW, b.lat + halfH],
              [b.lng - halfW, b.lat + halfH],
              [b.lng - halfW, b.lat - halfH]
            ]
          ]
        }
      };
    });

    const buildingsGeoJSON = { type: "FeatureCollection", features };

    if (this.map.getSource("buildings-3d-src")) {
      this.map.getSource("buildings-3d-src").setData(buildingsGeoJSON);
    } else {
      this.map.addSource("buildings-3d-src", {
        type: "geojson",
        data: buildingsGeoJSON
      });

      this.map.addLayer({
        id: "buildings-3d-extrusion",
        type: "fill-extrusion",
        source: "buildings-3d-src",
        paint: {
          "fill-extrusion-color": [
            "interpolate",
            ["linear"],
            ["get", "height"],
            20, "#1e3a5f",
            60, "#0284c7",
            120, "#06b6d4"
          ],
          "fill-extrusion-height": ["get", "height"],
          "fill-extrusion-base": ["get", "base_height"],
          "fill-extrusion-opacity": 0.85
        }
      });

      this.map.on("click", "buildings-3d-extrusion", (e) => {
        if (!e.features || !e.features[0]) return;
        const p = e.features[0].properties;
        new maplibregl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(
            `<div style="font-size:12px;">
              <strong style="color:var(--text-heading);">${p.name}</strong><br>
              Extruded Height: <strong>${p.height}m</strong><br>
              <span class="badge badge-cyan" style="font-size:10px; margin-top:4px;">3D Urban Structure</span>
            </div>`
          )
          .addTo(this.map);
      });
    }
  },

  addDependencyArcsLayer() {
    // Build elevated curved geodesic arcs between explicit graph nodes
    const nodeMap = {};
    (this.graphData.nodes || []).forEach((n) => {
      nodeMap[n.id] = [n.longitude, n.latitude];
    });

    const edgeFeatures = [];

    (this.graphData.edges || []).forEach((edge) => {
      const p1 = nodeMap[edge.fromNodeId];
      const p2 = nodeMap[edge.toNodeId];
      if (!p1 || !p2) return;

      // Interpolate 24 geodesic points with an elevated arc displacement
      const arcCoords = this.computeArcPoints(p1, p2, 24);

      edgeFeatures.push({
        type: "Feature",
        id: edge.id,
        properties: {
          id: edge.id,
          fromNodeId: edge.fromNodeId,
          toNodeId: edge.toNodeId,
          dependencyType: edge.dependencyType,
          weight: edge.weight,
          criticality: edge.criticality,
          isSevered: Boolean(edge.isSevered),
          explanation: edge.isSevered
            ? `Topological corridor severed due to declared arterial blockage between ${edge.fromNodeId} and ${edge.toNodeId}.`
            : `Intact critical dependency link supporting ${edge.dependencyType.replace(/_/g, " ")}.`
        },
        geometry: {
          type: "LineString",
          coordinates: arcCoords
        }
      });
    });

    const edgesGeoJSON = { type: "FeatureCollection", features: edgeFeatures };

    if (this.map.getSource("dependency-arcs-src")) {
      this.map.getSource("dependency-arcs-src").setData(edgesGeoJSON);
    } else {
      this.map.addSource("dependency-arcs-src", {
        type: "geojson",
        data: edgesGeoJSON
      });

      this.map.addLayer({
        id: "dependency-arcs-glow",
        type: "line",
        source: "dependency-arcs-src",
        paint: {
          "line-color": ["case", ["get", "isSevered"], "#ef4444", "#06b6d4"],
          "line-width": ["case", ["get", "isSevered"], 6, 4],
          "line-opacity": 0.45,
          "line-blur": 2
        }
      });

      this.map.addLayer({
        id: "dependency-arcs-core",
        type: "line",
        source: "dependency-arcs-src",
        paint: {
          "line-color": ["case", ["get", "isSevered"], "#ef4444", "#38bdf8"],
          "line-width": ["case", ["get", "isSevered"], 3.5, 2.5]
        }
      });

      this.map.on("click", "dependency-arcs-core", (e) => {
        if (!e.features || !e.features[0]) return;
        const p = e.features[0].properties;
        this.inspectDependencyLink(p);
      });
    }
  },

  computeArcPoints(p1, p2, numPoints = 24) {
    const coords = [];
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Lateral curve offset perpendicular to line
    const perpX = -dy / dist;
    const perpY = dx / dist;
    const curveAmp = Math.min(dist * 0.15, 0.008);

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      // Parabolic curve: 4 * t * (1 - t) peaks at 1 in the middle
      const heightOffset = 4 * t * (1 - t) * curveAmp;

      const lng = p1[0] + dx * t + perpX * heightOffset;
      const lat = p1[1] + dy * t + perpY * heightOffset;
      coords.push([lng, lat]);
    }
    return coords;
  },

  renderInfrastructureMarkers() {
    // Clear any prior markers
    this.markers.forEach((m) => m.remove());
    this.markers = [];

    const isolatedIds = new Set((this.activeResults?.isolatedFacilities || []).map((f) => f.id));

    // 1. Critical Facilities Markers
    this.facilities.forEach((fac) => {
      const isIsolated = isolatedIds.has(fac.id);
      let symbol = "🏥";
      let bgCol = "#10b981";

      if (fac.type === "HOSPITAL") {
        symbol = "🏥";
        bgCol = isIsolated ? "#ef4444" : "#0284c7";
      } else if (fac.type === "RELIEF_SHELTER") {
        symbol = "⛺";
        bgCol = "#8b5cf6";
      } else if (fac.type === "POWER_SUBSTATION") {
        symbol = "⚡";
        bgCol = fac.generatorElevationM < 1.0 ? "#ef4444" : "#f59e0b";
      } else if (fac.type === "EMERGENCY_OPS") {
        symbol = "🛡️";
        bgCol = "#06b6d4";
      }

      const el = document.createElement("div");
      el.className = "geo-marker";
      el.innerHTML = `
        <div class="geo-marker-pin" style="background-color:${bgCol}; color:${bgCol};">
          ${isIsolated ? '<div class="geo-marker-pulse"></div>' : ""}
          <span style="z-index:2;">${symbol}</span>
        </div>
      `;

      el.addEventListener("click", () => {
        this.inspectFacility(fac, isIsolated);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([fac.longitude, fac.latitude])
        .addTo(this.map);

      this.markers.push(marker);
    });

    // 2. Graph Nodes Markers (Intersection gateways)
    (this.graphData.nodes || []).forEach((node) => {
      // Avoid duplicate marker if facility already exists at coordinate
      const el = document.createElement("div");
      el.className = "geo-marker";
      const isIso = Boolean(node.isIsolated);
      const isBridge = node.type === "BRIDGE_CROSSING";
      const col = isIso ? "#ef4444" : isBridge ? "#f59e0b" : "#06b6d4";

      el.innerHTML = `
        <div class="geo-marker-pin" style="width:20px; height:20px; background-color:${col}; color:${col}; font-size:10px;">
          ${isIso ? '<div class="geo-marker-pulse"></div>' : ""}
          <span>${isBridge ? "🌉" : "📍"}</span>
        </div>
      `;

      el.addEventListener("click", () => {
        this.inspectGraphNode(node);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([node.longitude, node.latitude])
        .addTo(this.map);

      this.markers.push(marker);
    });
  },

  inspectFacility(fac, isIsolated) {
    this.selectedFeature = fac;
    const panel = document.getElementById("cascade-inspector");
    if (!panel) return;

    panel.classList.add("active");
    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
        <div>
          <span class="badge badge-cyan" style="margin-bottom:4px;">${fac.type}</span>
          <h3 style="font-size:15px; font-weight:800; color:var(--text-heading); margin:0;">${fac.name}</h3>
        </div>
        <button id="btn-close-inspector" class="btn btn-sm btn-secondary" style="padding:2px 8px;">&times;</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px; font-size:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span>Reachability Status:</span>
          <span class="badge ${isIsolated ? 'badge-red' : 'badge-green'}">
            ${isIsolated ? '🔴 ISOLATED (NO INTACT ROUTE)' : '🟢 ACCESSIBLE'}
          </span>
        </div>

        <div style="display:flex; justify-content:space-between;">
          <span>Geographical Coordinates:</span>
          <span class="font-mono text-muted">${fac.latitude.toFixed(4)}°N, ${fac.longitude.toFixed(4)}°E</span>
        </div>

        <div style="display:flex; justify-content:space-between;">
          <span>Capacity & Utilization:</span>
          <span class="font-mono"><strong>${fac.capacity}</strong> beds (${fac.currentUtilizationPct}%)</span>
        </div>

        <div style="display:flex; justify-content:space-between;">
          <span>Generator Elevation:</span>
          <span class="badge ${fac.generatorElevationM < 1.0 ? 'badge-red' : 'badge-green'}">
            +${fac.generatorElevationM}m ${fac.generatorElevationM < 1.0 ? '⚠️ FLOOD THREAT' : '✓ SECURE'}
          </span>
        </div>

        <div style="display:flex; justify-content:space-between;">
          <span>Access Node ID:</span>
          <code class="font-mono">${fac.accessNodeId}</code>
        </div>

        <div style="background:var(--bg-secondary); padding:10px; border-radius:6px; margin-top:6px; font-size:11px; line-height:1.4; border-left:3px solid var(--accent-cyan);">
          <strong>Operational Assessment:</strong><br>
          ${fac.notes || "Critical municipal infrastructure node in active topological network."}
        </div>

        ${isIsolated
          ? `<div style="background:var(--accent-red-subtle); border:1px solid var(--accent-red); padding:10px; border-radius:6px; font-size:11px; color:#ef4444; margin-top:4px;">
              <strong>Cascade Impact Reason:</strong> All arterial ingress routes from dispatch headquarters (Majestic / Hebbal) are disrupted in the active scenario.
            </div>`
          : ""
        }

        <div style="font-size:10px; color:var(--text-muted); margin-top:8px;">
          Data Provenance: <code class="font-mono">${fac.provenance || 'SYNTHETIC_DEMO_FIXTURE_V1'}</code>
        </div>
      </div>
    `;

    document.getElementById("btn-close-inspector")?.addEventListener("click", () => {
      panel.classList.remove("active");
    });

    // Center smoothly on asset
    this.map.easeTo({
      center: [fac.longitude, fac.latitude],
      duration: 600,
      zoom: Math.max(this.map.getZoom(), 13.5)
    });
  },

  inspectRoad(road) {
    const panel = document.getElementById("cascade-inspector");
    if (!panel) return;

    panel.classList.add("active");
    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
        <div>
          <span class="badge ${road.isDisrupted ? 'badge-red' : 'badge-green'}" style="margin-bottom:4px;">
            ${road.isDisrupted ? 'DISRUPTED ARTERIAL' : 'OPEN ROAD'}
          </span>
          <h3 style="font-size:15px; font-weight:800; color:var(--text-heading); margin:0;">${road.name}</h3>
        </div>
        <button id="btn-close-inspector" class="btn btn-sm btn-secondary" style="padding:2px 8px;">&times;</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px; font-size:12px;">
        <div style="display:flex; justify-content:space-between;">
          <span>Length:</span>
          <span class="font-mono">${road.lengthMeters} meters</span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span>Culvert Discharge Limit:</span>
          <span class="font-mono">${road.culvertCapacityMmPerHr} mm/hr</span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span>Vulnerability Index:</span>
          <span class="font-mono"><strong>${(road.vulnerabilityIndex * 100).toFixed(0)}%</strong></span>
        </div>
        <div style="background:var(--bg-secondary); padding:10px; border-radius:6px; font-size:11px; margin-top:6px;">
          <strong>Operational Status:</strong><br>
          ${road.disruptionReason}
        </div>
      </div>
    `;

    document.getElementById("btn-close-inspector")?.addEventListener("click", () => {
      panel.classList.remove("active");
    });
  },

  inspectDependencyLink(edge) {
    const panel = document.getElementById("cascade-inspector");
    if (!panel) return;

    panel.classList.add("active");
    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
        <div>
          <span class="badge ${edge.isSevered ? 'badge-red' : 'badge-green'}" style="margin-bottom:4px;">
            ${edge.isSevered ? 'SEVERED DEPENDENCY EDGE' : 'INTACT DEPENDENCY LINK'}
          </span>
          <h3 style="font-size:14px; font-weight:800; color:var(--text-heading); margin:0;">${edge.id}</h3>
        </div>
        <button id="btn-close-inspector" class="btn btn-sm btn-secondary" style="padding:2px 8px;">&times;</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px; font-size:12px;">
        <div style="display:flex; justify-content:space-between;">
          <span>From Gateway:</span>
          <code class="font-mono">${edge.fromNodeId}</code>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span>To Gateway:</span>
          <code class="font-mono">${edge.toNodeId}</code>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span>Dependency Category:</span>
          <span class="badge badge-cyan">${edge.dependencyType}</span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span>Criticality:</span>
          <span class="badge badge-amber">${edge.criticality}</span>
        </div>
        <div style="background:var(--bg-secondary); padding:10px; border-radius:6px; font-size:11px; margin-top:6px; line-height:1.4;">
          <strong>Topological Explanation:</strong><br>
          ${edge.explanation}
        </div>
      </div>
    `;

    document.getElementById("btn-close-inspector")?.addEventListener("click", () => {
      panel.classList.remove("active");
    });
  },

  inspectGraphNode(node) {
    const panel = document.getElementById("cascade-inspector");
    if (!panel) return;

    panel.classList.add("active");
    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
        <div>
          <span class="badge badge-cyan" style="margin-bottom:4px;">${node.type}</span>
          <h3 style="font-size:15px; font-weight:800; color:var(--text-heading); margin:0;">${node.label}</h3>
        </div>
        <button id="btn-close-inspector" class="btn btn-sm btn-secondary" style="padding:2px 8px;">&times;</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px; font-size:12px;">
        <div style="display:flex; justify-content:space-between;">
          <span>Reachability:</span>
          <span class="badge ${node.isIsolated ? 'badge-red' : 'badge-green'}">
            ${node.isIsolated ? 'SEVERED / ISOLATED' : 'CONNECTED TO DISPATCH ROOT'}
          </span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span>Coordinates:</span>
          <span class="font-mono text-muted">${node.latitude.toFixed(4)}°N, ${node.longitude.toFixed(4)}°E</span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span>Node ID:</span>
          <code class="font-mono">${node.id}</code>
        </div>
        <div style="background:var(--bg-secondary); padding:10px; border-radius:6px; font-size:11px; margin-top:6px;">
          Grounded in physical Bengaluru highway junction geometry. Connects adjacent ambulance and evacuation dependency arcs.
        </div>
      </div>
    `;

    document.getElementById("btn-close-inspector")?.addEventListener("click", () => {
      panel.classList.remove("active");
    });

    this.map.easeTo({
      center: [node.longitude, node.latitude],
      duration: 600
    });
  },

  bindUIControls() {
    // 1. 2D / 3D Perspective Toggle Button
    const btn2D3D = document.getElementById("btn-toggle-2d-3d");
    if (btn2D3D) {
      btn2D3D.addEventListener("click", () => {
        this.toggle2D3D();
      });
    }

    // 2. Reset Camera Button
    const btnResetCam = document.getElementById("btn-reset-cascade-camera");
    if (btnResetCam) {
      btnResetCam.addEventListener("click", () => {
        this.resetCamera();
      });
    }

    // 3. Layer Toggles
    const toggles = [
      { id: "toggle-layer-buildings", layer: "buildings-3d-extrusion", stateKey: "buildings" },
      { id: "toggle-layer-roads", layer: "roads-core", glowLayer: "roads-glow", stateKey: "roads" },
      { id: "toggle-layer-dependencies", layer: "dependency-arcs-core", glowLayer: "dependency-arcs-glow", stateKey: "dependencies" },
      { id: "toggle-layer-catchments", layer: "catchments-fill", outlineLayer: "catchments-outline", stateKey: "catchments" }
    ];

    toggles.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) {
        el.checked = this.layerVisibility[t.stateKey];
        el.addEventListener("change", (e) => {
          const visible = e.target.checked;
          this.layerVisibility[t.stateKey] = visible;
          const val = visible ? "visible" : "none";
          if (this.map.getLayer(t.layer)) this.map.setLayoutProperty(t.layer, "visibility", val);
          if (t.glowLayer && this.map.getLayer(t.glowLayer)) this.map.setLayoutProperty(t.glowLayer, "visibility", val);
          if (t.outlineLayer && this.map.getLayer(t.outlineLayer)) this.map.setLayoutProperty(t.outlineLayer, "visibility", val);
        });
      }
    });

    // Infrastructure Markers toggle
    const toggleInfra = document.getElementById("toggle-layer-infra");
    if (toggleInfra) {
      toggleInfra.checked = this.layerVisibility.infrastructure;
      toggleInfra.addEventListener("change", (e) => {
        const visible = e.target.checked;
        this.layerVisibility.infrastructure = visible;
        this.markers.forEach((m) => {
          m.getElement().style.display = visible ? "flex" : "none";
        });
      });
    }
  },

  toggle2D3D() {
    this.is3DMode = !this.is3DMode;
    const btn = document.getElementById("btn-toggle-2d-3d");

    if (this.is3DMode) {
      // Transition to genuine tilted 3D perspective with 3D buildings
      this.map.easeTo({
        pitch: this.DEFAULT_PITCH_3D,
        bearing: this.DEFAULT_BEARING_3D,
        duration: 900
      });
      if (btn) {
        btn.innerHTML = `<span>🌐 View: <strong>3D Perspective</strong></span>`;
        btn.classList.add("active");
      }
      if (this.map.getLayer("buildings-3d-extrusion")) {
        this.map.setLayoutProperty("buildings-3d-extrusion", "visibility", "visible");
      }
    } else {
      // Transition to flat 2D top-down perspective
      this.map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 900
      });
      if (btn) {
        btn.innerHTML = `<span>🗺️ View: <strong>2D Planimetric</strong></span>`;
        btn.classList.remove("active");
      }
      if (this.map.getLayer("buildings-3d-extrusion")) {
        this.map.setLayoutProperty("buildings-3d-extrusion", "visibility", "none");
      }
    }
  },

  resetCamera() {
    if (!this.map) return;
    this.map.easeTo({
      center: this.BENGALURU_CENTER,
      zoom: this.DEFAULT_ZOOM,
      pitch: this.is3DMode ? this.DEFAULT_PITCH_3D : 0,
      bearing: this.is3DMode ? this.DEFAULT_BEARING_3D : 0,
      duration: 1000
    });
  },

  async onScenarioUpdated(scenario, results) {
    this.activeScenario = scenario;
    this.activeResults = results;

    try {
      const graphRes = await API.getCascadeGraph();
      this.graphData = graphRes;

      // Re-render layers with updated disruption states
      this.addRoadsLayer();
      this.addDependencyArcsLayer();
      this.renderInfrastructureMarkers();
      this.updateCascadeSummary();
    } catch (e) {
      console.error("Scenario update cascade re-render error:", e);
    }
  },

  onThemeChanged(theme) {
    this.currentTheme = theme;
    if (!this.map) return;

    // Preserve camera parameters
    const center = this.map.getCenter();
    const zoom = this.map.getZoom();
    const pitch = this.map.getPitch();
    const bearing = this.map.getBearing();

    this.map.setStyle(this.getMapStyle(theme));
    this.map.once("style.load", () => {
      this.map.setCenter(center);
      this.map.setZoom(zoom);
      this.map.setPitch(pitch);
      this.map.setBearing(bearing);
      this.buildGeoLayers();
      this.renderInfrastructureMarkers();
    });
  },

  updateCascadeSummary() {
    const severedCount = this.graphData.severedEdgesCount || 0;
    const isolatedCount = (this.activeResults?.isolatedFacilities || []).length;

    const severedEl = document.getElementById("cascade-severed-count");
    if (severedEl) severedEl.textContent = severedCount;

    const isolatedEl = document.getElementById("cascade-isolated-count");
    if (isolatedEl) isolatedEl.textContent = isolatedCount;

    const listEl = document.getElementById("cascade-steps-timeline");
    if (listEl && this.graphData.cascadeSteps) {
      listEl.innerHTML = this.graphData.cascadeSteps
        .map(
          (step) => `
          <div style="padding:10px 12px; margin-bottom:8px; border-radius:6px; background:var(--bg-secondary); border-left:4px solid ${step.severity === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-amber)'}; font-size:12px;">
            <div style="font-weight:700; color:var(--text-heading); display:flex; justify-content:space-between;">
              <span>Step ${step.step}: ${step.type}</span>
              <span class="badge ${step.severity === 'CRITICAL' ? 'badge-red' : 'badge-amber'}">${step.severity}</span>
            </div>
            <div style="color:var(--text-secondary); margin-top:3px; line-height:1.4;">${step.description}</div>
          </div>`
        )
        .join("");
    }
  },

  showLoadingState(loading) {
    const el = document.getElementById("cascade-loading-indicator");
    if (el) el.style.display = loading ? "flex" : "none";
  },

  showErrorState(msg) {
    const el = document.getElementById("cascade-loading-indicator");
    if (el) {
      el.style.display = "flex";
      el.innerHTML = `<div class="card" style="border-color:var(--accent-red); color:var(--accent-red); max-width:400px; text-align:center;">
        <strong>Geospatial Engine Error</strong><br>
        <span style="font-size:12px; margin-top:4px; display:inline-block;">${msg}</span>
      </div>`;
    }
  }
};

window.CascadeVision = CascadeVision;

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("cascade-map-mount")) {
    CascadeVision.init();
  }
});
