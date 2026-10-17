import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Play,
  GitFork,
  FlaskConical,
  Database,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Radar,
  Compass,
  AlertTriangle,
  Building2,
  Navigation,
} from 'lucide-react';
import { HeroRainCanvas } from './HeroRainCanvas';
import { DATASETS_CONFIG } from '../../config/datasets';
import { useAppStore } from '../../store/useAppStore';
import { ProvenanceTag } from '../../components/ProvenanceTag';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { startGuidedDemo } = useAppStore();

  const handleStartDemo = () => {
    startGuidedDemo();
    navigate('/console');
  };

  const coreDatasets = DATASETS_CONFIG.filter((d) => d.category === 'Core');
  const usefulDatasets = DATASETS_CONFIG.filter((d) => d.category === 'Useful additions');
  const optionalDatasets = DATASETS_CONFIG.filter((d) => d.category === 'Optional');

  return (
    <div className="min-h-screen bg-navy-950 text-white font-sans selection:bg-signal-blue/30 selection:text-white relative overflow-x-hidden">
      {/* Navigation Top Bar */}
      <header className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between relative z-30 border-b border-navy-800/80 backdrop-blur-md bg-navy-950/60 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-signal-blue flex items-center justify-center font-black text-xl text-navy-950 shadow-[0_0_20px_rgba(0,229,255,0.4)]">
            CX
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight block text-white flex items-center gap-2">
              Crisiscope X
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                v2.0
              </span>
            </span>
            <span className="text-[11px] text-slate-400 block -mt-0.5 font-medium">
              Bengaluru Urban Flood Risk Intelligence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleStartDemo}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-navy-900 border border-transparent hover:border-navy-700 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current text-cyan-400" />
            <span>Guided Demo (5 min)</span>
          </button>

          <Link
            to="/console"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-signal-blue hover:bg-signal-blue-hover text-navy-950 text-xs font-bold shadow-[0_0_25px_rgba(0,229,255,0.35)] transition-all active:scale-95 hover:shadow-[0_0_30px_rgba(0,229,255,0.5)]"
          >
            <span>Launch Command Centre</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* 1. Cinematic Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-6 overflow-hidden border-b border-navy-800/80">
        {/* Animated 3D Perspective Terrain, Telemetry Routes & Rain Layer */}
        <HeroRainCanvas />

        {/* Ambient Volumetric Lighting Sweeps */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/4 w-[450px] h-[280px] bg-risk-red/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 py-20">
          {/* Tactical Telemetry Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-navy-900/90 border border-cyan-500/30 text-slate-300 text-xs backdrop-blur-md shadow-[0_0_20px_rgba(0,229,255,0.15)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono text-cyan-300">DETECT → PREDICT → DECIDE → RESPOND</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">198 BBMP Wards Monitored</span>
          </div>

          {/* Animated Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white">
            See the Flood <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              Before It Happens.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Crisiscope X traces how a single flooded underpass cuts off trauma hospitals in Bengaluru, simulates downstream gridlock cascades, and compares counterfactual interventions so emergency dispatchers can act earlier.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/console"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-signal-blue hover:bg-signal-blue-hover text-navy-950 text-sm font-bold shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 group"
            >
              <span>Launch Command Centre</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/console/cascade"
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-navy-900/90 hover:bg-navy-850 border border-navy-700/80 hover:border-cyan-500/40 text-slate-200 text-sm font-semibold shadow-glass transition-all flex items-center justify-center gap-2 group backdrop-blur-md"
            >
              <GitFork className="w-4 h-4 text-cyan-400 transition-transform group-hover:rotate-12" />
              <span>Explore Flood Simulation</span>
            </Link>
          </div>

          {/* Provenance & Verification Guarantee Badges */}
          <div className="pt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-2 px-3 py-1 rounded-lg bg-navy-900/60 border border-navy-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-mono">IBM LinuxONE s390x verified</span>
            </span>
            <span className="flex items-center gap-2 px-3 py-1 rounded-lg bg-navy-900/60 border border-navy-800">
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300 font-mono">10 Bengaluru GIS datasets</span>
            </span>
            <span className="flex items-center gap-2 px-3 py-1 rounded-lg bg-navy-900/60 border border-navy-800">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-slate-300 font-mono">Zero made-up claims</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. Why Bengaluru Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto border-b border-navy-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs uppercase tracking-widest font-mono font-bold text-cyan-400">
            Topological Vulnerability
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Why Bengaluru?
          </h2>
          <p className="text-xs text-slate-400">
            Ridge-and-valley terrain where arterial underpasses become sudden lake catchments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-card bg-navy-900/80 border border-navy-700/80 shadow-glass space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="text-base font-bold text-white">Ridge-and-Valley Basins</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bengaluru drains through three primary lake cascade valleys: Vrishabhavathi, Koramangala-Challaghatta (K&C), and Hebbal. Intense convective rainfall quickly saturates primary rajakaluves.
            </p>
          </div>

          <div className="p-6 rounded-card bg-navy-900/80 border border-navy-700/80 shadow-glass space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 text-risk-red flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="text-base font-bold text-white">Ecospace Underpass Bottleneck</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When low-lying carriage underpasses on the Outer Ring Road flood, traffic back-propagates across feeder junctions within 25 minutes, paralyzing access to trauma centers.
            </p>
          </div>

          <div className="p-6 rounded-card bg-navy-900/80 border border-navy-700/80 shadow-glass space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="text-base font-bold text-white">Counterfactual Decision Speed</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Crisiscope X tests emergency rerouting protocols (HAL Old Airport Corridor diversion, dewatering pump prioritization) against an unmanaged baseline before dispatch is blocked.
            </p>
          </div>
        </div>
      </section>

      {/* 3. CascadeVision Showcase */}
      <section className="py-24 px-6 max-w-6xl mx-auto border-b border-navy-800/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-mono font-bold text-cyan-400 mb-2">
              <GitFork className="w-4 h-4" />
              <span>Signature 3D Feature</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              CascadeVision 3D Digital Twin
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl">
              Simulates topological delay propagation across municipal road networks and critical emergency access routes in real time.
            </p>
          </div>
          <Link
            to="/console/cascade"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-500/60 transition-all"
          >
            <span>Launch 3D Simulation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4-Step Sequence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-card bg-navy-900/90 border border-navy-700/80 space-y-3 hover:border-cyan-500/40 transition-colors shadow-glass">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm font-mono">
              1
            </div>
            <h3 className="text-sm font-bold text-white">Rainfall Surges</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Localized convective cloudburst logs 72 mm/h over Bellandur basin; stormwater canal reaches bankfull capacity.
            </p>
            <ProvenanceTag type="Observed" source="KSNDMC BLR-04" size="sm" />
          </div>

          <div className="p-5 rounded-card bg-navy-900/90 border border-navy-700/80 space-y-3 hover:border-red-500/40 transition-colors shadow-glass">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-risk-red flex items-center justify-center font-bold text-sm font-mono">
              2
            </div>
            <h3 className="text-sm font-bold text-white">A Road Floods</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Water accumulates in Ecospace underpass barrel, cutting bidirectional carriage on the Outer Ring Road.
            </p>
            <ProvenanceTag type="Synthetic scenario" size="sm" />
          </div>

          <div className="p-5 rounded-card bg-navy-900/90 border border-navy-700/80 space-y-3 hover:border-amber-500/40 transition-colors shadow-glass">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm font-mono">
              3
            </div>
            <h3 className="text-sm font-bold text-white">Routes Lengthen</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detour traffic spills onto narrow service roads; queues propagate to Kadubeesanahalli, adding +35 min delay.
            </p>
            <ProvenanceTag type="Model estimate" size="sm" />
          </div>

          <div className="p-5 rounded-card bg-navy-900/90 border border-navy-700/80 space-y-3 hover:border-purple-500/40 transition-colors shadow-glass">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm font-mono">
              4
            </div>
            <h3 className="text-sm font-bold text-white">Hospital Gate Isolated</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sakra World Hospital emergency ingress is severed from western approach; reachable facilities drop from 5 to 3.
            </p>
            <ProvenanceTag type="Model estimate" size="sm" />
          </div>
        </div>
      </section>

      {/* 4. Counterfactual Response Lab Preview */}
      <section className="py-24 px-6 max-w-6xl mx-auto border-b border-navy-800/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-mono font-bold text-cyan-400 mb-2">
              <FlaskConical className="w-4 h-4" />
              <span>Decision Optimization</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Counterfactual Response Lab
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl">
              Compares unmanaged baseline against proactive interventions with explainable rationale and auditable constraints.
            </p>
          </div>
          <Link
            to="/console/lab"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-500/60 transition-all"
          >
            <span>Open Response Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Matrix Preview */}
        <div className="bg-navy-900/90 rounded-card border border-navy-700/80 overflow-hidden shadow-glass">
          <div className="p-4 bg-navy-950/80 border-b border-navy-800 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200">
              Response Evaluation Matrix (Scenario #BLR-72B Outer Ring Road Cloudburst)
            </span>
            <ProvenanceTag type="Model estimate" size="sm" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-navy-800 text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                  <th className="p-4">Metric</th>
                  <th className="p-4 text-slate-400">Baseline (No Action)</th>
                  <th className="p-4 bg-cyan-500/10 border-l border-r border-cyan-500/40 text-white font-bold">
                    <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400 uppercase font-bold block mb-1">
                      <Sparkles className="w-3 h-3" /> Recommended
                    </span>
                    Alt A: HAL Corridor Reroute
                  </th>
                  <th className="p-4 text-slate-300">Alt B: Dewatering Pumps</th>
                  <th className="p-4 text-slate-300">Alt C: Facility Ingress Shift</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/80 text-slate-300">
                <tr>
                  <td className="p-4 font-semibold text-white">Avg Emergency Travel Time</td>
                  <td className="p-4 text-slate-400 tabular-nums">44 min</td>
                  <td className="p-4 bg-cyan-500/10 border-l border-r border-cyan-500/40 font-bold text-emerald-400 tabular-nums">
                    26 min (-18 min)
                  </td>
                  <td className="p-4 tabular-nums">34 min (-10 min)</td>
                  <td className="p-4 tabular-nums">38 min (-6 min)</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Facility Accessibility</td>
                  <td className="p-4 text-slate-400 tabular-nums">54%</td>
                  <td className="p-4 bg-cyan-500/10 border-l border-r border-cyan-500/40 font-bold text-emerald-400 tabular-nums">
                    88% (+34%)
                  </td>
                  <td className="p-4 tabular-nums">68% (+14%)</td>
                  <td className="p-4 tabular-nums">62% (+8%)</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Emergency Demand Served</td>
                  <td className="p-4 text-slate-400 tabular-nums">48%</td>
                  <td className="p-4 bg-cyan-500/10 border-l border-r border-cyan-500/40 font-bold text-emerald-400 tabular-nums">
                    84% (+36%)
                  </td>
                  <td className="p-4 tabular-nums">65% (+17%)</td>
                  <td className="p-4 tabular-nums">58% (+10%)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. Data Sources and Operational Boundaries (10 datasets) */}
      <section className="py-24 px-6 max-w-6xl mx-auto border-b border-navy-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs uppercase tracking-widest font-mono font-bold text-cyan-400">
            Data Transparency
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Data Sources and Operational Boundaries
          </h2>
          <p className="text-xs text-slate-400">
            Crisiscope X does not invent data. All 10 registered sources have transparent coverage limits and honest live statuses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Core */}
          <div className="bg-navy-900/90 border border-navy-700/80 rounded-card p-5 space-y-3 shadow-glass">
            <div className="flex items-center justify-between pb-2 border-b border-navy-800">
              <h3 className="font-bold text-sm text-white">Core Datasets</h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                Mandatory
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {coreDatasets.map((d) => (
                <li key={d.id} className="p-2.5 rounded-lg bg-navy-950/70 border border-navy-800">
                  <div className="font-semibold text-white">{d.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{d.attribution}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful additions */}
          <div className="bg-navy-900/90 border border-navy-700/80 rounded-card p-5 space-y-3 shadow-glass">
            <div className="flex items-center justify-between pb-2 border-b border-navy-800">
              <h3 className="font-bold text-sm text-white">Useful Additions</h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono">
                Historical
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {usefulDatasets.map((d) => (
                <li key={d.id} className="p-2.5 rounded-lg bg-navy-950/70 border border-navy-800">
                  <div className="font-semibold text-white">{d.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{d.attribution}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Optional */}
          <div className="bg-navy-900/90 border border-navy-700/80 rounded-card p-5 space-y-3 shadow-glass">
            <div className="flex items-center justify-between pb-2 border-b border-navy-800">
              <h3 className="font-bold text-sm text-white">Optional Sensors</h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700/60 text-slate-400 font-mono">
                Satellite / Grid
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {optionalDatasets.map((d) => (
                <li key={d.id} className="p-2.5 rounded-lg bg-navy-950/70 border border-navy-800">
                  <div className="font-semibold text-white">{d.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 italic">{d.limitInPlainLanguage}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 6. Pipeline Architecture */}
      <section className="py-24 px-6 max-w-6xl mx-auto border-b border-navy-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs uppercase tracking-widest font-mono font-bold text-cyan-400">
            Real-Time Engine
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            System Data Pipeline
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
          {[
            { step: '1. Ingest', label: 'Telemetry & GIS', desc: 'KSNDMC & BBMP feeds' },
            { step: '2. Validate', label: 'Trust Gate', desc: 'Freshness audit & flags' },
            { step: '3. Score', label: 'Risk Indices', desc: 'Hydraulic head modeling' },
            { step: '4. Cascade', label: 'Network Spread', desc: 'OSM topological delay' },
            { step: '5. Compare', label: 'Response Lab', desc: 'Counterfactual options' },
            { step: '6. Deliver', label: 'Decision Strip', desc: 'Explainable dispatch' },
          ].map((item) => (
            <div
              key={item.step}
              className="p-4 rounded-xl bg-navy-900/90 border border-navy-700/80 shadow-glass flex flex-col justify-between"
            >
              <span className="text-[10px] font-bold text-cyan-400 font-mono block">
                {item.step}
              </span>
              <div className="font-bold text-xs text-white my-1">{item.label}</div>
              <span className="text-[10px] text-slate-400 leading-tight">{item.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-12 px-6 max-w-7xl mx-auto text-xs text-slate-400 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-navy-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-signal-blue text-navy-950 flex items-center justify-center font-bold text-xs shadow-[0_0_12px_rgba(0,229,255,0.4)]">
              CX
            </div>
            <span className="font-bold text-white">Crisiscope X — AI for a Safer Tomorrow</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/console" className="hover:text-cyan-400 transition-colors">
              Command Centre
            </Link>
            <Link to="/console/cascade" className="hover:text-cyan-400 transition-colors">
              CascadeVision
            </Link>
            <Link to="/console/evidence" className="hover:text-cyan-400 transition-colors">
              Evidence & Verification
            </Link>
            <Link to="/console/settings" className="hover:text-cyan-400 transition-colors">
              Settings
            </Link>
          </div>
        </div>

        {/* Prototype Disclaimer */}
        <p className="leading-relaxed text-slate-400 max-w-4xl text-[11px]">
          Crisiscope X is a prototype. Scenario events are synthetic and risk scores are estimates. It does not show live street-level flood depth, real road closures or real hospital capacity, and it is not an emergency warning system.
        </p>

        {/* Emergency numbers and open licensing */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-400 pt-2 text-[11px]">
          <div>
            In a real emergency in Bengaluru, call <strong className="text-white font-mono">112</strong> (disaster management) or <strong className="text-white font-mono">108</strong> (ambulance).
          </div>
          <div>
            Data: © OpenStreetMap contributors (ODbL), BBMP & KSRSAC (GODL), NASA GPM, Copernicus EMS.
          </div>
        </div>
      </footer>
    </div>
  );
};
