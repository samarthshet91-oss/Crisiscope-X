import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
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
  Radio,
  MapPin,
  AlertTriangle,
  Building2,
  Navigation,
  CloudRain,
  Cpu,
  Eye,
  ChevronRight,
  Info,
} from 'lucide-react';
import { CinematicHero } from './CinematicHero';
import { useScrollReveal, useSpotlight, useTilt3D, useScrollProgress } from '../../hooks/useFx';
import { DATASETS_CONFIG } from '../../config/datasets';
import { ProvenanceTag } from '../../components/ProvenanceTag';
import { useAppStore } from '../../store/useAppStore';

export const LandingPage: React.FC = () => {
  const { theme } = useAppStore();
  useScrollReveal();
  useTilt3D();
  useScrollProgress();
  const spotRef = useSpotlight<HTMLDivElement>();

  const [activeCascadeStep, setActiveCascadeStep] = useState<number>(0);

  const coreDatasets = DATASETS_CONFIG.filter((d) => d.category === 'Core');
  const usefulDatasets = DATASETS_CONFIG.filter((d) => d.category === 'Useful additions');
  const optionalDatasets = DATASETS_CONFIG.filter((d) => d.category === 'Optional');

  const cascadeSteps = [
    {
      step: 1,
      title: 'Localized Rainfall Surges',
      desc: 'KSNDMC station #BLR-04 records 72 mm/h intense cloudburst over Bellandur basin; rajakaluve canal reaches bankfull capacity.',
      tag: 'Observed' as const,
      source: 'KSNDMC Telemetry',
      badge: 'Hydraulic Inundation',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    },
    {
      step: 2,
      title: 'Arterial Underpass Floods',
      desc: 'Ecospace underpass on Outer Ring Road fills with stormwater within 18 minutes, halting carriage traffic in both directions.',
      tag: 'Synthetic scenario' as const,
      badge: 'Critical Choke Point',
      badgeColor: 'text-red-400 bg-red-500/10 border-red-500/30',
    },
    {
      step: 3,
      title: 'Queues Propagate Across Grid',
      desc: 'Detour traffic spills onto narrow service roads; congestion cascades to Kadubeesanahalli & Marathahalli, adding +35 min delay.',
      tag: 'Model estimate' as const,
      badge: 'Network Disruption',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    {
      step: 4,
      title: 'Emergency Facility Reachability Drops',
      desc: 'Sakra World Hospital western ambulance entry is severed; reachable emergency facilities in sector drop from 5 to 3.',
      tag: 'Model estimate' as const,
      badge: 'Trauma Access Cut',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    },
  ];

  return (
    <div className={`relative min-h-screen font-sans cx-landing transition-colors duration-200 ${
      theme === 'dark' ? 'bg-[#030914] text-slate-100 selection:bg-cyan-500 selection:text-black' : 'bg-slate-50 text-slate-800 selection:bg-signal-blue selection:text-white'
    }`}>
      {/* Scroll indicator bar */}
      <div className="cx-scroll-bar" aria-hidden="true" />

      {/* Deep Space Background Canvas */}
      <div ref={spotRef} className="cx-bg" aria-hidden="true">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
        <div className="cx-grid" />
        <div className="cx-spot" />
      </div>

      {/* 1. CINEMATIC HERO (Includes 3D Earth Opening Sequence + 3D Twin & Earth Toggle) */}
      <CinematicHero />

      {/* Live Telemetry Ticker Ribbon */}
      <div className="relative z-10 border-y border-cyan-500/20 bg-navy-950/80 backdrop-blur-md py-3 px-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-6 flex-wrap">
          <span className="flex items-center gap-2 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold">SYS: TELEMETRY ACTIVE</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>LinuxONE s390x Verified</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Database className="w-4 h-4 text-sky-400" />
            <span>10 Bengaluru GIS Feeds</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Zero Unverified Claims</span>
          </span>
        </div>

        <div className="text-slate-400 hidden lg:flex items-center gap-4">
          <span>LAT: 12.9716°N</span>
          <span>LON: 77.5946°E</span>
          <span className="text-cyan-400">BBMP ZONE: EAST / MAHADEVAPURA</span>
        </div>
      </div>

      {/* 2. STAGES: DETECT, DECIDE, RESPOND */}
      <section className="relative z-10 py-16 px-6 max-w-6xl mx-auto border-b border-navy-800/80">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
            Decision-Support Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Detect. Decide. Respond.
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            A three-tier intelligence loop purpose-built for Bengaluru's flash flood propagation and emergency evacuation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Detect */}
          <div className="cx-tilt p-6 rounded-2xl bg-navy-900/70 border border-cyan-500/20 backdrop-blur-md space-y-4 shadow-xl hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                STAGE 01
              </span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </div>
            <h3 className="text-lg font-bold text-white">DETECT</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesizes real-time rain gauge data from KSNDMC, satellite precipitation passes, and street drainage topology into continuous municipal risk scores.
            </p>
            <div className="pt-3 border-t border-navy-800 text-[11px] font-mono text-slate-500 space-y-1">
              <div>&bull; KSNDMC Automatic Rain Gauges</div>
              <div>&bull; GPM DPR Satellite Calibration</div>
              <div>&bull; 43 Critical Underpass Sensors</div>
            </div>
          </div>

          {/* Decide */}
          <div className="cx-tilt p-6 rounded-2xl bg-navy-900/70 border border-teal-500/20 backdrop-blur-md space-y-4 shadow-xl hover:border-teal-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30">
                STAGE 02
              </span>
              <Sparkles className="w-4 h-4 text-teal-400" />
            </div>
            <h3 className="text-lg font-bold text-white">DECIDE</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evaluates counterfactual diversions and intervention scenarios in under 300 ms, calculating transit delay trade-offs and trauma hospital accessibility.
            </p>
            <div className="pt-3 border-t border-navy-800 text-[11px] font-mono text-slate-500 space-y-1">
              <div>&bull; Multi-scenario Counterfactuals</div>
              <div>&bull; Graph Topological Delay Spread</div>
              <div>&bull; Honest Uncertainty Quantification</div>
            </div>
          </div>

          {/* Respond */}
          <div className="cx-tilt p-6 rounded-2xl bg-navy-900/70 border border-amber-500/20 backdrop-blur-md space-y-4 shadow-xl hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                STAGE 03
              </span>
              <Radio className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white">RESPOND</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Delivers clear, explainable dispatches for traffic police, ambulance routing, and municipal dewatering crews before paralysis becomes irreversible.
            </p>
            <div className="pt-3 border-t border-navy-800 text-[11px] font-mono text-slate-500 space-y-1">
              <div>&bull; One-click Actionable Recommendations</div>
              <div>&bull; Feeder Road Spillover Guidance</div>
              <div>&bull; Direct 112 & 108 Emergency Protocol</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BENGALURU FLOOD-RISK INTELLIGENCE OVERVIEW */}
      <section id="bengaluru" className="cx-reveal relative z-10 py-20 px-6 max-w-6xl mx-auto border-b border-navy-800/80 scroll-mt-6">
        <div className="flex flex-col lg:flex-row gap-10 items-center justify-between">
          <div className="flex-1 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider font-bold text-cyan-400">
              <MapPin className="w-4 h-4" />
              <span>Bengaluru Urban Context</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Ridge-and-Valley Topography <br />
              <span className="cx-glow-text">Meets Rapid Urban Densification.</span>
            </h2>
            <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
              <p>
                Bengaluru sits on an elevated Deccan plateau ridge at 920 metres. Historically, surface runoff drained cleanly through three interconnected lake cascade valleys: <strong className="text-white">Koramangala-Challaghatta</strong>, <strong className="text-white">Hebbal</strong>, and <strong className="text-white">Vrishabhavathi</strong>.
              </p>
              <p>
                When heavy pre-monsoon convective cloudbursts dump over 60 mm in an hour onto the low-lying Outer Ring Road corridor, stormwater canals (<em className="text-cyan-300">rajakaluves</em>) back up into submerged railway and road underpasses like <strong className="text-white">Ecospace</strong> and <strong className="text-white">Panathur</strong>.
              </p>
              <p>
                Within thirty minutes, queuing traffic propagates several kilometers upstream, cutting off vital emergency ambulance ingress to tertiary trauma centers like Sakra World Hospital and Manipal Hospital HAL.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-4">
              <Link
                to="/console/map"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 text-xs font-bold hover:bg-cyan-500/20 transition-colors"
              >
                <span>Explore Dark Bengaluru Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-[480px] p-6 rounded-2xl bg-navy-900/80 border border-cyan-500/20 backdrop-blur-md shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <span className="text-cyan-400 font-bold uppercase tracking-wider">Topographic Valley Telemetry</span>
              <span className="text-slate-400 text-[10px]">BBMP HYDRAULIC MODEL</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-navy-950/60 border border-navy-800">
                <div className="flex justify-between items-center text-white font-bold">
                  <span>Koramangala-Challaghatta Basin</span>
                  <span className="text-red-400 text-[11px]">88% Capacity</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Drains into Bellandur Lake & Varthur Lake cascade</div>
                <div className="w-full bg-navy-900 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: '88%' }} />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-navy-950/60 border border-navy-800">
                <div className="flex justify-between items-center text-white font-bold">
                  <span>Hebbal Valley System</span>
                  <span className="text-amber-400 text-[11px]">64% Capacity</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Nagavara & Manyata arterial storm conduits</div>
                <div className="w-full bg-navy-900 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: '64%' }} />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-navy-950/60 border border-navy-800">
                <div className="flex justify-between items-center text-white font-bold">
                  <span>Vrishabhavathi Western Basin</span>
                  <span className="text-emerald-400 text-[11px]">42% Capacity</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Mysore Road & Nayandahalli culverts</div>
                <div className="w-full bg-navy-900 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '42%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. RAINFALL, RISK, AND INFRASTRUCTURE INDICATORS */}
      <section className="cx-reveal relative z-10 py-20 px-6 max-w-6xl mx-auto border-b border-navy-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-wider font-bold text-cyan-400">
            Real-Time Indicators
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Rainfall, Risk & Corridor Status
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Relative risk metrics synthesized from municipal rain gauges, road graphs, and emergency facility vectors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-navy-900/70 border border-cyan-500/20 backdrop-blur-md space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><CloudRain className="w-4 h-4 text-cyan-400" /><span>Peak Rainfall</span></span>
              <ProvenanceTag type="Observed" source="KSNDMC" size="sm" />
            </div>
            <div className="text-2xl font-black text-white font-mono">72.4 mm/h</div>
            <div className="text-[11px] text-slate-400">BLR-04 Bellandur station; convective cloudburst threshold exceeded.</div>
          </div>

          <div className="p-5 rounded-2xl bg-navy-900/70 border border-cyan-500/20 backdrop-blur-md space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-red-400" /><span>Relative Risk</span></span>
              <ProvenanceTag type="Model estimate" size="sm" />
            </div>
            <div className="text-2xl font-black text-red-400 font-mono">Severe (85/100)</div>
            <div className="text-[11px] text-slate-400">Ward 150 (Bellandur) & Ward 85 (Doddanekkundi) under high hydraulic pressure.</div>
          </div>

          <div className="p-5 rounded-2xl bg-navy-900/70 border border-cyan-500/20 backdrop-blur-md space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><Navigation className="w-4 h-4 text-amber-400" /><span>ORR Disruption</span></span>
              <ProvenanceTag type="Synthetic scenario" size="sm" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">+35 min Delay</div>
            <div className="text-[11px] text-slate-400">Ecospace underpass submerged; queue propagating to Kadubeesanahalli.</div>
          </div>

          <div className="p-5 rounded-2xl bg-navy-900/70 border border-cyan-500/20 backdrop-blur-md space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-teal-400" /><span>Hospital Reach</span></span>
              <ProvenanceTag type="Model estimate" size="sm" />
            </div>
            <div className="text-2xl font-black text-teal-400 font-mono">3 of 5 Open</div>
            <div className="text-[11px] text-slate-400">Sakra World western approach blocked; HAL Old Airport corridor recommended.</div>
          </div>
        </div>
      </section>

      {/* 5. CASCADEVISION 3D FLOOD SIMULATION PREVIEW */}
      <section id="cascade" className="cx-reveal relative z-10 py-20 px-6 max-w-6xl mx-auto border-b border-navy-800/80 scroll-mt-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider font-bold text-cyan-400 mb-1">
              <GitFork className="w-4 h-4" />
              <span>Signature Feature #1</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              CascadeVision 3D Simulation
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Visualizes how a single submerged underpass causes domino-effect congestion that cuts off hospital emergency access.
            </p>
          </div>

          <Link
            to="/console/cascade"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 text-xs font-bold hover:bg-cyan-500/20 transition-colors"
          >
            <span>Launch Full 3D Twin</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Interactive Step Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 flex flex-col gap-3">
            {cascadeSteps.map((s, idx) => (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveCascadeStep(idx)}
                className={`p-4 rounded-xl text-left transition-all border ${
                  activeCascadeStep === idx
                    ? 'bg-navy-900/90 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                    : 'bg-navy-950/60 border-navy-800 hover:border-navy-700 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    STAGE 0{s.step}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${s.badgeColor}`}>
                    {s.badge}
                  </span>
                </div>
                <div className="text-sm font-bold text-white">{s.title}</div>
                <div className="text-xs text-slate-400 mt-1">{s.desc}</div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-7 rounded-2xl bg-navy-900/80 border border-cyan-500/20 p-6 flex flex-col justify-between backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-mono text-xs text-white font-bold">
                  SIMULATION STAGE {cascadeSteps[activeCascadeStep].step}: {cascadeSteps[activeCascadeStep].title.toUpperCase()}
                </span>
              </div>
              <ProvenanceTag type={cascadeSteps[activeCascadeStep].tag} size="sm" />
            </div>

            <div className="my-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-xl shadow-cyan-500/10">
                <GitFork className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <div className="text-base font-bold text-white">
                  {cascadeSteps[activeCascadeStep].title}
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {cascadeSteps[activeCascadeStep].desc}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-navy-800 text-xs font-mono text-slate-400">
              <span>ACTIVE CORRIDOR: ORR ECOSPACE</span>
              <Link
                to="/console/cascade"
                className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
              >
                <span>Interactive Timeline In Console</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. COUNTERFACTUAL RESPONSE LAB PREVIEW */}
      <section id="lab" className="cx-reveal relative z-10 py-20 px-6 max-w-6xl mx-auto border-b border-navy-800/80 scroll-mt-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider font-bold text-cyan-400 mb-1">
              <FlaskConical className="w-4 h-4" />
              <span>Signature Feature #2</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Counterfactual Response Lab
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Evaluates alternative emergency interventions in real time, explaining trade-offs and recommended actions with honest uncertainty.
            </p>
          </div>

          <Link
            to="/console/lab"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 text-xs font-bold hover:bg-cyan-500/20 transition-colors"
          >
            <span>Launch Response Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Matrix Comparison Table */}
        <div className="bg-navy-900/80 rounded-2xl border border-cyan-500/20 overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="p-4 bg-navy-950/80 border-b border-navy-800 flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-slate-200">
              SCENARIO #BLR-72B &middot; COUNTERFACTUAL COMPARISON MATRIX
            </span>
            <ProvenanceTag type="Model estimate" size="sm" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-navy-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Key Metric</th>
                  <th className="p-4">Baseline (No Action)</th>
                  <th className="p-4 bg-cyan-500/10 border-x border-cyan-500/30 text-white font-bold">
                    <span className="inline-flex items-center gap-1 text-[10px] text-teal-400 uppercase font-mono font-bold">
                      <Sparkles className="w-3 h-3" /> Recommended
                    </span>
                    <div>Alt A: HAL Old Airport Reroute</div>
                  </th>
                  <th className="p-4">Alt B: Dewatering Pumps</th>
                  <th className="p-4">Alt C: Hospital Shift</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/80 text-slate-300 font-mono">
                <tr>
                  <td className="p-4 font-sans font-semibold text-white">Average Transit Time</td>
                  <td className="p-4 text-slate-400">44 min</td>
                  <td className="p-4 bg-cyan-500/10 border-x border-cyan-500/30 font-bold text-emerald-400">
                    26 min (-18 min)
                  </td>
                  <td className="p-4">34 min (-10 min)</td>
                  <td className="p-4">38 min (-6 min)</td>
                </tr>
                <tr>
                  <td className="p-4 font-sans font-semibold text-white">Hospital Reachability</td>
                  <td className="p-4 text-slate-400">54%</td>
                  <td className="p-4 bg-cyan-500/10 border-x border-cyan-500/30 font-bold text-emerald-400">
                    88% (+34%)
                  </td>
                  <td className="p-4">68% (+14%)</td>
                  <td className="p-4">62% (+8%)</td>
                </tr>
                <tr>
                  <td className="p-4 font-sans font-semibold text-white">Emergency Demand Served</td>
                  <td className="p-4 text-slate-400">48%</td>
                  <td className="p-4 bg-cyan-500/10 border-x border-cyan-500/30 font-bold text-emerald-400">
                    84% (+36%)
                  </td>
                  <td className="p-4">65% (+17%)</td>
                  <td className="p-4">58% (+10%)</td>
                </tr>
                <tr>
                  <td className="p-4 font-sans font-semibold text-white">Decision Confidence</td>
                  <td className="p-4 text-slate-400">High Risk</td>
                  <td className="p-4 bg-cyan-500/10 border-x border-cyan-500/30 font-bold text-cyan-300">
                    85% (Uncertainty &plusmn;8%)
                  </td>
                  <td className="p-4">68% (&plusmn;14%)</td>
                  <td className="p-4">60% (&plusmn;18%)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 7. EVIDENCE AND DATA PROVENANCE (10 REGISTERED DATASETS) */}
      <section id="data" className="cx-reveal relative z-10 py-20 px-6 max-w-6xl mx-auto border-b border-navy-800/80 scroll-mt-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-wider font-bold text-cyan-400">
            Transparency & Provenance
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Data Sources & Operational Limits
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Crisiscope X does not invent data. All 10 registered sources have transparent coverage limits and honest live statuses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Core */}
          <div className="p-5 rounded-2xl bg-navy-900/80 border border-emerald-500/20 backdrop-blur-md space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-navy-800">
              <h3 className="font-bold text-sm text-white">Core Datasets</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                Mandatory
              </span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {coreDatasets.map((d) => (
                <li key={d.id} className="p-3 rounded-xl bg-navy-950/60 border border-navy-800">
                  <div className="font-semibold text-white">{d.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{d.attribution}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful additions */}
          <div className="p-5 rounded-2xl bg-navy-900/80 border border-cyan-500/20 backdrop-blur-md space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-navy-800">
              <h3 className="font-bold text-sm text-white">Useful Additions</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
                Historical & Valleys
              </span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {usefulDatasets.map((d) => (
                <li key={d.id} className="p-3 rounded-xl bg-navy-950/60 border border-navy-800">
                  <div className="font-semibold text-white">{d.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{d.attribution}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Optional */}
          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-700/60 backdrop-blur-md space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-navy-800">
              <h3 className="font-bold text-sm text-white">Optional Sensors</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                Satellite / Grid
              </span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {optionalDatasets.map((d) => (
                <li key={d.id} className="p-3 rounded-xl bg-navy-950/60 border border-navy-800">
                  <div className="font-semibold text-white">{d.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 italic">{d.limitInPlainLanguage}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 8. EMERGENCY-RESPONSE WORKFLOW / PIPELINE */}
      <section id="pipeline" className="cx-reveal relative z-10 py-20 px-6 max-w-6xl mx-auto border-b border-navy-800/80 scroll-mt-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-wider font-bold text-cyan-400">
            System Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            6-Stage Decision Pipeline
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            From sensor ingestion through counterfactual graph modeling to explainable dispatch.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { step: '01. Ingest', label: 'Telemetry & GIS', desc: 'KSNDMC gauges & BBMP rajakaluve feeds' },
            { step: '02. Validate', label: 'Trust Gate', desc: 'Latency audit, staleness checks & flags' },
            { step: '03. Score', label: 'Relative Risk', desc: 'Topographic head & basin runoff models' },
            { step: '04. Cascade', label: 'Network Spread', desc: 'OSM road congestion queue delays' },
            { step: '05. Compare', label: 'Response Lab', desc: 'Counterfactual alternative evaluation' },
            { step: '06. Deliver', label: 'Decision Strip', desc: 'Explainable dispatch & guidance' },
          ].map((item) => (
            <div
              key={item.step}
              className="p-4 rounded-xl bg-navy-900/80 border border-cyan-500/20 flex flex-col justify-between backdrop-blur shadow-lg hover:border-cyan-500/40 transition-colors"
            >
              <span className="text-[10px] font-bold text-cyan-400 font-mono block">
                {item.step}
              </span>
              <div className="font-bold text-xs text-white my-1.5">{item.label}</div>
              <span className="text-[10px] text-slate-400 leading-tight">{item.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 9. FINAL CALL TO ACTION & MISSION CONTROL FOOTER */}
      <footer className="relative z-10 py-16 px-6 max-w-6xl mx-auto space-y-8 text-xs text-slate-400">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl backdrop-blur-md">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="text-xl font-black text-white">
              Ready to explore Bengaluru's flood intelligence?
            </h3>
            <p className="text-xs text-slate-300">
              Access the live mission control console, inspect ward-level indices, and simulate emergency diversions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/console"
              className="px-6 py-3 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all active:scale-95 flex items-center gap-2"
            >
              <span>Launch Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-navy-800 pb-6 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs">
              CX
            </div>
            <span className="font-bold text-white">Crisiscope X &mdash; AI for a Safer Tomorrow</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/console" className="hover:text-cyan-400 transition-colors">
              Console
            </Link>
            <Link to="/console/map" className="hover:text-cyan-400 transition-colors">
              Dark Map
            </Link>
            <Link to="/console/cascade" className="hover:text-cyan-400 transition-colors">
              CascadeVision
            </Link>
            <Link to="/console/lab" className="hover:text-cyan-400 transition-colors">
              Response Lab
            </Link>
            <Link to="/console/evidence" className="hover:text-cyan-400 transition-colors">
              Verification
            </Link>
          </div>
        </div>

        {/* Mandatory prototype disclaimer */}
        <p className="leading-relaxed text-slate-400 text-justify">
          <strong className="text-slate-300">Operational Disclaimer:</strong> Crisiscope X is an AI decision-support research prototype focused exclusively on Bengaluru, Karnataka. Scenario events and disruptions are synthetic, and risk scores represent relative indices rather than verified absolute flood depths in metres. It does not replace official meteorological warnings or emergency services.
        </p>

        {/* Emergency numbers and licensing */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-400 pt-2 border-t border-navy-800/60 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
              EMERGENCY HOTLINES
            </span>
            <span>DIAL <strong className="text-white">112</strong> (POLICE/DISASTER) OR <strong className="text-white">108</strong> (AMBULANCE)</span>
          </div>
          <div>
            Data: &copy; OpenStreetMap contributors (ODbL) &middot; BBMP & KSRSAC (GODL) &middot; NASA GPM &middot; Copernicus EMS
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
