import React, { useState, useEffect } from 'react';
import {
  GitFork,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Sliders,
  AlertTriangle,
  Building,
  Navigation,
  ChevronDown,
  ChevronUp,
  CloudRain,
  Activity,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { InteractiveMap } from '../map/InteractiveMap';
import { RiskBadge } from '../../components/RiskBadge';
import { ProvenanceTag } from '../../components/ProvenanceTag';
import { ScenarioDefinition } from '../../contracts';

export const CascadeVisionPage: React.FC = () => {
  const {
    scenarios,
    currentScenario,
    setCurrentScenario,
    rainfallIntensityMm,
    setRainfallIntensityMm,
    injectedDisruptions,
    toggleDisruptRoad,
    injectedUnavailableFacilities,
    toggleUnavailableFacility,
    runCascadeSimulation,
    isSimulating,
    timelineStep,
    setTimelineStep,
    isTimelinePlaying,
    setIsTimelinePlaying,
    timelineSpeed,
    setTimelineSpeed,
  } = useAppStore();

  const [showAssumptions, setShowAssumptions] = useState(false);
  const [toggleRoads, setToggleRoads] = useState(true);
  const [toggleReroute, setToggleReroute] = useState(true);
  const [toggleInfra, setToggleInfra] = useState(true);
  const [togglePop, setTogglePop] = useState(false);
  const [toggleReplaySync, setToggleReplaySync] = useState(true);

  const scenarioEvents = currentScenario?.timelineEvents || [];
  const currentEvent = scenarioEvents[timelineStep] || scenarioEvents[0];

  // Auto-play timeline timer
  useEffect(() => {
    if (!isTimelinePlaying) return;

    const intervalMs = 2500 / timelineSpeed;
    const interval = setInterval(() => {
      setTimelineStep((timelineStep + 1) % (scenarioEvents.length || 1));
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isTimelinePlaying, timelineStep, timelineSpeed, scenarioEvents.length, setTimelineStep]);

  // Dynamic calculation of cascade steps based on scenario
  const cascadeProgression = [
    {
      id: 'step-disrupted-road',
      order: 1,
      title: 'Disrupted Road & Underpass',
      assetName: 'Ecospace Underpass (Outer Ring Road)',
      type: 'road',
      reason: 'Underpass drainage saturated; carriage traffic impassable',
      status: 'Flooded',
      severity: 'Severe' as const,
      tag: 'Synthetic scenario' as const,
      activeAtStep: 1,
    },
    {
      id: 'step-connected-roads',
      order: 2,
      title: 'Connected Road Gridlock',
      assetName: 'Kadubeesanahalli Junction & Marathahalli Approach',
      type: 'road',
      reason: 'Disruption spreads upstream; service road delay +35 min',
      status: 'Queue propagating',
      severity: 'High' as const,
      tag: 'Model estimate' as const,
      activeAtStep: 2,
    },
    {
      id: 'step-longer-routes',
      order: 3,
      title: 'Longer Emergency Detour Routes',
      assetName: 'Sarjapur-ORR Junction (Iblur) Arterial Corridor',
      type: 'road',
      reason: 'Feeder roads saturated; average emergency transit delay +24 min',
      status: 'Rerouted',
      severity: 'High' as const,
      tag: 'Model estimate' as const,
      activeAtStep: 3,
    },
    {
      id: 'step-facilities-reduced',
      order: 4,
      title: 'Facilities with Reduced Access',
      assetName: 'Sakra World Hospital & Bellandur UPHC',
      type: 'hospital',
      reason: 'Western ambulance entrance blocked; inbound response access severed',
      status: 'Reduced access',
      severity: 'Severe' as const,
      tag: 'Model estimate' as const,
      activeAtStep: 4,
    },
  ];

  const initialReachable = 5;
  const currentReachable = timelineStep >= 3 ? 3 : initialReachable;

  return (
    <div className="space-y-6">
      {/* Page Title & Tagline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-signal-blue-light/50 border border-signal-blue/30 text-signal-blue dark:bg-navy-950 dark:border-cyan-500/30 dark:text-cyan-400 flex items-center justify-center shadow-xs">
              <GitFork className="w-4 h-4" />
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-ink tracking-tight">
              CascadeVision
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-signal-blue-light/50 border border-signal-blue/30 text-signal-blue dark:bg-cyan-500/10 dark:border-cyan-500/30 dark:text-cyan-300 font-mono font-bold">
              3D DIGITAL TWIN
            </span>
            <ProvenanceTag type="Synthetic scenario" size="sm" />
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Simulates how one disrupted road or underpass spreads delay to connected corridors, routes and emergency facilities.
          </p>
        </div>
      </div>

      {/* Main Simulation Card */}
      <div className="bg-card rounded-card shadow-card border border-slate-200/80 dark:border-cyan-500/20 backdrop-blur-md overflow-hidden">
        {/* Card Top Bar: Scenario Selector + City + Run Simulation */}
        <div className="p-4 bg-slate-50 dark:bg-navy-950/70 border-b border-slate-200 dark:border-navy-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Scenario dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="scenario-select" className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
                Scenario:
              </label>
              <select
                id="scenario-select"
                aria-label="Select flood simulation scenario"
                value={currentScenario?.scenarioId}
                onChange={(e) => {
                  const found = scenarios.find((s) => s.scenarioId === e.target.value);
                  if (found) setCurrentScenario(found);
                }}
                className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-signal-blue shadow-xs"
              >
                {scenarios.map((s) => (
                  <option key={s.scenarioId} value={s.scenarioId}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            {/* City Field (Fixed Bengaluru) */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-700/80 text-xs font-bold text-slate-700 dark:text-slate-200 font-mono">
              <span>City: Bengaluru</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">(198 BBMP wards)</span>
            </div>

            {/* Assumptions toggle */}
            <button
              type="button"
              onClick={() => setShowAssumptions(!showAssumptions)}
              className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              <span>{showAssumptions ? 'Hide assumptions' : 'View assumptions'}</span>
              {showAssumptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Run Simulation Action Button */}
          <button
            type="button"
            onClick={runCascadeSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md shadow-cyan-500/20 transition-transform active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isSimulating ? 'Simulating cascade...' : 'Run simulation'}</span>
          </button>
        </div>

        {/* Collapsible Synthetic Labels & Assumptions Panel */}
        {showAssumptions && currentScenario && (
          <div className="p-4 bg-navy-950 text-white border-b border-navy-800 text-xs animate-in slide-in-from-top duration-150">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-slate-200 flex items-center gap-1.5 mb-2 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Synthetic scenario labels:</span>
                </h4>
                <ul className="space-y-1 text-slate-300">
                  {currentScenario.syntheticLabels.map((lbl, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-cyan-400">•</span>
                      <span>{lbl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 flex items-center gap-1.5 mb-2 font-mono">
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  <span>Demand and network assumptions:</span>
                </h4>
                <ul className="space-y-1 text-slate-300">
                  {currentScenario.demandAssumptions.map((assump, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-sky-400">•</span>
                      <span>{assump}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Main Body: 3D Map + Simulation Controls + Side Cascade Progression List */}
        <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left/Center: 3D Map & Timeline */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative">
              <InteractiveMap
                is3D={true}
                showOverlayPanels={true}
                interactiveDisruption={true}
                className="h-[460px] w-full"
              />

              {/* In-Map Floating Simulation Status Overlay */}
              <div className="absolute top-16 right-4 z-20 bg-navy-950/90 backdrop-blur-md border border-cyan-500/30 text-white px-3 py-2 rounded-xl text-xs shadow-2xl space-y-1 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                  <span className="font-bold text-red-300">Active Cascade Spread</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Peak Intensity: {rainfallIntensityMm} mm/h
                </div>
              </div>
            </div>

            {/* Scenario Timeline Controls */}
            <div className="bg-navy-950/80 border border-cyan-500/20 rounded-xl p-3 text-white shadow-xl backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTimelinePlaying(!isTimelinePlaying)}
                    className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white flex items-center justify-center transition-colors shadow-sm"
                    title={isTimelinePlaying ? 'Pause timeline' : 'Play timeline'}
                    aria-label={isTimelinePlaying ? 'Pause timeline' : 'Play timeline'}
                  >
                    {isTimelinePlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTimelineStep((timelineStep + 1) % scenarioEvents.length)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800"
                    title="Step forward"
                    aria-label="Step forward"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setTimelineStep(0)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800"
                    title="Reset to start"
                    aria-label="Reset to start"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <div className="ml-2">
                    <span className="text-xs font-bold text-white block">
                      {currentEvent?.timeIST || '18:20 IST'} &mdash; {currentEvent?.title}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {currentEvent?.description}
                    </span>
                  </div>
                </div>

                {/* Speed Selector */}
                <div className="flex items-center gap-1 self-start sm:self-center font-mono">
                  <span className="text-[11px] text-slate-400 mr-1">Speed:</span>
                  {[0.5, 1, 2, 4].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setTimelineSpeed(spd)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        timelineSpeed === spd
                          ? 'bg-cyan-500 text-black'
                          : 'bg-navy-900 border border-navy-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Step Markers */}
              <div className="grid grid-cols-5 gap-1.5 mt-3 pt-2 border-t border-navy-800 font-mono">
                {scenarioEvents.map((evt, idx) => (
                  <button
                    key={evt.stepId}
                    onClick={() => setTimelineStep(idx)}
                    className={`p-1.5 rounded-lg text-left transition-all ${
                      timelineStep === idx
                        ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-300 font-semibold'
                        : 'bg-navy-950/60 border border-navy-800 text-slate-400 hover:bg-navy-900'
                    }`}
                  >
                    <span className="text-[10px] block text-slate-400">{evt.timeIST}</span>
                    <span className="text-[11px] line-clamp-1">{evt.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Simulation Controls Panel + Cascade Progression List */}
          <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
            {/* Simulation Controls Panel */}
            <div className="bg-navy-950/80 border border-cyan-500/20 rounded-xl p-4 space-y-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-2 border-b border-navy-800">
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Simulation Control Panel</span>
                </div>
                <ProvenanceTag type="Synthetic scenario" size="sm" />
              </div>

              {/* Rainfall Slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <span className="font-semibold text-slate-300 flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Rainfall intensity:</span>
                  </span>
                  <span className="font-black text-cyan-400 tabular-nums text-sm">
                    {rainfallIntensityMm} mm/h
                  </span>
                </div>
                <input
                  type="range"
                  aria-label="Rainfall intensity in millimeters per hour"
                  min={10}
                  max={120}
                  step={2}
                  value={rainfallIntensityMm}
                  onChange={(e) => setRainfallIntensityMm(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-2 bg-navy-900 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                  <span>10 mm/h (Light)</span>
                  <span>65 mm/h (Cloudburst)</span>
                  <span>120 mm/h (Extreme)</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-1 border-t border-navy-800 text-xs">
                <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
                  <span>Road disruptions</span>
                  <input
                    type="checkbox"
                    checked={toggleRoads}
                    onChange={(e) => setToggleRoads(e.target.checked)}
                    className="accent-cyan-400 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
                  <span>Rerouting paths</span>
                  <input
                    type="checkbox"
                    checked={toggleReroute}
                    onChange={(e) => setToggleReroute(e.target.checked)}
                    className="accent-cyan-400 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
                  <span>Infrastructure layer</span>
                  <input
                    type="checkbox"
                    checked={toggleInfra}
                    onChange={(e) => setToggleInfra(e.target.checked)}
                    className="accent-cyan-400 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
                  <span>Population layer (GHSL)</span>
                  <input
                    type="checkbox"
                    checked={togglePop}
                    onChange={(e) => setTogglePop(e.target.checked)}
                    className="accent-cyan-400 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
                  <span>Replay synchronization</span>
                  <input
                    type="checkbox"
                    checked={toggleReplaySync}
                    onChange={(e) => setToggleReplaySync(e.target.checked)}
                    className="accent-cyan-400 rounded"
                  />
                </label>
              </div>

              {/* Interactive Injections */}
              <div className="pt-2 border-t border-navy-800">
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5 font-mono">
                  Manual contingency injections:
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleDisruptRoad('road-ecospace-underpass')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                      injectedDisruptions.includes('road-ecospace-underpass')
                        ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                        : 'bg-navy-900 border border-navy-700 text-slate-300 hover:bg-navy-800'
                    }`}
                  >
                    <span>Click road to disrupt (Ecospace)</span>
                    <span className="text-[10px] font-mono">
                      {injectedDisruptions.includes('road-ecospace-underpass') ? 'Disrupted' : 'Normal'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleUnavailableFacility('fac-sakra-world-hospital')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                      injectedUnavailableFacilities.includes('fac-sakra-world-hospital')
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        : 'bg-navy-900 border border-navy-700 text-slate-300 hover:bg-navy-800'
                    }`}
                  >
                    <span>Mark facility unavailable (Sakra)</span>
                    <span className="text-[10px] font-mono">
                      {injectedUnavailableFacilities.includes('fac-sakra-world-hospital') ? 'Isolated' : 'Reachable'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Cascade Side List */}
            <div className="bg-navy-950/80 border border-cyan-500/20 rounded-xl p-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-2 border-b border-navy-800 mb-3">
                <div className="font-bold text-xs text-white">
                  Cascade Progression ({timelineStep >= 3 ? '4/4' : `${timelineStep + 1}/4`})
                </div>
                <ProvenanceTag type="Model estimate" size="sm" />
              </div>

              {/* Before and After Count metric */}
              <div className="p-2.5 rounded-xl bg-navy-900/80 border border-navy-800 mb-3 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[11px]">
                    Facilities reachable within 30 min:
                  </span>
                  <div className="font-bold text-white mt-0.5">
                    <span className="text-emerald-400">{initialReachable} before</span>
                    <span className="text-slate-500 mx-1.5">&rarr;</span>
                    <span className="text-red-400">{currentReachable} after</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 font-bold">
                  -{initialReachable - currentReachable} cut off
                </span>
              </div>

              {/* Animated sequence items */}
              <div className="space-y-2.5">
                {cascadeProgression.map((item) => {
                  const isTriggered = timelineStep >= item.activeAtStep;

                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isTriggered
                          ? 'bg-navy-900/90 border-cyan-500/40 shadow-sm'
                          : 'bg-navy-950/40 border-navy-800/40 opacity-40'
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-navy-950 border border-cyan-500/30 flex items-center justify-center font-bold text-[10px] text-cyan-400 font-mono">
                            {item.order}
                          </span>
                          <span className="text-xs font-bold text-white">{item.title}</span>
                        </div>
                        <RiskBadge level={item.severity} size="sm" />
                      </div>
                      <div className="text-xs font-semibold text-slate-200 pl-6">
                        {item.assetName}
                      </div>
                      <p className="text-[11px] text-slate-400 pl-6 mt-0.5 leading-snug">
                        {item.reason}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
