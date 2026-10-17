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
          badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          text: 'Loaded & Fresh',
        };
      case 'Stale':
        const ageHours = (ageMinutes / 60).toFixed(1);
        return {
          dot: 'bg-amber-400',
          badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          text: `Stale (${ageHours}h ago)`,
        };
      case 'Mock':
        return {
          dot: 'bg-purple-400',
          badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
          text: 'Mock fixture',
        };
      case 'Not loaded':
      default:
        return {
          dot: 'bg-slate-500',
          badge: 'bg-navy-950/80 text-slate-400 border-navy-800',
          text: 'Not loaded',
        };
    }
  };

  return (
    <div className="bg-navy-900/90 rounded-card p-4 shadow-glass border border-navy-700/80 backdrop-blur-md h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-navy-800 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(0,229,255,0.2)]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Real-time data sources
              </h3>
              <p className="text-[11px] text-slate-400">
                10 active Bengaluru hydrological and urban infrastructure feeds
              </p>
            </div>
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1.5 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Telemetry Fresh</span>
          </div>
        </div>

        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {DATASETS_CONFIG.map((dataset) => {
            const statusInfo = getStatusBadge(dataset.status, dataset.ageMinutes);

            return (
              <div
                key={dataset.id}
                className="p-2.5 rounded-xl bg-navy-950/70 border border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-navy-950 hover:border-navy-700 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${statusInfo.dot}`} />
                    <span className="font-semibold text-xs text-white truncate">
                      {dataset.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-navy-900 text-slate-400 border border-navy-700/80 font-mono">
                      {dataset.category}
                    </span>
                    {dataset.verifiedCoverage ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 font-medium">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">Unverified</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                    {dataset.attribution}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center font-mono">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.badge}`}
                  >
                    {statusInfo.text}
                  </span>
                  <span className="text-[10px] text-slate-400 hidden md:inline">
                    {dataset.lastUpdatedIST}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2 text-[10px] text-slate-400 border-t border-navy-800/80 flex items-center justify-between font-mono">
        <span>Attribution: © OpenStreetMap (ODbL) & KSNDMC</span>
        <span>Coverage: 198 BBMP Wards</span>
      </div>
    </div>
  );
};
