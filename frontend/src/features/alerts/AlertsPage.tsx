import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  MapPin,
  Clock,
  Filter,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { RiskBadge } from '../../components/RiskBadge';
import { ProvenanceTag } from '../../components/ProvenanceTag';
import { ScenarioAlert, RelativeRiskLevel } from '../../contracts';

export const AlertsPage: React.FC = () => {
  const { alerts, setSelectedAsset, currentScenario } = useAppStore();
  const [filterSeverity, setFilterSeverity] = useState<'All' | 'High' | 'Moderate' | 'Low'>('All');
  const [selectedAlertModal, setSelectedAlertModal] = useState<ScenarioAlert | null>(null);

  const filteredAlerts = alerts.filter((alert) => {
    if (filterSeverity === 'All') return true;
    if (filterSeverity === 'High') return alert.severity === 'Severe' || alert.severity === 'High';
    if (filterSeverity === 'Moderate') return alert.severity === 'Moderate';
    if (filterSeverity === 'Low') return alert.severity === 'Low';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Mandatory Simulated Alerts Disclaimer Banner */}
      <div className="p-4 rounded-card bg-amber-500/15 border border-amber-500/40 text-amber-200 flex items-center justify-between gap-3 text-xs shadow-glass backdrop-blur-md">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong className="font-bold text-sm block text-white font-mono">
              Simulated alerts. Not official warnings.
            </strong>
            <span className="text-[11px] text-amber-300">
              Generated dynamically from synthetic scenario triggers and hydrological models for decision support only.
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-navy-950 text-amber-300 border border-amber-500/30">
          Emergency hotline: 112 / 108
        </span>
      </div>

      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/30 text-risk-red flex items-center justify-center shadow-[0_0_12px_rgba(255,59,83,0.25)]">
              <Bell className="w-4 h-4" />
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight">
              Scenario Alerts
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-navy-900 text-cyan-300 font-mono font-bold border border-navy-750 tabular-nums">
              {filteredAlerts.length} of {alerts.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Active warnings prioritized by infrastructure accessibility risk and telemetry thresholds.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 p-1 bg-navy-900/90 rounded-xl border border-navy-700/80 text-xs font-semibold self-start sm:self-center shadow-glass">
          {(['All', 'High', 'Moderate', 'Low'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterSeverity(tab)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterSeverity === tab
                  ? 'bg-signal-blue text-navy-950 font-bold shadow-[0_0_12px_rgba(0,229,255,0.35)]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Rows List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-navy-900/90 rounded-card p-4 shadow-glass border border-navy-700/80 hover:border-cyan-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md"
          >
            {/* Left: Icon + Title + Severity + Details */}
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  alert.severity === 'Severe' || alert.severity === 'High'
                    ? 'bg-red-500/20 text-risk-red border border-red-500/30 shadow-[0_0_10px_rgba(255,59,83,0.3)]'
                    : alert.severity === 'Moderate'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <AlertCircle className="w-5 h-5" />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <RiskBadge level={alert.severity} size="sm" />
                  <span className="text-[10px] font-mono font-semibold text-slate-400 bg-navy-950 px-2 py-0.5 rounded border border-navy-800">
                    {alert.category}
                  </span>
                  <ProvenanceTag provenance={alert.provenance} size="sm" />
                  <span className="text-slate-600 text-xs">•</span>
                  <span className="text-xs font-mono text-cyan-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {alert.timestampIST}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">
                  {alert.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  {alert.description}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {alert.locationName} ({alert.wardName})
                  </span>
                  <span>•</span>
                  <span className="text-cyan-400 font-semibold">
                    Protocol: {alert.suggestedAction}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Map Thumbnail & View Details action */}
            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
              {/* Mini Map Thumbnail */}
              <div className="w-24 h-16 rounded-xl bg-navy-950 border border-navy-800 relative overflow-hidden hidden sm:flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00E5FF_1px,transparent_1px)] [background-size:8px_8px]" />
                <span className="w-2.5 h-2.5 rounded-full bg-risk-red animate-ping" />
                <span className="absolute bottom-1 right-1 text-[9px] text-cyan-400 font-mono">
                  BLR-GIS
                </span>
              </div>

              {/* View details button */}
              <button
                type="button"
                onClick={() => setSelectedAlertModal(alert)}
                className="px-3.5 py-2 rounded-xl bg-navy-950 hover:bg-navy-800 border border-navy-800 hover:border-cyan-500/40 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <span>View details</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            </div>
          </div>
        ))}

        {filteredAlerts.length === 0 && (
          <div className="bg-navy-900/90 rounded-card p-10 text-center text-slate-400 text-xs border border-navy-800 font-mono">
            No alerts matching the selected severity filter.
          </div>
        )}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlertModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-navy-900 rounded-card shadow-2xl border border-cyan-500/30 max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-navy-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <RiskBadge level={selectedAlertModal.severity} size="sm" />
                  <ProvenanceTag provenance={selectedAlertModal.provenance} size="sm" />
                </div>
                <h3 className="text-base font-bold text-white mt-2">
                  {selectedAlertModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAlertModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-navy-950 p-3.5 rounded-xl border border-navy-800">
              {selectedAlertModal.description}
            </p>

            <div className="space-y-2.5 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[11px]">Location & Ward:</span>
                <span className="font-semibold text-white">
                  {selectedAlertModal.locationName} — {selectedAlertModal.wardName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Recommended response protocol:</span>
                <span className="font-semibold text-cyan-400">
                  {selectedAlertModal.suggestedAction}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Event timestamp:</span>
                <span className="text-slate-300">{selectedAlertModal.timestampIST}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-navy-800 flex justify-end">
              <button
                onClick={() => setSelectedAlertModal(null)}
                className="px-4 py-2 bg-signal-blue text-navy-950 rounded-xl text-xs font-bold hover:bg-signal-blue-hover transition-colors shadow-[0_0_12px_rgba(0,229,255,0.3)]"
              >
                Close details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
