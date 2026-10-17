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
      <div className="p-3.5 rounded-card bg-amber-50 border border-amber-300 text-amber-950 flex items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <strong className="font-bold text-sm block">
              Simulated alerts. Not official warnings.
            </strong>
            <span className="text-[11px] text-amber-800">
              Generated dynamically from synthetic scenario triggers and hydrological models for decision support only.
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-1 rounded bg-amber-100 text-amber-900 border border-amber-200">
          Emergency hotline: 112 / 108
        </span>
      </div>

      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-risk-red flex items-center justify-center shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-ink tracking-tight">
              Scenario Alerts
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200 tabular-nums">
              {filteredAlerts.length} of {alerts.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Active warnings prioritized by infrastructure accessibility risk and telemetry thresholds.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl text-xs font-semibold self-start sm:self-center">
          {(['All', 'High', 'Moderate', 'Low'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterSeverity(tab)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterSeverity === tab ? 'bg-white text-ink shadow-xs' : 'text-slate-600 hover:text-ink'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Rows List (matching screenshot Early Warning System style) */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-card rounded-card p-4 shadow-card border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            {/* Left: Icon + Title + Severity + Details */}
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  alert.severity === 'Severe' || alert.severity === 'High'
                    ? 'bg-red-50 text-risk-red'
                    : alert.severity === 'Moderate'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-emerald-50 text-risk-green'
                }`}
              >
                <AlertCircle className="w-5 h-5" />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <RiskBadge level={alert.severity} size="sm" />
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {alert.category}
                  </span>
                  <ProvenanceTag provenance={alert.provenance} size="sm" />
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {alert.timestampIST}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-ink leading-snug">
                  {alert.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                  {alert.description}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {alert.locationName} ({alert.wardName})
                  </span>
                  <span>•</span>
                  <span className="text-signal-blue font-medium">
                    Suggested: {alert.suggestedAction}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Map Thumbnail & View Details action */}
            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
              {/* Mini Map Thumbnail */}
              <div className="w-24 h-16 rounded-xl bg-navy-950 border border-navy-800 relative overflow-hidden hidden sm:flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1769FF_1px,transparent_1px)] [background-size:8px_8px]" />
                <span className="w-2.5 h-2.5 rounded-full bg-risk-red animate-ping" />
                <span className="absolute bottom-1 right-1 text-[9px] text-slate-400 font-mono">
                  BLR-GIS
                </span>
              </div>

              {/* View details button */}
              <button
                type="button"
                onClick={() => setSelectedAlertModal(alert)}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-ink text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <span>View details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filteredAlerts.length === 0 && (
          <div className="bg-card rounded-card p-10 text-center text-slate-400 text-xs border border-slate-200">
            No alerts matching the selected severity filter.
          </div>
        )}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlertModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card rounded-card shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <RiskBadge level={selectedAlertModal.severity} size="sm" />
                  <ProvenanceTag provenance={selectedAlertModal.provenance} size="sm" />
                </div>
                <h3 className="text-base font-bold text-ink mt-2">
                  {selectedAlertModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAlertModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-ink hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              {selectedAlertModal.description}
            </p>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Location & Ward:</span>
                <span className="font-semibold text-ink">
                  {selectedAlertModal.locationName} — {selectedAlertModal.wardName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Recommended response protocol:</span>
                <span className="font-semibold text-signal-blue">
                  {selectedAlertModal.suggestedAction}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Event timestamp:</span>
                <span className="font-mono text-slate-600">{selectedAlertModal.timestampIST}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedAlertModal(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
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
