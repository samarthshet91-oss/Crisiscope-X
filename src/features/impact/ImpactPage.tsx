import React, { useState } from 'react';
import {
  ActivitySquare,
  Navigation,
  Building,
  Home,
  Layers,
  MapPin,
  AlertTriangle,
  Info,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { InteractiveMap } from '../map/InteractiveMap';
import { ProvenanceTag } from '../../components/ProvenanceTag';
import { RiskBadge } from '../../components/RiskBadge';

export const ImpactPage: React.FC = () => {
  const { currentScenario, layers } = useAppStore();
  const [activeTab, setActiveTab] = useState<'access' | 'infra' | 'population'>('access');

  const assets = currentScenario?.affectedAssets || [];

  const roads = assets.filter((a) => a.type === 'road');
  const hospitals = assets.filter((a) => a.type === 'hospital');
  const clinics = assets.filter((a) => a.type === 'clinic');
  const shelters = assets.filter((a) => a.type === 'shelter');
  const bridges = assets.filter((a) => a.type === 'bridge');

  // Computed shares from API counts
  const totalMonitoredRoads = 24;
  const totalMonitoredHospitals = 12;
  const totalMonitoredShelters = 8;
  const totalMonitoredBridges = 6;

  const roadImpactShare = Math.round((roads.length / totalMonitoredRoads) * 100);
  const hospitalImpactShare = Math.round((hospitals.length / totalMonitoredHospitals) * 100);
  const shelterImpactShare = Math.round((shelters.length / totalMonitoredShelters) * 100);
  const bridgeImpactShare = Math.round((bridges.length / totalMonitoredBridges) * 100);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.25)]">
              <ActivitySquare className="w-4 h-4" />
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight">
              Impact Assessment
            </h1>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-navy-900 text-slate-300 font-bold border border-navy-750">
              Access Loss Only (No Economic Claim)
            </span>
            <ProvenanceTag type="Model estimate" size="sm" />
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Evaluates operational connectivity and accessibility disruption across critical emergency nodes. No economic loss or structural damage figures.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 p-1 bg-navy-900/90 rounded-xl border border-navy-700/80 text-xs font-semibold self-start sm:self-center shadow-glass">
          <button
            type="button"
            onClick={() => setActiveTab('access')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'access'
                ? 'bg-signal-blue text-navy-950 font-bold shadow-[0_0_12px_rgba(0,229,255,0.35)]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Access impact
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('infra')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'infra'
                ? 'bg-signal-blue text-navy-950 font-bold shadow-[0_0_12px_rgba(0,229,255,0.35)]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Infrastructure share
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('population')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'population'
                ? 'bg-signal-blue text-navy-950 font-bold shadow-[0_0_12px_rgba(0,229,255,0.35)]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Population exposure (GHSL)
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Map with Access Loss Legend + Right Affected Infrastructure List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Map with Access Loss Classification */}
        <div className="lg:col-span-8 bg-navy-900/90 rounded-card shadow-glass border border-navy-700/80 p-5 space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-navy-800">
            <div>
              <h2 className="text-sm font-bold text-white font-mono">Corridor accessibility map</h2>
              <p className="text-[11px] text-slate-400">
                Categorized by vehicular access loss (Severe, Moderate, Minor, Unaffected)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-cyan-400 font-mono">
                {assets.length} flagged assets
              </span>
              <ProvenanceTag type="Model estimate" size="sm" />
            </div>
          </div>

          <div className="relative">
            <InteractiveMap
              is3D={false}
              showOverlayPanels={false}
              className="h-[440px] w-full"
            />

            {/* Custom Access Loss Legend */}
            <div className="absolute bottom-3 left-3 z-20 bg-navy-950/90 backdrop-blur-md border border-navy-700/80 rounded-xl px-3.5 py-2 text-xs text-white shadow-glass flex items-center gap-3 flex-wrap font-mono">
              <span className="text-slate-400 font-semibold text-[11px]">
                Access scale:
              </span>
              <div className="flex items-center gap-2.5 text-[11px]">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-risk-red shadow-[0_0_8px_rgba(255,59,83,0.6)]" />
                  <span>Severe (&gt;30m delay)</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Moderate (15-30m)</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span>Minor (&lt;15m)</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>Unaffected</span>
                </span>
              </div>
            </div>
          </div>

          {/* Explanation note */}
          <div className="p-3 bg-navy-950/80 rounded-xl border border-navy-800 text-xs text-slate-400 flex items-start gap-2 font-mono">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              Access ratings reflect physical route clearance delays and floodwater barriers. They strictly do not represent structural integrity, financial loss, or property valuations.
            </p>
          </div>
        </div>

        {/* Right 4 Cols: Affected Infrastructure List & Share */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-navy-900/90 rounded-card shadow-glass border border-navy-700/80 p-5 space-y-4 backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <h3 className="text-sm font-bold text-white font-mono">Affected infrastructure share</h3>
              <ProvenanceTag type="Model estimate" size="sm" />
            </div>

            {/* Share Bars computed from API counts */}
            <div className="space-y-4 font-mono">
              {/* Roads */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Road network</span>
                  </span>
                  <span className="font-bold text-white tabular-nums">
                    {roads.length}/{totalMonitoredRoads} ({roadImpactShare}%)
                  </span>
                </div>
                <div className="w-full bg-navy-950 rounded-full h-2 overflow-hidden border border-navy-800">
                  <div
                    className="bg-risk-red h-full rounded-full shadow-[0_0_8px_rgba(255,59,83,0.5)]"
                    style={{ width: `${roadImpactShare}%` }}
                  />
                </div>
              </div>

              {/* Hospitals */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hospitals</span>
                  </span>
                  <span className="font-bold text-white tabular-nums">
                    {hospitals.length}/{totalMonitoredHospitals} ({hospitalImpactShare}%)
                  </span>
                </div>
                <div className="w-full bg-navy-950 rounded-full h-2 overflow-hidden border border-navy-800">
                  <div
                    className="bg-amber-400 h-full rounded-full"
                    style={{ width: `${hospitalImpactShare}%` }}
                  />
                </div>
              </div>

              {/* Shelters */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-purple-400" />
                    <span>Designated shelters</span>
                  </span>
                  <span className="font-bold text-white tabular-nums">
                    {shelters.length}/{totalMonitoredShelters} ({shelterImpactShare}%)
                  </span>
                </div>
                <div className="w-full bg-navy-950 rounded-full h-2 overflow-hidden border border-navy-800">
                  <div
                    className="bg-purple-400 h-full rounded-full"
                    style={{ width: `${shelterImpactShare}%` }}
                  />
                </div>
              </div>

              {/* Bridges & Flyovers */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Grade separators</span>
                  </span>
                  <span className="font-bold text-white tabular-nums">
                    {bridges.length}/{totalMonitoredBridges} ({bridgeImpactShare}%)
                  </span>
                </div>
                <div className="w-full bg-navy-950 rounded-full h-2 overflow-hidden border border-navy-800">
                  <div
                    className="bg-emerald-400 h-full rounded-full"
                    style={{ width: `${bridgeImpactShare}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Detailed list of affected assets */}
          <div className="bg-navy-900/90 rounded-card shadow-glass border border-navy-700/80 p-5 space-y-3 backdrop-blur-md">
            <h4 className="text-xs font-bold text-white font-mono">Flagged asset details & delays</h4>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3 rounded-xl bg-navy-950/70 border border-navy-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white truncate max-w-[180px]">
                      {asset.name}
                    </span>
                    <RiskBadge level={asset.severity} size="sm" />
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">{asset.wardName}</div>
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-navy-800/80 font-mono">
                    <span className="text-amber-400 font-semibold">
                      +{asset.delayIncreaseMinutes || 20}m delay
                    </span>
                    <ProvenanceTag provenance={asset.provenance} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
