import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Layers,
  Eye,
  Maximize2,
  Compass,
  AlertTriangle,
  Building,
  Navigation,
  CloudRain,
  Shield,
  X,
  ExternalLink,
} from 'lucide-react';
import { MAP_CONFIG } from '../../config/map';
import { useAppStore } from '../../store/useAppStore';
import { AffectedAsset, PreparedData } from '../../contracts';
import { RiskBadge } from '../../components/RiskBadge';
import { ProvenanceTag } from '../../components/ProvenanceTag';

interface InteractiveMapProps {
  is3D?: boolean;
  showOverlayPanels?: boolean;
  interactiveDisruption?: boolean;
  highlightedAssetId?: string;
  onSelectAsset?: (asset: AffectedAsset) => void;
  className?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  is3D = false,
  showOverlayPanels = true,
  interactiveDisruption = false,
  highlightedAssetId,
  onSelectAsset,
  className = 'h-[520px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const {
    layers,
    toggleLayer,
    currentScenario,
    preparedData,
    injectedDisruptions,
    toggleDisruptRoad,
    selectedAsset,
    setSelectedAsset,
  } = useAppStore();

  const [activeChip, setActiveChip] = useState<string>('all');
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize MapLibre Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: MAP_CONFIG.darkRasterStyle as any,
        center: MAP_CONFIG.defaultCenter,
        zoom: is3D ? 12.2 : MAP_CONFIG.defaultZoom,
        pitch: is3D ? MAP_CONFIG.pitch3D : MAP_CONFIG.defaultPitch,
        bearing: is3D ? MAP_CONFIG.defaultBearing : 0,
        attributionControl: false,
      });

      // Add OSM attribution control
      map.addControl(
        new maplibregl.AttributionControl({
          compact: true,
          customAttribution: MAP_CONFIG.attributionText,
        }),
        'bottom-right'
      );

      // Add navigation controls
      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

      map.on('error', (e) => {
        // Fallback or tile notice
        console.warn('MapLibre notice:', e);
      });

      mapRef.current = map;

      return () => {
        map.remove();
        mapRef.current = null;
      };
    } catch (err: any) {
      console.warn('MapLibre init error:', err);
      setMapError('Interactive map initializing with vector layer fallback.');
    }
  }, [is3D]);

  // Update Markers when assets or filters change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const assets = currentScenario?.affectedAssets || [];

    assets.forEach((asset) => {
      // Check chip filter
      if (activeChip === 'hotspots' && asset.severity !== 'Severe') return;
      if (activeChip === 'roads' && asset.type !== 'road') return;
      if (activeChip === 'facilities' && asset.type !== 'hospital' && asset.type !== 'clinic' && asset.type !== 'shelter') return;

      const isDisrupted = injectedDisruptions.includes(asset.id) || asset.severity === 'Severe';
      const isSelected = selectedAsset?.id === asset.id || highlightedAssetId === asset.id;

      // Create DOM element for marker
      const el = document.createElement('div');
      el.className = 'group cursor-pointer relative';
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', `${asset.name} - ${asset.severity} risk`);

      // Pin styling
      const pinColor = isDisrupted ? 'bg-risk-red text-white' : 'bg-flood-teal text-white';
      const ringEffect = isSelected ? 'ring-4 ring-white shadow-xl scale-110' : 'ring-2 ring-navy-950 shadow-md';

      el.innerHTML = `
        <div class="flex items-center justify-center w-7 h-7 rounded-full ${pinColor} ${ringEffect} transition-transform hover:scale-125">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            ${
              asset.type === 'hospital' || asset.type === 'clinic'
                ? '<path d="M12 6v12m-6-6h12"/>'
                : asset.type === 'road'
                ? '<circle cx="12" cy="12" r="9"/><path d="m4.93 4.93 14.14 14.14"/>'
                : '<path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4"/>'
            }
          </svg>
        </div>
      `;

      el.onclick = () => {
        setSelectedAsset(asset);
        if (onSelectAsset) onSelectAsset(asset);
        if (interactiveDisruption && asset.type === 'road') {
          toggleDisruptRoad(asset.id);
        }
      };

      try {
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(asset.coordinates)
          .addTo(map);

        markersRef.current.push(marker);
      } catch (err) {
        // Marker add safe guard
      }
    });

    // Add Telemetric Rainfall Station markers if layer enabled
    if (layers.rainfallStations) {
      preparedData
        .filter((d) => d.entityType === 'rainfall_station')
        .forEach((station) => {
          const el = document.createElement('div');
          el.className = 'cursor-pointer';
          el.innerHTML = `
            <div class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-navy-950/90 text-sky-400 border border-sky-400/60 text-[10px] font-mono shadow-md backdrop-blur-xs">
              <span class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
              <span>${station.rainfallHourlyMm || 0} mm/h</span>
            </div>
          `;
          try {
            const marker = new maplibregl.Marker({ element: el })
              .setLngLat(station.coordinates)
              .addTo(map);
            markersRef.current.push(marker);
          } catch (e) {}
        });
    }
  }, [
    currentScenario,
    activeChip,
    injectedDisruptions,
    selectedAsset,
    highlightedAssetId,
    layers.rainfallStations,
    preparedData,
    interactiveDisruption,
    setSelectedAsset,
    onSelectAsset,
    toggleDisruptRoad,
  ]);

  // Focus Chips handler
  const handleChipSelect = (chip: string) => {
    setActiveChip(chip);
    const map = mapRef.current;
    if (!map) return;

    if (chip === 'hotspots') {
      map.flyTo({ center: [77.6848, 12.926], zoom: 13.5 });
    } else if (chip === 'rainfall') {
      map.flyTo({ center: [77.6744, 12.926], zoom: 13 });
    } else if (chip === 'roads') {
      map.flyTo({ center: [77.689, 12.935], zoom: 13 });
    } else if (chip === 'facilities') {
      map.flyTo({ center: [77.689, 12.931], zoom: 14 });
    } else {
      map.flyTo({ center: MAP_CONFIG.defaultCenter, zoom: is3D ? 12.2 : MAP_CONFIG.defaultZoom });
    }
  };

  return (
    <div className={`relative w-full rounded-card overflow-hidden bg-navy-950 border border-navy-800 shadow-card ${className}`}>
      {/* MapLibre DOM container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Map Focus Chip Row */}
      {showOverlayPanels && (
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-navy-900/80 backdrop-blur-md rounded-xl border border-navy-700/80 pointer-events-auto shadow-glass">
            <button
              onClick={() => handleChipSelect('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                activeChip === 'all' ? 'bg-signal-blue text-white shadow-xs' : 'text-slate-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              All layers
            </button>
            <button
              onClick={() => handleChipSelect('hotspots')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                activeChip === 'hotspots' ? 'bg-signal-blue text-white shadow-xs' : 'text-slate-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-risk-red" />
              <span>Flood hotspots</span>
            </button>
            <button
              onClick={() => handleChipSelect('rainfall')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                activeChip === 'rainfall' ? 'bg-signal-blue text-white shadow-xs' : 'text-slate-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              <CloudRain className="w-3 h-3 text-sky-400" />
              <span>Heavy rainfall</span>
            </button>
            <button
              onClick={() => handleChipSelect('roads')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                activeChip === 'roads' ? 'bg-signal-blue text-white shadow-xs' : 'text-slate-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              <Navigation className="w-3 h-3 text-amber-400" />
              <span>Road disruption</span>
            </button>
            <button
              onClick={() => handleChipSelect('facilities')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                activeChip === 'facilities' ? 'bg-signal-blue text-white shadow-xs' : 'text-slate-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              <Building className="w-3 h-3 text-emerald-400" />
              <span>Facility access</span>
            </button>
          </div>

          {/* Layers Toggle Button */}
          <button
            type="button"
            onClick={() => setIsLayersPanelOpen(!isLayersPanelOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-900/80 backdrop-blur-md hover:bg-navy-800 text-slate-200 text-xs font-semibold rounded-xl border border-navy-700/80 pointer-events-auto shadow-glass transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-signal-blue" />
            <span>Layers ({Object.values(layers).filter(Boolean).length})</span>
          </button>
        </div>
      )}

      {/* Floating Glass Callout anchored to selected asset */}
      {selectedAsset && (
        <aside
          aria-label={`Details for ${selectedAsset.name}`}
          className="absolute top-16 left-4 z-20 w-80 max-w-[calc(100vw-2rem)] bg-navy-900/90 backdrop-blur-md border border-navy-700 text-white rounded-card shadow-glass p-3.5 animate-in fade-in duration-150"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <RiskBadge level={selectedAsset.severity} showEstimateLabel size="sm" />
                <ProvenanceTag provenance={selectedAsset.provenance} size="sm" />
              </div>
              <h4 className="font-bold text-sm text-white mt-1.5 leading-snug">
                {selectedAsset.name}
              </h4>
              <p className="text-xs text-slate-400">{selectedAsset.wardName}</p>
            </div>
            <button
              onClick={() => setSelectedAsset(null)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-navy-800"
              aria-label="Close callout"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3 bg-navy-950/60 p-2 rounded-lg border border-navy-800">
            {selectedAsset.reason}
          </p>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-navy-800/80">
            <div>
              <span className="text-slate-400 block">Transit delay:</span>
              <span className="font-semibold text-amber-400 tabular-nums">
                +{selectedAsset.delayIncreaseMinutes || 24} min
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Connected assets:</span>
              <span className="font-semibold text-slate-200 tabular-nums">
                {selectedAsset.connectedAssetsCount || 4} routes
              </span>
            </div>
          </div>

          {interactiveDisruption && selectedAsset.type === 'road' && (
            <button
              onClick={() => toggleDisruptRoad(selectedAsset.id)}
              className={`mt-3 w-full py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                injectedDisruptions.includes(selectedAsset.id)
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-risk-red hover:bg-risk-red/90 text-white'
              }`}
            >
              <span>{injectedDisruptions.includes(selectedAsset.id) ? 'Clear disruption' : 'Inject road disruption'}</span>
              <ProvenanceTag type="Synthetic scenario" size="sm" />
            </button>
          )}
        </aside>
      )}

      {/* Layers Panel Drawer / Dropdown */}
      {isLayersPanelOpen && (
        <aside
          aria-label="Map layers selection"
          className="absolute top-16 right-4 z-20 w-72 bg-navy-900/95 backdrop-blur-md border border-navy-700 text-white rounded-card shadow-glass p-3 text-xs animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-2 border-b border-navy-800 mb-2 font-semibold">
            <span>Spatial layers</span>
            <button onClick={() => setIsLayersPanelOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-navy-800/80 cursor-pointer">
              <input
                type="checkbox"
                checked={layers.floodHotspots}
                onChange={() => toggleLayer('floodHotspots')}
                className="rounded border-navy-600 text-signal-blue"
              />
              <span className="text-slate-200 flex-1">Flood-prone locations (BBMP)</span>
              <ProvenanceTag type="Observed" size="sm" />
            </label>

            <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-navy-800/80 cursor-pointer">
              <input
                type="checkbox"
                checked={layers.drains}
                onChange={() => toggleLayer('drains')}
                className="rounded border-navy-600 text-signal-blue"
              />
              <span className="text-slate-200 flex-1">Stormwater drains (Rajakaluve)</span>
              <ProvenanceTag type="Observed" size="sm" />
            </label>

            <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-navy-800/80 cursor-pointer">
              <input
                type="checkbox"
                checked={layers.roadNetwork}
                onChange={() => toggleLayer('roadNetwork')}
                className="rounded border-navy-600 text-signal-blue"
              />
              <span className="text-slate-200 flex-1">Road network & underpasses</span>
              <ProvenanceTag type="Observed" size="sm" />
            </label>

            <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-navy-800/80 cursor-pointer">
              <input
                type="checkbox"
                checked={layers.facilities}
                onChange={() => toggleLayer('facilities')}
                className="rounded border-navy-600 text-signal-blue"
              />
              <span className="text-slate-200 flex-1">Emergency facilities (OSM)</span>
              <ProvenanceTag type="Observed" size="sm" />
            </label>

            <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-navy-800/80 cursor-pointer">
              <input
                type="checkbox"
                checked={layers.rainfallStations}
                onChange={() => toggleLayer('rainfallStations')}
                className="rounded border-navy-600 text-signal-blue"
              />
              <span className="text-slate-200 flex-1">Rainfall stations (KSNDMC)</span>
              <ProvenanceTag type="Observed" size="sm" />
            </label>

            <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-navy-800/80 cursor-pointer">
              <input
                type="checkbox"
                checked={layers.riskOverlay}
                onChange={() => toggleLayer('riskOverlay')}
                className="rounded border-navy-600 text-signal-blue"
              />
              <span className="text-slate-200 flex-1">Relative risk overlay</span>
              <ProvenanceTag type="Model estimate" size="sm" />
            </label>

            <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-navy-800/80 cursor-pointer">
              <input
                type="checkbox"
                checked={layers.terrain3D}
                onChange={() => toggleLayer('terrain3D')}
                className="rounded border-navy-600 text-signal-blue"
              />
              <span className="text-slate-200 flex-1">Terrain 3D (extruded buildings)</span>
              <ProvenanceTag type="Model estimate" size="sm" />
            </label>

            {/* Optional GHSL */}
            <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-navy-800/80 cursor-pointer">
              <input
                type="checkbox"
                checked={layers.ghslPopulation}
                onChange={() => toggleLayer('ghslPopulation')}
                className="rounded border-navy-600 text-signal-blue"
              />
              <div className="flex-1 min-w-0">
                <span className="text-slate-200 block truncate">GHSL population exposure</span>
                <span className="text-[10px] text-slate-400 block">Fixed period estimate, not live</span>
              </div>
              <ProvenanceTag type="Observed" size="sm" />
            </label>

            {/* Optional Copernicus */}
            <div className="p-2 rounded-lg bg-navy-950/80 border border-navy-800 text-[11px] text-slate-400">
              <div className="flex items-center justify-between font-medium text-slate-300">
                <span>Copernicus flood extent</span>
                <span className="text-[10px] text-amber-400">Empty</span>
              </div>
              <p className="mt-1 text-slate-400 leading-snug">
                No suitable flood product loaded for this area.
              </p>
            </div>
          </div>
        </aside>
      )}

      {/* Map Bottom Legend */}
      <aside
        aria-label="Risk scale legend"
        className="absolute bottom-3 left-3 z-10 bg-navy-900/85 backdrop-blur-md border border-navy-700/80 rounded-xl px-3 py-1.5 text-xs text-white shadow-glass flex items-center gap-3"
      >
        <span className="text-slate-400 font-medium">Relative risk scale:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-risk-green" title="Low risk" />
          <span className="text-slate-300 text-[11px]">Low</span>
          <span className="w-2.5 h-2.5 rounded-full bg-risk-yellow ml-1" title="Moderate risk" />
          <span className="text-slate-300 text-[11px]">Mod</span>
          <span className="w-2.5 h-2.5 rounded-full bg-risk-orange ml-1" title="High risk" />
          <span className="text-slate-300 text-[11px]">High</span>
          <span className="w-2.5 h-2.5 rounded-full bg-risk-red ml-1" title="Severe risk" />
          <span className="text-slate-300 text-[11px]">Severe</span>
        </div>
        <ProvenanceTag type="Model estimate" size="sm" />
      </aside>
    </div>
  );
};
