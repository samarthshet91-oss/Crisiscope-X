import React from 'react';
import {
  Navigation,
  Building,
  MapPin,
  Users,
  AlertCircle,
  CloudRain,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { InteractiveMap } from '../map/InteractiveMap';
import { KpiCard } from './KpiCard';
import { RainfallPanel } from './RainfallPanel';
import { DataSourcesPanel } from './DataSourcesPanel';
import { FeatureGrid2x2 } from './FeatureGrid2x2';
import { ProvenanceTag } from '../../components/ProvenanceTag';

export const DashboardPage: React.FC = () => {
  const {
    currentScenario,
    riskResult,
    runCascadeSimulation,
    resetScenarioState,
    isSimulating,
    layers,
  } = useAppStore();

  const affectedRoadsCount =
    currentScenario?.affectedAssets.filter((a) => a.type === 'road').length || 4;
  const affectedFacilitiesCount =
    currentScenario?.affectedAssets.filter(
      (a) => a.type === 'hospital' || a.type === 'clinic' || a.type === 'shelter'
    ).length || 3;
  const affectedWardsCount =
    riskResult?.wardSummaries.filter((w) => w.riskScore >= 50).length || 4;
  const populationEstimate = layers.ghslPopulation ? '82,400' : '82,400';

  return (
    <div className="space-y-6">
      {/* Top Controls / Scenario Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl lg:text-2xl font-black text-ink tracking-tight">
              Bengaluru Flood Risk Intelligence
            </h1>
            <ProvenanceTag type="Synthetic scenario" size="sm" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Real-time multi-source telemetry and cascading disruption modeling across municipal wards.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={resetScenarioState}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900/80 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset scenario</span>
          </button>
          <button
            type="button"
            onClick={runCascadeSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isSimulating ? 'Simulating...' : 'Run simulation'}</span>
          </button>
        </div>
      </div>

      {/* Hero Section: Map (Left 8 cols) + KPI Column & Panels (Right 4 cols) */}
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
            title="Roads disrupted"
            value={`${affectedRoadsCount} corridors`}
            changeValue="+2"
            changeDirection="up"
            isIncreaseWorse={true}
            icon={Navigation}
            provenanceType="Model estimate"
            subtext="Ecospace underpass & Outer Ring Road service lines flooded"
          />

          <KpiCard
            title="Facilities with reduced access"
            value={`${affectedFacilitiesCount} locations`}
            changeValue="+1"
            changeDirection="up"
            isIncreaseWorse={true}
            icon={Building}
            provenanceType="Model estimate"
            subtext="Sakra World Hospital, Manipal Hospital, Bellandur UPHC"
          />

          <KpiCard
            title="Wards affected"
            value={`${affectedWardsCount} BBMP wards`}
            changeValue="+1"
            changeDirection="up"
            isIncreaseWorse={true}
            icon={MapPin}
            provenanceType="Observed"
            provenanceSource="BBMP Ward Delimitation 2023"
            subtext="Bellandur (150), Doddanekkundi (85), Koramangala (151)"
          />

          <KpiCard
            title="Population in affected area"
            value={populationEstimate}
            changeValue="GHSL grid"
            changeDirection="neutral"
            icon={Users}
            provenanceType="Observed"
            provenanceSource="GHSL 100m Pop Grid (EC-JRC)"
            subtext="Estimate for a fixed period, not live population"
          />
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

      {/* 2x2 Grid of Feature Cards below Hero */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-ink">Decision intelligence modules</h2>
          <span className="text-xs text-slate-500 font-medium">Click any card to expand full page</span>
        </div>
        <FeatureGrid2x2 />
      </div>
    </div>
  );
};
