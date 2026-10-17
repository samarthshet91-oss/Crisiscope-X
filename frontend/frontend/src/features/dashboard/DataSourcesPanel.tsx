import React from 'react';
import { Database, ShieldCheck, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { DATASETS_CONFIG } from '../../config/datasets';
import { ProvenanceTag } from '../../components/ProvenanceTag';

export const DataSourcesPanel: React.FC = () => {
  const getStatusBadge = (status: string, ageMinutes: number) => {
    switch (status) {
      case 'Loaded':
        return {
          dot: 'bg-emerald-400',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          text: 'Loaded and fresh',
        };
      case 'Stale':
        const ageHours = (ageMinutes / 60).toFixed(1);
        return {
          dot: 'bg-amber-400',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          text: `Stale (${ageHours}h ago)`,
        };
      case 'Mock':
        return {
          dot: 'bg-sky-400',
          badge: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
          text: 'Mock data',
        };
      case 'Not loaded':
      default:
        return {
          dot: 'bg-slate-500',
          badge: 'bg-slate-800 text-slate-400 border-slate-700',
          text: 'Not loaded',
        };
    }
  };

  return (
    <div className="bg-card rounded-card p-4 shadow-card border border-slate-200/80 dark:border-cyan-500/20 backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-signal-blue-light/50 border border-signal-blue/30 text-signal-blue dark:bg-navy-950/80 dark:border-cyan-500/30 dark:text-cyan-400 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink">Real-Time Data Sources</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Active Bengaluru hydrological and urban infrastructure registry
            </p>
          </div>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
          <span>Green = Loaded & fresh</span>
        </div>
      </div>

      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {DATASETS_CONFIG.map((dataset) => {
          const statusInfo = getStatusBadge(dataset.status, dataset.ageMinutes);

          return (
            <div
              key={dataset.id}
              className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-navy-950/70 border border-slate-200 dark:border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-signal-blue/40 dark:hover:border-cyan-500/30 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${statusInfo.dot}`} />
                  <span className="font-semibold text-xs text-ink truncate">
                    {dataset.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-navy-700 font-mono">
                    {dataset.category}
                  </span>
                  {dataset.verifiedCoverage ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30 font-medium font-mono">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      Verified
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Not verified</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {dataset.attribution}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center font-mono">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.badge}`}
                >
                  {statusInfo.text}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden md:inline">
                  {dataset.lastUpdatedIST}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
