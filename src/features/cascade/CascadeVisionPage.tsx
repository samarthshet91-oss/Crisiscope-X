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
  Box,
  Map as MapIcon,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { InteractiveMap } from '../map/InteractiveMap';
import { Cascade3DDigitalTwin } from './Cascade3DDigitalTwin';
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

  const [activeView, setActiveView] = useState<'twin' | 'gis'>('twin');
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

    const intervalMs = 2600 / timelineSpeed;
    const interval = setInterval(() => {
      setTimelineStep((timelineStep + 1) % (scenarioEvents.length || 1));
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isTimelinePlaying, timelineStep, timelineSpeed, scenarioEvents.length, setTimelineStep]);

  // Dynamic calculation of cascade steps based on returned scenario data
  const cascadeProgression = [
    {
      id: 'step-disrupted-road',
      order: 1,
      title: 'Disrupted Road & Underpass',
      assetName: 'Ecospace Underpass (Outer Ring Road)',
      type: 'road',
      reason: 'Underpass drainage saturated; 100% carriage submerged',
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
      reason: 'Disruption spreads upstream; service road queue delays +35 min',
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
      reason: 'Detour traffic saturates feeder roads; average transit delay +24 min',
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

  // Facilities reachable count computation
  const initialReachable = 5;
  const currentReachable = timelineStep >= 3 ? 3 : initialReachable;

  return (
    <div className="space-y-6">
      {/* Page Title & Tagline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.25)]">
              <GitFork className="w-4 h-4" />
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              CascadeVision
            </h1>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30">
              3D Digital Twin
            </span>
            <ProvenanceTag type="Synthetic scenario" size="sm" />
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Simulates how one disrupted road or underpass spreads delay to connected corridors, routes and emergency facilities.
          </p>
        </div>

        {/* View Switcher: 3D Twin vs GIS Map */}
        <div className="flex items-center gap-1 p-1 bg-navy-900/90 rounded-xl border border-navy-700/80 text-xs font-semibold self-start sm:self-center shadow-glass">
          <button
            type="button"
            onClick={() => setActiveView('twin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeView === 'twin'
                ? 'bg-signal-blue text-navy-950 font-bold shadow-[0_0_12px_rgba(0,229,255,0.35)]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Digital Twin</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('gis')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeView === 'gis'
                ? 'bg-signal-blue text-navy-950 font-bold shadow-[0_0_12px_rgba(0,229,255,0.35)]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Basin MapLibre</span>
          </button>
        </div>
      </div>

      {/* Main Simulation Card */}
      <div className="bg-navy-900/90 rounded-card shadow-glass border border-navy-700/80 overflow-hidden backdrop-blur-md">
        {/* Card Top Bar: Scenario Selector + City + Run Simulation */}
        <div className="p-4 bg-navy-950/80 border-b border-navy-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Scenario dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="scenario-select" className="text-xs font-mono font-semibold text-slate-400">
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
                className="bg-navy-900 border border-navy-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 shadow-inner"
              >
                {scenarios.map((s) => (
                  <option key={s.scenarioId} value={s.scenarioId} className="bg-navy-950 text-white">
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            {/* City Field (Fixed Bengaluru) */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-900 text-xs font-mono text-slate-300 border border-navy-800">
              <span className="font-bold text-white">City: Bengaluru</span>
              <span className="text-[10px] text-cyan-400">(198 BBMP wards)</span>
            </div>

            {/* Assumptions toggle */}
            <button
              type="button"
              onClick={() => setShowAssumptions(!showAssumptions)}
              className="flex items-center gap-1 text-xs font-mono font-semibold text-cyan-400 hover:text-cyan-300"
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
            className="flex items-center gap-2 px-4 py-2 bg-signal-blue hover:bg-signal-blue-hover disabled:opacity-50 text-navy-950 text-xs font-bold rounded-lg shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-transform active:scale-95"
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
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Synthetic scenario labels:</span>
                </h4>
                <ul className="space-y-1 text-slate-300 font-mono text-[11px]">
                  {currentScenario.syntheticLabels.map((lbl, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-purple-400">•</span>
                      <span>{lbl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 flex items-center gap-1.5 mb-2 font-mono">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Demand and network assumptions:</span>
                </h4>
                <ul className="space-y-1 text-slate-300 font-mono text-[11px]">
                  {currentScenario.demandAssumptions.map((assump, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-cyan-400">•</span>
                      <span>{assump}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Main Body: 3D Scene / Map + Timeline + Simulation Control Panel */}
        <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left/Center: 3D Digital Twin View or MapLibre & Timeline */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative h-[480px] w-full rounded-card overflow-hidden">
              {activeView === 'twin' ? (
                <Cascade3DDigitalTwin
                  timelineStep={timelineStep}
                  rainfallIntensityMm={rainfallIntensityMm}
                  isSimulating={isSimulating}
                  injectedDisruptions={injectedDisruptions}
                  injectedUnavailableFacilities={injectedUnavailableFacilities}
                  onDisruptRoad={toggleDisruptRoad}
                  onToggleFacility={toggleUnavailableFacility}
                />
              ) : (
                <InteractiveMap
                  is3D={true}
                  showOverlayPanels={true}
                  interactiveDisruption={true}
                  className="h-full w-full"
                />
              )}
            </div>

            {/* Scenario Timeline Controls */}
            <div className="bg-navy-950/90 border border-navy-800 rounded-xl p-3.5 text-white shadow-card backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTimelinePlaying(!isTimelinePlaying)}
                    className="w-8 h-8 rounded-lg bg-signal-blue hover:bg-signal-blue-hover text-navy-950 flex items-center justify-center transition-all shadow-[0_0_12px_rgba(0,229,255,0.3)]"
                    title={isTimelinePlaying ? 'Pause timeline' : 'Play timeline'}
                    aria-label={isTimelinePlaying ? 'Pause timeline' : 'Play timeline'}
                  >
                    {isTimelinePlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
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
                    <span className="text-xs font-bold text-white block font-mono">
                      {currentEvent?.timeIST || '18:20 IST'} — {currentEvent?.title}
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
                          ? 'bg-signal-blue text-navy-950'
                          : 'bg-navy-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Step Markers */}
              <div className="grid grid-cols-5 gap-1.5 mt-3 pt-2.5 border-t border-navy-850">
                {scenarioEvents.map((evt, idx) => (
                  <button
                    key={evt.stepId}
                    onClick={() => setTimelineStep(idx)}
                    className={`p-2 rounded-lg text-left transition-all ${
                      timelineStep === idx
                        ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-semibold shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                        : 'bg-navy-900/60 border border-navy-800 text-slate-400 hover:bg-navy-800'
                    }`}
                  >
                    <span className="text-[10px] font-mono block text-cyan-400">{evt.timeIST}</span>
                    <span className="text-[11px] line-clamp-1 text-slate-200">{evt.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Simulation Controls Panel + Cascade Progression List */}
          <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
            {/* Simulation Controls Panel */}
            <div className="bg-navy-950/90 border border-navy-700/80 rounded-xl p-4 space-y-4 shadow-glass backdrop-blur-md">
              <div className="flex items-center justify-between pb-2 border-b border-navy-800">
                <div className="flex items-center gap-2 font-bold text-xs text-white font-mono">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Simulation Control Panel</span>
                </div>
                <ProvenanceTag type="Synthetic scenario" size="sm" />
              </div>

              {/* Rainfall Slider (mm/h) */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Rainfall intensity:</span>
                  </span>
                  <span className="font-black text-cyan-400 font-mono tabular-nums text-sm">
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
                  className="w-full accent-cyan-400 cursor-pointer h-2 bg-navy-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                  <span>10 (Light)</span>
                  <span className="text-amber-400">65 (Cloudburst)</span>
                  <span className="text-risk-red">120 (Extreme)</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-navy-800 text-xs text-slate-300 font-mono">
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Road disruptions layer</span>
                  <input
                    type="checkbox"
                    checked={toggleRoads}
                    onChange={(e) => setToggleRoads(e.target.checked)}
                    className="accent-cyan-400 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span>Rerouting bypass paths</span>
                  <input
                    type="checkbox"
                    checked={toggleReroute}
                    onChange={(e) => setToggleReroute(e.target.checked)}
                    className="accent-cyan-400 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span>Infrastructure layers</span>
                  <input
                    type="checkbox"
                    checked={toggleInfra}
                    onChange={(e) => setToggleInfra(e.target.checked)}
                    className="accent-cyan-400 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span>Population layer (GHSL)</span>
                  <input
                    type="checkbox"
                    checked={togglePop}
                    onChange={(e) => setTogglePop(e.target.checked)}
                    className="accent-cyan-400 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
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
              <div className="pt-2.5 border-t border-navy-800">
                <div className="text-[11px] font-mono text-cyan-400 mb-2">
                  Manual contingency injections:
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => toggleDisruptRoad('road-ecospace-underpass')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
                      injectedDisruptions.includes('road-ecospace-underpass')
                        ? 'bg-risk-red text-white shadow-[0_0_12px_rgba(255,59,83,0.4)]'
                        : 'bg-navy-900 border border-navy-700 text-slate-300 hover:border-cyan-400'
                    }`}
                  >
                    <span>Click road to disrupt (Ecospace)</span>
                    <span className="text-[10px] font-mono">
                      {injectedDisruptions.includes('road-ecospace-underpass') ? 'DISRUPTED' : 'NORMAL'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleUnavailableFacility('fac-sakra-world-hospital')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
                      injectedUnavailableFacilities.includes('fac-sakra-world-hospital')
                        ? 'bg-amber-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                        : 'bg-navy-900 border border-navy-700 text-slate-300 hover:border-cyan-400'
                    }`}
                  >
                    <span>Mark facility unavailable (Sakra)</span>
                    <span className="text-[10px] font-mono">
                      {injectedUnavailableFacilities.includes('fac-sakra-world-hospital') ? 'ISOLATED' : 'CLEAR'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Cascade Side List: Animated Spread Progression */}
            <div className="bg-navy-950/90 border border-navy-700/80 rounded-xl p-4 shadow-glass backdrop-blur-md">
              <div className="flex items-center justify-between pb-2 border-b border-navy-800 mb-3">
                <div className="font-bold text-xs text-white font-mono">
                  Cascade progression ({timelineStep >= 3 ? '4/4' : `${timelineStep + 1}/4`})
                </div>
                <ProvenanceTag type="Model estimate" size="sm" />
              </div>

              {/* Before and After Count metric */}
              <div className="p-3 rounded-xl bg-navy-900/80 border border-navy-800 mb-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] font-mono">
                    Facilities reachable within 30 min:
                  </span>
                  <div className="font-bold mt-1 font-mono">
                    <span className="text-emerald-400">{initialReachable} before</span>
                    <span className="text-slate-500 mx-2">→</span>
                    <span className="text-risk-red">{currentReachable} after</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-risk-red/20 text-risk-red border border-risk-red/40 font-bold">
                  -{initialReachable - currentReachable} cut off
                </span>
              </div>

              {/* Animated sequence items */}
              <div className="space-y-2">
                {cascadeProgression.map((item) => {
                  const isTriggered = timelineStep >= item.activeAtStep;

                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isTriggered
                          ? 'bg-navy-900/90 border-cyan-500/40 shadow-xs'
                          : 'bg-navy-950/40 border-navy-800/40 opacity-40'
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-1 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px] font-mono">
                            {item.order}
                          </span>
                          <span className="text-xs font-bold text-white">{item.title}</span>
                        </div>
                        <RiskBadge level={item.severity} size="sm" />
                      </div>
                      <div className="text-xs font-semibold text-slate-200 pl-7">
                        {item.assetName}
                      </div>
                      <p className="text-[11px] text-slate-400 pl-7 mt-0.5 leading-snug">
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
