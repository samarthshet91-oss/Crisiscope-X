import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  Cpu,
  Database,
  Sliders,
  Globe,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../api';

export const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    mode,
    setMode,
    modelStatus,
    setModelStatus,
    runtimeArchitecture,
    setRuntimeArchitecture,
    loadAllData,
  } = useAppStore();

  const handleStatusChange = (status: 'ok' | 'degraded' | 'failed') => {
    if (status === 'failed') {
      setModelStatus(
        'failed',
        'KSNDMC rainfall is 3 hours old. Recommendations are paused until it updates.'
      );
    } else if (status === 'degraded') {
      setModelStatus(
        'degraded',
        'Intermittent sensor dropouts detected; historical rainfall fallback active.'
      );
    } else {
      setModelStatus('ok');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.25)]">
            <Settings className="w-4 h-4" />
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight">
            System Settings & Simulation Controls
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Configure runtime architecture verification, fault injection modes, and localization preferences.
        </p>
      </div>

      {/* Operational Mode Selection */}
      <div className="bg-navy-900/90 rounded-card p-5 shadow-glass border border-navy-700/80 space-y-3 backdrop-blur-md">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Operational Mode</span>
        </h3>
        <p className="text-xs text-slate-400">
          Switches between documented mock fixture responses and real-time backend adapter calls.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono">
          {(['Mock data', 'Live simulation', 'Replay'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                mode === m
                  ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                  : 'bg-navy-950/70 border-navy-800 text-slate-400 hover:text-white hover:border-navy-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs">{m}</span>
                {mode === m && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
              </div>
              <span className="text-[10px] text-slate-500 font-normal mt-1 block">
                {m === 'Mock data'
                  ? 'Pure offline mock fixtures (verified)'
                  : m === 'Live simulation'
                  ? 'Active synthetic scenario stream'
                  : 'Historical incident replay playback'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Fault Injection & Model Status (Test Error Handling & Trust Gate) */}
      <div className="bg-navy-900/90 rounded-card p-5 shadow-glass border border-navy-700/80 space-y-3 backdrop-blur-md">
        <div className="flex items-center justify-between pb-2 border-b border-navy-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Model Status & Trust Gate Testing</span>
            </h3>
            <p className="text-xs text-slate-400">
              Test how the UI handles stale telemetry or model failures without hardcoded assertions.
            </p>
          </div>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-mono uppercase ${
              modelStatus === 'ok'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : modelStatus === 'failed'
                ? 'bg-risk-red/20 text-risk-red border border-risk-red/40 animate-pulse'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            Current: {modelStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          <button
            type="button"
            onClick={() => handleStatusChange('ok')}
            className={`p-3.5 rounded-xl border text-left text-xs transition-all ${
              modelStatus === 'ok'
                ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-navy-950/70 border-navy-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="font-bold text-white">OK (All Fresh)</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Telemetry within 20m tolerance. Recommendations active.
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleStatusChange('degraded')}
            className={`p-3.5 rounded-xl border text-left text-xs transition-all ${
              modelStatus === 'degraded'
                ? 'bg-amber-500/15 border-amber-400 text-amber-300 font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'bg-navy-950/70 border-navy-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="font-bold text-white">Degraded (Partial Stale)</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Warning shown in decision strip; recommendations flagged.
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleStatusChange('failed')}
            className={`p-3.5 rounded-xl border text-left text-xs transition-all ${
              modelStatus === 'failed'
                ? 'bg-risk-red/15 border-risk-red text-risk-red font-bold shadow-[0_0_12px_rgba(255,59,83,0.3)]'
                : 'bg-navy-950/70 border-navy-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="font-bold text-white">Failed (Stale &gt; 3h)</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Disables recommendations and states exact telemetry cause.
            </div>
          </button>
        </div>
      </div>

      {/* Hardware Architecture Verification */}
      <div className="bg-navy-900/90 rounded-card p-5 shadow-glass border border-navy-700/80 space-y-3 backdrop-blur-md">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Runtime Architecture Telemetry</span>
        </h3>
        <p className="text-xs text-slate-400">
          The runtime badge reflects processingMetadata.runtimeArchitecture returned by the API.
        </p>

        <div className="flex items-center gap-3 pt-2 font-mono">
          {(['s390x', 'x86_64', 'arm64'] as const).map((arch) => (
            <button
              key={arch}
              type="button"
              onClick={() => setRuntimeArchitecture(arch)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                runtimeArchitecture === arch
                  ? 'bg-signal-blue text-navy-950 font-bold shadow-[0_0_15px_rgba(0,229,255,0.35)]'
                  : 'bg-navy-950 border-navy-800 text-slate-400 hover:text-white'
              }`}
            >
              {arch === 's390x' ? 'IBM LinuxONE (s390x)' : arch}
            </button>
          ))}
        </div>
      </div>

      {/* Language Preferences */}
      <div className="bg-navy-900/90 rounded-card p-5 shadow-glass border border-navy-700/80 space-y-3 backdrop-blur-md">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Language & Regionalization</span>
        </h3>
        <p className="text-xs text-slate-400">
          Full support for English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी) translations with native typography fallbacks.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => i18n.changeLanguage('en')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              i18n.language === 'en'
                ? 'bg-signal-blue text-navy-950 font-bold shadow-[0_0_15px_rgba(0,229,255,0.35)]'
                : 'bg-navy-950 border-navy-800 text-slate-400 hover:text-white'
            }`}
          >
            English (en-IN)
          </button>
          <button
            type="button"
            onClick={() => i18n.changeLanguage('kn')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              i18n.language === 'kn'
                ? 'bg-signal-blue text-navy-950 font-bold shadow-[0_0_15px_rgba(0,229,255,0.35)]'
                : 'bg-navy-950 border-navy-800 text-slate-400 hover:text-white'
            }`}
          >
            ಕನ್ನಡ (Kannada)
          </button>
          <button
            type="button"
            onClick={() => i18n.changeLanguage('hi')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              i18n.language === 'hi'
                ? 'bg-signal-blue text-navy-950 font-bold shadow-[0_0_15px_rgba(0,229,255,0.35)]'
                : 'bg-navy-950 border-navy-800 text-slate-400 hover:text-white'
            }`}
          >
            हिन्दी (Hindi)
          </button>
        </div>
      </div>
    </div>
  );
};
