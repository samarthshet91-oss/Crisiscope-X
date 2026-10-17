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
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shadow-xs">
            <Settings className="w-4 h-4 text-signal-blue" />
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-ink tracking-tight">
            System Settings & Simulation Controls
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Configure runtime architecture verification, fault injection modes, and localization preferences.
        </p>
      </div>

      {/* Operational Mode Selection */}
      <div className="bg-card rounded-card p-5 shadow-card border border-slate-200/80 space-y-3">
        <h3 className="text-sm font-bold text-ink flex items-center gap-2">
          <Database className="w-4 h-4 text-signal-blue" />
          <span>Operational Mode</span>
        </h3>
        <p className="text-xs text-slate-500">
          Switches between documented mock fixture responses and real-time backend adapter calls.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {(['Mock data', 'Live simulation', 'Replay'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`p-3 rounded-xl border text-left transition-all ${
                mode === m
                  ? 'bg-signal-blue-light/50 border-signal-blue text-signal-blue font-bold shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs">{m}</span>
                {mode === m && <CheckCircle2 className="w-4 h-4 text-signal-blue" />}
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
      <div className="bg-card rounded-card p-5 shadow-card border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Model Status & Trust Gate Testing</span>
            </h3>
            <p className="text-xs text-slate-500">
              Test how the UI handles stale telemetry or model failures without hardcoded assertions.
            </p>
          </div>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
              modelStatus === 'ok'
                ? 'bg-emerald-50 text-risk-green'
                : modelStatus === 'failed'
                ? 'bg-red-50 text-risk-red'
                : 'bg-amber-50 text-amber-800'
            }`}
          >
            Current: {modelStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleStatusChange('ok')}
            className={`p-3 rounded-xl border text-left text-xs ${
              modelStatus === 'ok'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="font-bold">OK (All Fresh)</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Telemetry within 20m tolerance. Recommendations active.
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleStatusChange('degraded')}
            className={`p-3 rounded-xl border text-left text-xs ${
              modelStatus === 'degraded'
                ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="font-bold">Degraded (Partial Stale)</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Warning shown in decision strip; recommendations flagged.
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleStatusChange('failed')}
            className={`p-3 rounded-xl border text-left text-xs ${
              modelStatus === 'failed'
                ? 'bg-red-50 border-red-300 text-risk-red font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="font-bold">Failed (Stale &gt; 3h)</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Disables recommendations and states exact telemetry cause.
            </div>
          </button>
        </div>
      </div>

      {/* Hardware Architecture Verification */}
      <div className="bg-card rounded-card p-5 shadow-card border border-slate-200/80 space-y-3">
        <h3 className="text-sm font-bold text-ink flex items-center gap-2">
          <Cpu className="w-4 h-4 text-signal-blue" />
          <span>Runtime Architecture Telemetry</span>
        </h3>
        <p className="text-xs text-slate-500">
          The runtime badge reflects processingMetadata.runtimeArchitecture returned by the API.
        </p>

        <div className="flex items-center gap-3 pt-2">
          {(['s390x', 'x86_64', 'arm64'] as const).map((arch) => (
            <button
              key={arch}
              type="button"
              onClick={() => setRuntimeArchitecture(arch)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                runtimeArchitecture === arch
                  ? 'bg-signal-blue text-white shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {arch === 's390x' ? 'IBM LinuxONE (s390x)' : arch}
            </button>
          ))}
        </div>
      </div>

      {/* Language Preferences */}
      <div className="bg-card rounded-card p-5 shadow-card border border-slate-200/80 space-y-3">
        <h3 className="text-sm font-bold text-ink flex items-center gap-2">
          <Globe className="w-4 h-4 text-signal-blue" />
          <span>Language & Regionalization</span>
        </h3>
        <p className="text-xs text-slate-500">
          Full support for English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी) translations with native typography fallbacks.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => i18n.changeLanguage('en')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border ${
              i18n.language === 'en'
                ? 'bg-signal-blue text-white'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            English (en-IN)
          </button>
          <button
            type="button"
            onClick={() => i18n.changeLanguage('kn')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border ${
              i18n.language === 'kn'
                ? 'bg-signal-blue text-white'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            ಕನ್ನಡ (Kannada)
          </button>
          <button
            type="button"
            onClick={() => i18n.changeLanguage('hi')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border ${
              i18n.language === 'hi'
                ? 'bg-signal-blue text-white'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            हिन्दी (Hindi)
          </button>
        </div>
      </div>
    </div>
  );
};
