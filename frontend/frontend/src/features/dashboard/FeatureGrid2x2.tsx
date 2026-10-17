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
      <div className="bg-card rounded-card p-5 border border-slate-200/80 dark:border-cyan-500/20 shadow-card backdrop-blur-md flex flex-col justify-between group hover:border-signal-blue/40 dark:hover:border-cyan-500/40 transition-all">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-signal-blue-light/50 border border-signal-blue/30 text-signal-blue dark:bg-navy-950/80 dark:border-cyan-500/30 dark:text-cyan-400 flex items-center justify-center">
                <GitFork className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">CascadeVision</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Disruption spread & connected route impact
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/console/cascade')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-signal-blue dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
              title="Expand CascadeVision full page"
              aria-label="Expand CascadeVision full page"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <div className="relative h-44 rounded-xl overflow-hidden bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 p-3 mb-3 flex flex-col justify-between">
            {/* Background schematic / mini visual representation */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1769ff_1px,transparent_1px)] dark:bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-semibold text-ink">
                Outer Ring Road corridor (ORR)
              </span>
              <RiskBadge level="Severe" showEstimateLabel size="sm" />
            </div>

            {/* Sequence chips */}
            <div className="relative z-10 flex items-center gap-1.5 text-[11px] overflow-x-auto py-1 font-mono">
              <span className="px-2 py-0.5 rounded bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 font-medium shrink-0">
                1. Ecospace flooded
              </span>
              <span className="text-slate-400 dark:text-slate-500">&rarr;</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-medium shrink-0">
                2. Kadubeesanahalli jam
              </span>
              <span className="text-slate-400 dark:text-slate-500">&rarr;</span>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-500/30 font-medium shrink-0">
                3. Sakra Hospital isolated
              </span>
            </div>

            <div className="relative z-10 flex items-center justify-between pt-2 border-t border-slate-200 dark:border-navy-800 text-[11px] text-slate-600 dark:text-slate-300 font-mono">
              <span>Reachable facilities (30m):</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">3 of 8 (5 cut off)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <ProvenanceTag type="Model estimate" size="sm" />
          <button
            type="button"
            onClick={runCascadeSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm shadow-cyan-500/20 transition-all"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isSimulating ? 'Simulating...' : 'Run simulation'}</span>
          </button>
        </div>
      </div>

      {/* 2. Scenario Alerts List */}
      <div className="bg-card rounded-card p-5 border border-slate-200/80 dark:border-cyan-500/20 shadow-card backdrop-blur-md flex flex-col justify-between hover:border-signal-blue/40 dark:hover:border-cyan-500/40 transition-all">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">Scenario Alerts</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Simulated scenario alerts. Not official warnings.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/console/alerts')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-signal-blue dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
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
                className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-navy-950/70 border border-slate-200 dark:border-navy-800 hover:border-signal-blue/40 dark:hover:border-cyan-500/30 cursor-pointer transition-colors"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <RiskBadge level={alert.severity} size="sm" />
                    <span className="text-xs font-bold text-ink truncate">
                      {alert.locationName}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                    {alert.timestampIST.slice(-9)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 leading-snug">
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
            className="flex items-center gap-1 text-xs font-semibold text-signal-blue dark:text-cyan-400 hover:underline"
          >
            <span>View all {alerts.length} alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Risk Analytics Summary */}
      <div className="bg-card rounded-card p-5 border border-slate-200/80 dark:border-cyan-500/20 shadow-card backdrop-blur-md flex flex-col justify-between hover:border-signal-blue/40 dark:hover:border-cyan-500/40 transition-all">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 flex items-center justify-center">
                <LineChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">Risk Analytics</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ward-level vulnerability & contributing factors
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/console/risk')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-signal-blue dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
              title="Expand risk analytics full page"
              aria-label="Expand risk analytics full page"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-xs pb-1 font-mono">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Top contributing factors:</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Weight (%)</span>
            </div>
            {riskResult?.contributingFactors.slice(0, 3).map((factor) => (
              <div key={factor.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[200px]">
                    {factor.factorName}
                  </span>
                  <span className="font-bold text-signal-blue dark:text-cyan-400 tabular-nums font-mono">{factor.weightPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-navy-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full"
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
            className="flex items-center gap-1 text-xs font-semibold text-signal-blue dark:text-cyan-400 hover:underline"
          >
            <span>Explore ward risk breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Impact Summary */}
      <div className="bg-card rounded-card p-5 border border-slate-200/80 dark:border-cyan-500/20 shadow-card backdrop-blur-md flex flex-col justify-between hover:border-signal-blue/40 dark:hover:border-cyan-500/40 transition-all">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 text-flood-teal-dark dark:text-teal-400 flex items-center justify-center">
                <ActivitySquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">Impact Assessment</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Critical infrastructure access loss (no structural damage figures)
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/console/impact')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-signal-blue dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
              title="Expand impact assessment full page"
              aria-label="Expand impact assessment full page"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-navy-950/70 border border-slate-200 dark:border-navy-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Roads disrupted</span>
              <span className="text-xl font-black text-ink tabular-nums mt-0.5 block font-mono">
                {currentScenario?.affectedAssets.filter((a) => a.type === 'road').length || 4}
              </span>
              <span className="text-[10px] text-red-500 dark:text-red-400 font-medium">Corridors impassable</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-navy-950/70 border border-slate-200 dark:border-navy-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Hospitals affected</span>
              <span className="text-xl font-black text-ink tabular-nums mt-0.5 block font-mono">
                {currentScenario?.affectedAssets.filter((a) => a.type === 'hospital').length || 2}
              </span>
              <span className="text-[10px] text-amber-500 dark:text-amber-400 font-medium">Reduced access</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-navy-950/70 border border-slate-200 dark:border-navy-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Clinics affected</span>
              <span className="text-xl font-black text-ink tabular-nums mt-0.5 block font-mono">
                {currentScenario?.affectedAssets.filter((a) => a.type === 'clinic').length || 1}
              </span>
              <span className="text-[10px] text-amber-500 dark:text-amber-400 font-medium">Ambulance detour</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-navy-950/70 border border-slate-200 dark:border-navy-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Shelters in buffer</span>
              <span className="text-xl font-black text-ink tabular-nums mt-0.5 block font-mono">
                {currentScenario?.affectedAssets.filter((a) => a.type === 'shelter').length || 1}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Access delayed</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <ProvenanceTag type="Model estimate" size="sm" />
          <button
            onClick={() => navigate('/console/impact')}
            className="flex items-center gap-1 text-xs font-semibold text-signal-blue dark:text-cyan-400 hover:underline"
          >
            <span>View access impact matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
