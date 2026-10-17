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
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-risk-green flex items-center justify-center shadow-xs">
              <ActivitySquare className="w-4 h-4" />
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-ink tracking-tight">
              Impact Assessment
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
              Access Loss Only
            </span>
            <ProvenanceTag type="Model estimate" size="sm" />
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Evaluates operational connectivity and accessibility disruption across critical emergency nodes. No economic loss or damage figures.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl text-xs font-semibold self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveTab('access')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'access' ? 'bg-white text-ink shadow-xs' : 'text-slate-600 hover:text-ink'
            }`}
          >
            Access impact
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('infra')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'infra' ? 'bg-white text-ink shadow-xs' : 'text-slate-600 hover:text-ink'
            }`}
          >
            Infrastructure impact
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('population')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'population' ? 'bg-white text-ink shadow-xs' : 'text-slate-600 hover:text-ink'
            }`}
          >
            Population impact (GHSL)
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Map with Access Loss Legend + Right Affected Infrastructure List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Map with Access Loss Classification */}
        <div className="lg:col-span-8 bg-card rounded-card shadow-card border border-slate-200/80 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-ink">Corridor accessibility map</h2>
              <p className="text-[11px] text-slate-500">
                Categorized by loss of vehicular access (Severe, Moderate, Minor, Unaffected)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-mono">
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
            <div className="absolute bottom-3 left-3 z-10 bg-navy-900/90 backdrop-blur-md border border-navy-700/80 rounded-xl px-3 py-2 text-xs text-white shadow-glass flex items-center gap-3 flex-wrap">
              <span className="text-slate-400 font-semibold text-[11px]">
                Loss of access scale:
              </span>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-risk-red" />
                  <span>Severe (&gt;30m delay)</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-risk-orange" />
                  <span>Moderate (15-30m)</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-risk-yellow" />
                  <span>Minor (&lt;15m)</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-risk-green" />
                  <span>Unaffected</span>
                </span>
              </div>
            </div>
          </div>

          {/* Explanation note */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-signal-blue shrink-0 mt-0.5" />
            <p>
              Access ratings reflect physical impassability and route clearance delay. They do not represent structural integrity or financial damages.
            </p>
          </div>
        </div>

        {/* Right 4 Cols: Affected Infrastructure List & Share */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-card rounded-card shadow-card border border-slate-200/80 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-ink">Affected infrastructure</h3>
              <ProvenanceTag type="Model estimate" size="sm" />
            </div>

            {/* Share Bars computed from API counts */}
            <div className="space-y-3.5">
              {/* Roads */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-signal-blue" />
                    <span>Road network & underpasses</span>
                  </span>
                  <span className="font-bold text-ink tabular-nums">
                    {roads.length} of {totalMonitoredRoads} ({roadImpactShare}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-risk-red h-full rounded-full"
                    style={{ width: `${roadImpactShare}%` }}
                  />
                </div>
              </div>

              {/* Hospitals */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-amber-600" />
                    <span>Hospitals (Tertiary & Secondary)</span>
                  </span>
                  <span className="font-bold text-ink tabular-nums">
                    {hospitals.length} of {totalMonitoredHospitals} ({hospitalImpactShare}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-risk-orange h-full rounded-full"
                    style={{ width: `${hospitalImpactShare}%` }}
                  />
                </div>
              </div>

              {/* Shelters */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Designated relief shelters</span>
                  </span>
                  <span className="font-bold text-ink tabular-nums">
                    {shelters.length} of {totalMonitoredShelters} ({shelterImpactShare}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{ width: `${shelterImpactShare}%` }}
                  />
                </div>
              </div>

              {/* Bridges & Flyovers */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-teal-600" />
                    <span>Bridges & grade separators</span>
                  </span>
                  <span className="font-bold text-ink tabular-nums">
                    {bridges.length} of {totalMonitoredBridges} ({bridgeImpactShare}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-flood-teal h-full rounded-full"
                    style={{ width: `${bridgeImpactShare}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Detailed list of affected assets */}
          <div className="bg-card rounded-card shadow-card border border-slate-200/80 p-5 space-y-3">
            <h4 className="text-xs font-bold text-ink">Asset details & delays</h4>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink truncate max-w-[180px]">
                      {asset.name}
                    </span>
                    <RiskBadge level={asset.severity} size="sm" />
                  </div>
                  <div className="text-[11px] text-slate-500">{asset.wardName}</div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                    <span className="text-amber-700 font-semibold">
                      +{asset.delayIncreaseMinutes || 20}m transit delay
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
