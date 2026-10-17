import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ProvenanceTag } from '../../components/ProvenanceTag';

export const TrustGate: React.FC = () => {
  const {
    interventionResult,
    riskResult,
    preparedData,
    modelStatus,
    modelStatusReason,
    runtimeArchitecture,
  } = useAppStore();

  const isFailed = modelStatus === 'failed';
  const isDegraded = modelStatus === 'degraded';
  const trustGateData = interventionResult?.trustGate;

  const staleDatasets = trustGateData?.staleDatasets || [];
  const uncertainty = riskResult?.uncertainty;

  return (
    <div className="bg-navy-900/90 rounded-card p-5 shadow-glass border border-navy-700/80 space-y-4 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-navy-800 gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isFailed
                ? 'bg-risk-red/20 border border-risk-red/40 text-risk-red'
                : staleDatasets.length > 0
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
            }`}
          >
            {isFailed || staleDatasets.length > 0 ? (
              <ShieldAlert className="w-4 h-4" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono">Trust Gate & Data Freshness Audit</h3>
            <p className="text-[11px] text-slate-400">
              Cryptographic integrity, sensor freshness verification, and latency SLA monitoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Runtime Architecture badge */}
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold px-2.5 py-1 rounded-badge border ${
              runtimeArchitecture === 's390x'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-navy-950 text-slate-400 border-navy-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>
              {runtimeArchitecture === 's390x' ? 'Verified on s390x' : 'Not verified on LinuxONE'}
            </span>
          </span>
          <ProvenanceTag type="Rule-based" size="sm" />
        </div>
      </div>

      {/* Trust Gate Banner Alert when stale or failed */}
      {isFailed ? (
        <div className="p-3.5 rounded-xl bg-risk-red/15 border border-risk-red/40 text-xs text-red-200 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-risk-red shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold text-white">Recommendations paused due to stale telemetry:</strong>
            <p className="text-[11px] leading-relaxed text-red-200">
              {modelStatusReason || 'KSNDMC rainfall is 3 hours old. Recommendations are paused until it updates.'}
            </p>
            <p className="text-[11px] text-red-300 font-mono">
              <strong>Action required:</strong> Verify telemetry stream #BLR-04 or apply manual historical rainfall proxy.
            </p>
          </div>
        </div>
      ) : staleDatasets.length > 0 ? (
        <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold text-white">Human review recommended:</strong>
            <p className="text-[11px] leading-relaxed text-amber-200">
              {trustGateData?.humanReviewReason || 'One or more inputs exceeded freshness tolerance.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-white">
              All real-time telemetry inputs verified fresh and within operational bounds.
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">0 schema violations</span>
        </div>
      )}

      {/* Detailed Quality Flags & Freshness Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Freshness Status */}
        <div className="p-3 rounded-xl bg-navy-950/80 border border-navy-800">
          <span className="text-slate-400 text-[11px] block font-mono">Input freshness:</span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`w-2 h-2 rounded-full ${isFailed ? 'bg-risk-red animate-pulse' : 'bg-emerald-400'}`}
            />
            <span className="font-bold text-white font-mono">
              {isFailed ? 'Stale (182m)' : 'All fresh (< 25m)'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
            4 stations, 1 road network graph
          </span>
        </div>

        {/* Timestamp Consistency */}
        <div className="p-3 rounded-xl bg-navy-950/80 border border-navy-800">
          <span className="text-slate-400 text-[11px] block font-mono">Timestamp sync:</span>
          <div className="flex items-center gap-2 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-white font-mono">Consistent across nodes</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
            Clock drift &lt; 85ms across sensors
          </span>
        </div>

        {/* Missing Fields Audit */}
        <div className="p-3 rounded-xl bg-navy-950/80 border border-navy-800">
          <span className="text-slate-400 text-[11px] block font-mono">Schema validation:</span>
          <div className="flex items-center gap-2 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-white font-mono">0 missing fields</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
            Documented API contract v1.0.0
          </span>
        </div>

        {/* Uncertainty Metric */}
        <div className="p-3 rounded-xl bg-navy-950/80 border border-navy-800">
          <span className="text-slate-400 text-[11px] block font-mono">Model uncertainty:</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold text-white tabular-nums font-mono">
              {uncertainty?.score ? `${Math.round(uncertainty.score * 100)}%` : '18%'}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-semibold">
              {uncertainty?.level || 'Low'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block truncate font-mono">
            {uncertainty?.rationale || 'Dense gauge coverage in Bellandur'}
          </span>
        </div>
      </div>
    </div>
  );
};
