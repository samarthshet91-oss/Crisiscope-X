import React, { useState } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  Info,
  MapPin,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { InteractiveMap } from '../map/InteractiveMap';
import { TrustGate } from '../trust/TrustGate';
import { ProvenanceTag } from '../../components/ProvenanceTag';
import { InterventionOption } from '../../contracts';

export const ResponseLabPage: React.FC = () => {
  const { interventionResult, modelStatus, modelStatusReason } = useAppStore();

  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    interventionResult?.recommendedOptionId || 'opt-reroute-hal-corridor'
  );
  const [showDecisionTrace, setShowDecisionTrace] = useState(false);

  const isFailed = modelStatus === 'failed';
  const baseline = interventionResult?.baseline;
  const alternatives = interventionResult?.alternatives || [];
  const allOptions: InterventionOption[] = baseline ? [baseline, ...alternatives] : alternatives;

  const selectedOption =
    allOptions.find((opt) => opt.id === selectedOptionId) ||
    alternatives[0] ||
    baseline;

  const recommendedOption = allOptions.find(
    (opt) => opt.id === interventionResult?.recommendedOptionId
  );

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-flood-teal text-white flex items-center justify-center shadow-xs">
              <FlaskConical className="w-4 h-4" />
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-ink tracking-tight">
              Counterfactual Response Lab
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-flood-teal-bg text-flood-teal-dark font-bold border border-flood-teal/30">
              Decision Optimization
            </span>
            <ProvenanceTag type="Model estimate" size="sm" />
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Compares an unmanaged baseline with alternative counterfactual actions (reroute, dewatering, facility shift) and provides explainable rationale.
          </p>
        </div>
      </div>

      {/* Model Status Failed Banner */}
      {isFailed && (
        <div className="p-4 rounded-card bg-red-50 border border-red-200 text-red-950 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-risk-red shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-sm text-red-900">
              Intervention recommendations paused:
            </h4>
            <p className="text-slate-700 leading-relaxed">
              {modelStatusReason ||
                'KSNDMC rainfall is 3 hours old. Recommendations are paused until it updates.'}
            </p>
            <p className="text-slate-600">
              Real-time counterfactual calculations require fresh telemetric inputs. Maintain baseline emergency dispatch protocols until fresh sensor data is received.
            </p>
          </div>
        </div>
      )}

      {/* If No Alternative Beats Baseline Notice */}
      {interventionResult?.noAlternativeBeatsBaseline && !isFailed && (
        <div className="p-4 rounded-card bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-center gap-2.5">
          <Info className="w-5 h-5 text-amber-600 shrink-0" />
          <span className="font-medium">
            No alternative beats the baseline. Maintain current posture with elevated telemetry monitoring.
          </span>
        </div>
      )}

      {/* Main Comparison Section: Comparison Table (Left 7 cols) + Side Route Map & Why This One (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Comparison Table */}
        <div className="lg:col-span-7 bg-card rounded-card shadow-card border border-slate-200/80 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-ink">Options comparison matrix</h2>
              <p className="text-[11px] text-slate-500">
                Direct trade-off evaluation against unmanaged baseline
              </p>
            </div>
            <ProvenanceTag type="Model estimate" size="sm" />
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-semibold bg-slate-50 rounded-l-lg">
                    Decision metric
                  </th>
                  {allOptions.map((opt) => {
                    const isRec = opt.id === interventionResult?.recommendedOptionId;
                    const isSelected = opt.id === selectedOptionId;

                    return (
                      <th
                        key={opt.id}
                        onClick={() => setSelectedOptionId(opt.id)}
                        className={`py-2.5 px-3 font-bold cursor-pointer transition-colors ${
                          isSelected ? 'bg-signal-blue/5' : 'hover:bg-slate-50'
                        } ${isRec ? 'border-t-2 border-flood-teal' : ''}`}
                      >
                        <div className="flex flex-col gap-1">
                          {isRec && (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-flood-teal text-white w-fit shadow-xs">
                              <Sparkles className="w-2.5 h-2.5" />
                              Recommended
                            </span>
                          )}
                          <span className={`text-xs ${isSelected ? 'text-signal-blue' : 'text-ink'}`}>
                            {opt.id === 'opt-baseline' ? 'Baseline' : opt.title.split(':')[0]}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {/* Row 1: Avg Emergency Travel Time */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-semibold text-slate-700 bg-slate-50/40">
                    <div>
                      <span>Avg travel time</span>
                      <span className="block text-[10px] text-slate-400 font-normal">
                        Minutes to trauma center
                      </span>
                    </div>
                  </td>
                  {allOptions.map((opt) => {
                    const isSelected = opt.id === selectedOptionId;
                    const delta = opt.metricsDelta.travelTimeDelta;

                    return (
                      <td
                        key={opt.id}
                        onClick={() => setSelectedOptionId(opt.id)}
                        className={`py-3 px-3 cursor-pointer ${
                          isSelected ? 'bg-signal-blue/5 font-bold' : ''
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="text-sm font-black text-ink tabular-nums">
                            {opt.metrics.travelTimeMinutes} min
                          </div>
                          {delta !== 0 ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-risk-green tabular-nums">
                              <TrendingDown className="w-3 h-3 mr-0.5" />
                              {delta} min
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Baseline</span>
                          )}
                          <div className="pt-0.5">
                            <ProvenanceTag provenance={opt.provenance} size="sm" />
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Row 2: Facility Accessibility */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-semibold text-slate-700 bg-slate-50/40">
                    <div>
                      <span>Facility accessibility</span>
                      <span className="block text-[10px] text-slate-400 font-normal">
                        % critical nodes reachable
                      </span>
                    </div>
                  </td>
                  {allOptions.map((opt) => {
                    const isSelected = opt.id === selectedOptionId;
                    const delta = opt.metricsDelta.accessibilityDelta;

                    return (
                      <td
                        key={opt.id}
                        onClick={() => setSelectedOptionId(opt.id)}
                        className={`py-3 px-3 cursor-pointer ${
                          isSelected ? 'bg-signal-blue/5 font-bold' : ''
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="text-sm font-black text-ink tabular-nums">
                            {opt.metrics.accessibilityPercent}%
                          </div>
                          {delta !== 0 ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-risk-green tabular-nums">
                              <TrendingUp className="w-3 h-3 mr-0.5" />
                              +{delta}%
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Baseline</span>
                          )}
                          <div className="text-[10px] text-slate-500 font-mono">
                            {opt.metrics.facilitiesAccessibleCount}/{opt.metrics.totalFacilitiesCount} facilities
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Row 3: Demand Served */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-semibold text-slate-700 bg-slate-50/40">
                    <div>
                      <span>Demand served</span>
                      <span className="block text-[10px] text-slate-400 font-normal">
                        % emergency dispatches cleared
                      </span>
                    </div>
                  </td>
                  {allOptions.map((opt) => {
                    const isSelected = opt.id === selectedOptionId;
                    const delta = opt.metricsDelta.demandServedDelta;

                    return (
                      <td
                        key={opt.id}
                        onClick={() => setSelectedOptionId(opt.id)}
                        className={`py-3 px-3 cursor-pointer ${
                          isSelected ? 'bg-signal-blue/5 font-bold' : ''
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="text-sm font-black text-ink tabular-nums">
                            {opt.metrics.demandServedPercent}%
                          </div>
                          {delta !== 0 ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-risk-green tabular-nums">
                              <TrendingUp className="w-3 h-3 mr-0.5" />
                              +{delta}%
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Baseline</span>
                          )}
                          <div className="text-[10px] text-slate-500 font-mono">
                            ~{opt.metrics.delayedVehiclesCount} delayed veh.
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action selection prompt */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
            <span className="text-slate-600">
              Active inspection: <strong className="text-ink">{selectedOption?.title}</strong>
            </span>
            <ProvenanceTag provenance={selectedOption?.provenance} size="sm" />
          </div>
        </div>

        {/* Right Column: Why This One + Side Interactive Route Map */}
        <div className="lg:col-span-5 space-y-4">
          {/* Why This One Panel (for Recommended Option) */}
          <div className="bg-card rounded-card p-5 shadow-card border-2 border-flood-teal/40 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-flood-teal text-white">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-sm font-bold text-ink">Why this one (Rationale)</h3>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-risk-green border border-emerald-200">
                Score: 92/100
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              {interventionResult?.rationale}
            </p>

            {/* Assumptions */}
            <div>
              <span className="text-xs font-bold text-ink block mb-1">
                Underlying operational assumptions:
              </span>
              <ul className="space-y-1 text-xs text-slate-600 pl-4 list-disc">
                {interventionResult?.assumptions.map((assump, idx) => (
                  <li key={idx} className="leading-snug">
                    {assump}
                  </li>
                ))}
              </ul>
            </div>

            {/* Trade-offs */}
            {selectedOption?.tradeOffs && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-amber-900 block mb-1">
                  Acknowledged trade-offs:
                </span>
                <ul className="space-y-1 text-xs text-slate-600 pl-4 list-disc">
                  {selectedOption.tradeOffs.map((to, idx) => (
                    <li key={idx} className="leading-snug">
                      {to}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Side Route Visualization Map */}
          <div className="bg-navy-950 rounded-card p-3 shadow-card border border-navy-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-white px-1">
              <div className="flex items-center gap-1.5 font-bold">
                <MapPin className="w-3.5 h-3.5 text-flood-teal" />
                <span>Reroute corridor topology</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {selectedOption?.id === 'opt-reroute-hal-corridor' ? 'Detour active' : 'Standard'}
              </span>
            </div>

            <InteractiveMap
              is3D={false}
              showOverlayPanels={false}
              className="h-[220px] w-full"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-flood-teal rounded-full" />
                <span className="text-slate-300">Detour path</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-risk-red" />
                <span className="text-slate-300">Flooded node</span>
              </span>
              <ProvenanceTag type="Rule-based" size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Trust Gate & Data Validation Section */}
      <TrustGate />

      {/* Collapsible Decision Trace */}
      <div className="bg-card rounded-card shadow-card border border-slate-200/80 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDecisionTrace(!showDecisionTrace)}
          className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-ink hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-signal-blue" />
            <span>Auditable decision trace & constraints</span>
            <span className="text-[10px] font-mono text-slate-400 font-normal">
              (Model {interventionResult?.decisionTrace.modelVersion})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ProvenanceTag type="Rule-based" size="sm" />
            {showDecisionTrace ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showDecisionTrace && interventionResult && (
          <div className="p-4 pt-0 border-t border-slate-100 text-xs space-y-3 bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
              <div>
                <strong className="text-slate-700 block mb-1">Inputs considered:</strong>
                <ul className="space-y-1 text-slate-600 pl-4 list-disc text-[11px]">
                  {interventionResult.decisionTrace.inputsConsidered.map((inp, idx) => (
                    <li key={idx}>{inp}</li>
                  ))}
                </ul>
              </div>

              <div>
                <strong className="text-slate-700 block mb-1">Constraints enforced:</strong>
                <ul className="space-y-1 text-slate-600 pl-4 list-disc text-[11px]">
                  {interventionResult.decisionTrace.constraintsEnforced.map((con, idx) => (
                    <li key={idx}>{con}</li>
                  ))}
                </ul>
              </div>

              <div>
                <strong className="text-slate-700 block mb-1">Rules applied:</strong>
                <ul className="space-y-1 text-slate-600 pl-4 list-disc text-[11px]">
                  {interventionResult.decisionTrace.rulesApplied.map((rul, idx) => (
                    <li key={idx}>{rul}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Timestamp: {interventionResult.decisionTrace.computedAtIST}</span>
              <span>Architecture digest: sha256:d8a23b9701fc3e1</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
