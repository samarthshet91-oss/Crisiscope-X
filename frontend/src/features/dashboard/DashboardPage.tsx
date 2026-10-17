import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Navigation,
  Building,
  MapPin,
  Users,
  AlertCircle,
  CloudRain,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { InteractiveMap } from '../map/InteractiveMap';
import { KpiCard } from './KpiCard';
import { RainfallPanel } from './RainfallPanel';
import { DataSourcesPanel } from './DataSourcesPanel';
import { FeatureGrid2x2 } from './FeatureGrid2x2';
import { ProvenanceTag } from '../../components/ProvenanceTag';
import { RiskBadge } from '../../components/RiskBadge';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentScenario,
    riskResult,
    interventionResult,
    runCascadeSimulation,
    resetScenarioState,
    isSimulating,
    layers,
    runtimeArchitecture,
  } = useAppStore();

  const [activeWardFilter, setActiveWardFilter] = useState<string | null>(null);

  const affectedRoadsCount =
    currentScenario?.affectedAssets.filter((a) => a.type === 'road').length || 4;
  const affectedFacilitiesCount =
    currentScenario?.affectedAssets.filter(
      (a) => a.type === 'hospital' || a.type === 'clinic' || a.type === 'shelter'
    ).length || 3;
  const affectedWardsCount =
    riskResult?.wardSummaries.filter((w) => w.riskScore >= 50).length || 4;
  const populationEstimate = '82,400';

  const recommendedOption =
    interventionResult?.alternatives.find((a) => a.id === interventionResult.recommendedOptionId) ||
    interventionResult?.baseline;

  const timelineEvents = currentScenario?.timelineEvents || [
    {
      stepId: 'step-rain',
      timeIST: '18:00 IST',
      title: 'Cloudburst threshold passed',
      description: '72 mm/h logged over Bellandur Lake catchment basin.',
      severity: 'High' as const,
    },
    {
      stepId: 'step-underpass',
      timeIST: '18:15 IST',
      title: 'Ecospace underpass submerged',
      description: 'Bidirectional vehicular carriage fully impassable.',
      severity: 'Severe' as const,
    },
    {
      stepId: 'step-queue',
      timeIST: '18:30 IST',
      title: 'Queue propagates to ORR feeder',
      description: 'Kadubeesanahalli junction transit delay rises by +35 min.',
      severity: 'High' as const,
    },
    {
      stepId: 'step-hospital',
      timeIST: '18:45 IST',
      title: 'Sakra Hospital west gate isolated',
      description: 'Ambulance ingress diverted to HAL Old Airport corridor.',
      severity: 'Severe' as const,
    },
  ];

  const wardSummaries = riskResult?.wardSummaries || [];

  return (
    <div className="space-y-6">
      {/* Top Header: Title, Telemetry Freshness & Simulation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Bengaluru Flood Risk Intelligence
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold">
              BBMP 198 Wards
            </span>
            <ProvenanceTag type="Synthetic scenario" size="sm" />
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time multi-source telemetry, topological gridlock spread, and explainable intervention dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            type="button"
            onClick={resetScenarioState}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-navy-700/80 bg-navy-900/80 hover:bg-navy-800 text-slate-300 hover:text-white text-xs font-semibold shadow-glass transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset scenario</span>
          </button>
          <button
            type="button"
            onClick={runCascadeSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-signal-blue hover:bg-signal-blue-hover text-navy-950 text-xs font-bold shadow-[0_0_20px_rgba(0,229,255,0.35)] transition-all active:scale-95 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isSimulating ? 'Simulating cascade...' : 'Run simulation'}</span>
          </button>
        </div>
      </div>

      {/* Prominent Recommended Response Action Card */}
      <div className="p-4 rounded-card bg-gradient-to-r from-navy-900/95 via-navy-900/90 to-cyan-950/40 border border-cyan-500/40 shadow-glass backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Recommended Decision Protocol
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Scenario #{currentScenario?.scenarioId?.replace('scenario-', '') || 'BLR-72B'}
              </span>
              <ProvenanceTag type="Model estimate" size="sm" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight truncate">
              {recommendedOption?.title || 'Alternative A: Reroute via HAL Old Airport Road Corridor'}
            </h2>
            <p className="text-xs text-slate-300 leading-snug line-clamp-1">
              {interventionResult?.rationale ||
                'Restores critical access to Sakra World Hospital while reducing transit delay by 18 minutes.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-center font-mono">
          <div className="hidden lg:flex items-center gap-3 pr-4 border-r border-navy-700/80 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Transit Saving:</span>
              <span className="text-sm font-bold text-emerald-400">-18 min</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Accessibility:</span>
              <span className="text-sm font-bold text-cyan-300">88% (+34%)</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/console/lab')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-white border border-cyan-500/40 hover:border-cyan-500/70 text-xs font-bold transition-all group shadow-[0_0_15px_rgba(0,229,255,0.15)]"
          >
            <span>Open Response Lab</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Hero Section: Map (Left 8 cols) + KPI Column & Telemetry (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch">
        {/* Main Map Hero */}
        <div className="lg:col-span-8 flex flex-col">
          <InteractiveMap
            is3D={false}
            showOverlayPanels={true}
            interactiveDisruption={true}
            className="h-[480px] lg:h-[540px] w-full"
          />
        </div>

        {/* Right KPI Column */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-3">
          <KpiCard
            title="Road corridors disrupted"
            value={`${affectedRoadsCount} corridors`}
            changeValue="+2 impassable"
            changeDirection="up"
            isIncreaseWorse={true}
            icon={Navigation}
            provenanceType="Model estimate"
            subtext="Ecospace underpass & ORR service carriageway flooded"
          />

          <KpiCard
            title="Facilities with reduced access"
            value={`${affectedFacilitiesCount} facilities`}
            changeValue="+1 isolated"
            changeDirection="up"
            isIncreaseWorse={true}
            icon={Building}
            provenanceType="Model estimate"
            subtext="Sakra World Hospital, Manipal Hospital, Bellandur UPHC"
          />

          <KpiCard
            title="BBMP wards affected"
            value={`${affectedWardsCount} wards`}
            changeValue="Risk > 50"
            changeDirection="up"
            isIncreaseWorse={true}
            icon={MapPin}
            provenanceType="Observed"
            provenanceSource="BBMP Ward Delimitation 2023"
            subtext="Bellandur (150), Doddanekkundi (85), Koramangala (151)"
          />

          <KpiCard
            title="Population exposure estimate"
            value={populationEstimate}
            changeValue="GHSL 100m grid"
            changeDirection="neutral"
            icon={Users}
            provenanceType="Observed"
            provenanceSource="EC-JRC Global Human Settlement Layer"
            subtext="Estimate for a fixed period, not live population"
          />
        </div>
      </div>

      {/* Live Event Timeline & High-Risk Ward Severity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Live-style Event Timeline */}
        <div className="lg:col-span-7 bg-navy-900/90 rounded-card p-5 shadow-glass border border-navy-700/80 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-navy-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Live-style incident timeline</h3>
                <p className="text-[11px] text-slate-400">
                  Chronological cascade chain across Bellandur & Outer Ring Road
                </p>
              </div>
            </div>
            <ProvenanceTag type="Synthetic scenario" size="sm" />
          </div>

          <div className="space-y-3 relative pl-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-navy-800">
            {timelineEvents.map((evt, idx) => (
              <div key={evt.stepId} className="relative group">
                <span className="absolute -left-[18px] top-1.5 w-3 h-3 rounded-full bg-navy-950 border-2 border-cyan-400 group-hover:scale-125 transition-transform" />
                <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800/90 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-cyan-400 font-bold">
                        {evt.timeIST}
                      </span>
                      <RiskBadge level={evt.severity} size="sm" />
                      <span className="text-xs font-bold text-white">{evt.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{evt.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High-Risk Ward List with Severity Indicators */}
        <div className="lg:col-span-5 bg-navy-900/90 rounded-card p-5 shadow-glass border border-navy-700/80 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-navy-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">High-risk municipal wards</h3>
                <p className="text-[11px] text-slate-400">
                  Computed risk index based on slope and canal capacity
                </p>
              </div>
            </div>
            <ProvenanceTag type="Model estimate" size="sm" />
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {wardSummaries.map((w) => (
              <div
                key={w.wardId}
                onClick={() => setActiveWardFilter(w.wardId)}
                className="p-3 rounded-xl bg-navy-950/70 border border-navy-800 hover:border-cyan-500/40 cursor-pointer transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-white truncate max-w-[200px]">
                    {w.wardName}
                  </div>
                  <RiskBadge level={w.riskLevel} size="sm" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Risk Index: {w.riskScore}/100</span>
                    <span>{w.criticalFacilitiesAtRisk} facilities in buffer</span>
                  </div>
                  <div className="w-full bg-navy-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        w.riskScore >= 70
                          ? 'bg-risk-red'
                          : w.riskScore >= 50
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${w.riskScore}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Panels: Rainfall Telemetry + Data Sources Registry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        <div className="lg:col-span-4">
          <RainfallPanel />
        </div>
        <div className="lg:col-span-8">
          <DataSourcesPanel />
        </div>
      </div>

      {/* 2x2 Grid of Feature Decision Modules below Hero */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white">Decision intelligence modules</h2>
          <span className="text-xs text-slate-400 font-medium">Click any card to expand full page</span>
        </div>
        <FeatureGrid2x2 />
      </div>
    </div>
  );
};
