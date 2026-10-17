import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Maximize2,
  GitFork,
  Bell,
  LineChart,
  ActivitySquare,
  Play,
  ArrowRight,
  AlertTriangle,
  Building,
  Navigation,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { RiskBadge } from '../../components/RiskBadge';
import { ProvenanceTag } from '../../components/ProvenanceTag';

export const FeatureGrid2x2: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentScenario,
    alerts,
    riskResult,
    runCascadeSimulation,
    isSimulating,
  } = useAppStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
      {/* 1. CascadeVision Preview */}
      <div className="bg-navy-900/90 rounded-card p-5 shadow-glass border border-navy-700/80 flex flex-col justify-between group hover:border-cyan-500/40 transition-all backdrop-blur-md">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-navy-800 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                <GitFork className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">CascadeVision</h3>
                <p className="text-[11px] text-slate-400">
                  Disruption spread & connected route impact
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/console/cascade')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-navy-800 transition-colors"
              title="Expand CascadeVision full page"
              aria-label="Expand CascadeVision full page"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <div className="relative h-44 rounded-xl overflow-hidden bg-navy-950 border border-navy-800 p-3.5 mb-3 flex flex-col justify-between">
            {/* Background schematic / mini visual representation */}
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#00E5FF_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                Outer Ring Road Corridor (ORR)
              </span>
              <RiskBadge level="Severe" showEstimateLabel size="sm" />
            </div>

            {/* Sequence chips */}
            <div className="relative z-10 flex items-center gap-1.5 text-[11px] overflow-x-auto py-1 font-mono">
              <span className="px-2 py-0.5 rounded bg-risk-red/20 text-risk-red border border-risk-red/40 font-semibold shrink-0">
                1. Ecospace flooded
              </span>
              <span className="text-slate-500">→</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shrink-0">
                2. Kadubeesanahalli jam
              </span>
              <span className="text-slate-500">→</span>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold shrink-0">
                3. Sakra Hospital isolated
              </span>
            </div>

            <div className="relative z-10 flex items-center justify-between pt-2 border-t border-navy-800 text-[11px] text-slate-300 font-mono">
              <span>Reachable facilities (30m):</span>
              <span className="font-bold text-amber-400 tabular-nums">3 of 8 (5 cut off)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <ProvenanceTag type="Model estimate" size="sm" />
          <button
            type="button"
            onClick={runCascadeSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-signal-blue hover:bg-signal-blue-hover disabled:opacity-50 text-navy-950 text-xs font-bold rounded-lg shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all active:scale-95"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isSimulating ? 'Simulating...' : 'Run simulation'}</span>
          </button>
        </div>
      </div>

      {/* 2. Scenario Alerts List */}
      <div className="bg-navy-900/90 rounded-card p-5 shadow-glass border border-navy-700/80 flex flex-col justify-between group hover:border-red-500/40 transition-all backdrop-blur-md">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-navy-800 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/30 text-risk-red flex items-center justify-center shadow-[0_0_10px_rgba(255,59,83,0.2)]">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Scenario alerts</h3>
                <p className="text-[11px] text-slate-400">
                  Simulated scenario alerts. Not official warnings.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/console/alerts')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-navy-800 transition-colors"
              title="Expand alerts full page"
              aria-label="Expand alerts full page"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 mb-3">
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                onClick={() => navigate('/console/alerts')}
                className="p-2.5 rounded-xl bg-navy-950/70 border border-navy-800 hover:border-navy-700 cursor-pointer transition-colors"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <RiskBadge level={alert.severity} size="sm" />
                    <span className="text-xs font-bold text-white truncate">
                      {alert.locationName}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {alert.timestampIST.slice(-9)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 leading-snug">
                  {alert.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <ProvenanceTag type="Synthetic scenario" size="sm" />
          <button
            onClick={() => navigate('/console/alerts')}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            <span>View all {alerts.length} alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Risk Analytics Summary */}
      <div className="bg-navy-900/90 rounded-card p-5 shadow-glass border border-navy-700/80 flex flex-col justify-between group hover:border-amber-500/40 transition-all backdrop-blur-md">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-navy-800 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                <LineChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Risk analytics</h3>
                <p className="text-[11px] text-slate-400">
                  Ward-level vulnerability & contributing factors
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/console/risk')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-navy-800 transition-colors"
              title="Expand risk analytics full page"
              aria-label="Expand risk analytics full page"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5 mb-3">
            <div className="flex items-center justify-between text-xs pb-1 font-mono">
              <span className="text-slate-400">Top contributing factors:</span>
              <span className="text-[11px] text-cyan-400">Weight (%)</span>
            </div>
            {riskResult?.contributingFactors.slice(0, 3).map((factor) => (
              <div key={factor.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium truncate max-w-[200px]">
                    {factor.factorName}
                  </span>
                  <span className="font-bold text-cyan-300 font-mono tabular-nums">
                    {factor.weightPercent}%
                  </span>
                </div>
                <div className="w-full bg-navy-950 rounded-full h-1.5 overflow-hidden border border-navy-800">
                  <div
                    className="bg-cyan-400 h-full rounded-full"
                    style={{ width: `${factor.weightPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <ProvenanceTag type="Model estimate" size="sm" />
          <button
            onClick={() => navigate('/console/risk')}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            <span>Explore ward risk breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Impact Summary */}
      <div className="bg-navy-900/90 rounded-card p-5 shadow-glass border border-navy-700/80 flex flex-col justify-between group hover:border-emerald-500/40 transition-all backdrop-blur-md">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-navy-800 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <ActivitySquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Impact assessment</h3>
                <p className="text-[11px] text-slate-400">
                  Critical infrastructure access loss (no damage cost)
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/console/impact')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-navy-800 transition-colors"
              title="Expand impact assessment full page"
              aria-label="Expand impact assessment full page"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800">
              <span className="text-slate-400 block text-[11px]">Roads disrupted</span>
              <span className="text-xl font-black text-white tabular-nums mt-0.5 block font-mono">
                {currentScenario?.affectedAssets.filter((a) => a.type === 'road').length || 4}
              </span>
              <span className="text-[10px] text-risk-red font-medium">Corridors impassable</span>
            </div>

            <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800">
              <span className="text-slate-400 block text-[11px]">Hospitals affected</span>
              <span className="text-xl font-black text-white tabular-nums mt-0.5 block font-mono">
                {currentScenario?.affectedAssets.filter((a) => a.type === 'hospital').length || 2}
              </span>
              <span className="text-[10px] text-amber-400 font-medium">Reduced access</span>
            </div>

            <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800">
              <span className="text-slate-400 block text-[11px]">Clinics affected</span>
              <span className="text-xl font-black text-white tabular-nums mt-0.5 block font-mono">
                {currentScenario?.affectedAssets.filter((a) => a.type === 'clinic').length || 1}
              </span>
              <span className="text-[10px] text-amber-400 font-medium">Ambulance detour</span>
            </div>

            <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800">
              <span className="text-slate-400 block text-[11px]">Shelters in buffer</span>
              <span className="text-xl font-black text-white tabular-nums mt-0.5 block font-mono">
                {currentScenario?.affectedAssets.filter((a) => a.type === 'shelter').length || 1}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Access delayed</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <ProvenanceTag type="Model estimate" size="sm" />
          <button
            onClick={() => navigate('/console/impact')}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            <span>View access impact matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
