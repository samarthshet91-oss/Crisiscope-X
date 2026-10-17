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
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.25)]">
              <FlaskConical className="w-4 h-4" />
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight">
              Counterfactual Response Lab
            </h1>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30">
              Decision Optimization
            </span>
            <ProvenanceTag type="Model estimate" size="sm" />
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Compares an unmanaged baseline with alternative counterfactual actions (reroute, dewatering, facility shift) and provides explainable rationale.
          </p>
        </div>
      </div>

      {/* Model Status Failed Banner */}
      {isFailed && (
        <div className="p-4 rounded-card bg-risk-red/15 border border-risk-red/40 text-red-200 flex items-start gap-3 shadow-glass backdrop-blur-md">
          <AlertTriangle className="w-5 h-5 text-risk-red shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-sm text-white">
              Intervention recommendations paused:
            </h4>
            <p className="leading-relaxed">
              {modelStatusReason ||
                'KSNDMC rainfall is 3 hours old. Recommendations are paused until it updates.'}
            </p>
            <p className="text-slate-400 font-mono text-[11px]">
              Real-time counterfactual calculations require fresh telemetric inputs. Maintain baseline emergency dispatch protocols until fresh sensor data is received.
            </p>
          </div>
        </div>
      )}

      {/* If No Alternative Beats Baseline Notice */}
      {interventionResult?.noAlternativeBeatsBaseline && !isFailed && (
        <div className="p-4 rounded-card bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2.5 shadow-glass backdrop-blur-md">
          <Info className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="font-medium">
            No alternative beats the baseline. Maintain current posture with elevated telemetry monitoring.
          </span>
        </div>
      )}

      {/* Main Comparison Section: Comparison Table (Left 7 cols) + Side Route Map & Why This One (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Comparison Table */}
        <div className="lg:col-span-7 bg-navy-900/90 rounded-card shadow-glass border border-navy-700/80 p-5 space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-navy-800">
            <div>
              <h2 className="text-sm font-bold text-white font-mono">Options comparison matrix</h2>
              <p className="text-[11px] text-slate-400">
                Direct trade-off evaluation against unmanaged baseline
              </p>
            </div>
            <ProvenanceTag type="Model estimate" size="sm" />
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-navy-800 text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                  <th className="py-2.5 px-3 font-semibold bg-navy-950/60 rounded-l-lg">
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
                          isSelected ? 'bg-cyan-500/10' : 'hover:bg-navy-950/50'
                        } ${isRec ? 'border-t-2 border-cyan-400' : ''}`}
                      >
                        <div className="flex flex-col gap-1">
                          {isRec && (
                            <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-400 text-navy-950 w-fit shadow-[0_0_10px_rgba(0,229,255,0.4)]">
                              <Sparkles className="w-2.5 h-2.5" />
                              Recommended
                            </span>
                          )}
                          <span className={`text-xs ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                            {opt.id === 'opt-baseline' ? 'Baseline' : opt.title.split(':')[0]}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/80 text-xs">
                {/* Row 1: Avg Emergency Travel Time */}
                <tr className="hover:bg-navy-950/40">
                  <td className="py-3 px-3 font-semibold text-slate-300 bg-navy-950/40">
                    <div>
                      <span>Avg travel time</span>
                      <span className="block text-[10px] text-slate-500 font-normal">
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
                          isSelected ? 'bg-cyan-500/10 font-bold' : ''
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="text-sm font-black text-white tabular-nums font-mono">
                            {opt.metrics.travelTimeMinutes} min
                          </div>
                          {delta !== 0 ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-emerald-400 tabular-nums font-mono">
                              <TrendingDown className="w-3 h-3 mr-0.5" />
                              {delta} min
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">Baseline</span>
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
                <tr className="hover:bg-navy-950/40">
                  <td className="py-3 px-3 font-semibold text-slate-300 bg-navy-950/40">
                    <div>
                      <span>Facility accessibility</span>
                      <span className="block text-[10px] text-slate-500 font-normal">
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
                          isSelected ? 'bg-cyan-500/10 font-bold' : ''
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="text-sm font-black text-white tabular-nums font-mono">
                            {opt.metrics.accessibilityPercent}%
                          </div>
                          {delta !== 0 ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-emerald-400 tabular-nums font-mono">
                              <TrendingUp className="w-3 h-3 mr-0.5" />
                              +{delta}%
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">Baseline</span>
                          )}
                          <div className="text-[10px] text-slate-400 font-mono">
                            {opt.metrics.facilitiesAccessibleCount}/{opt.metrics.totalFacilitiesCount} facilities
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Row 3: Demand Served */}
                <tr className="hover:bg-navy-950/40">
                  <td className="py-3 px-3 font-semibold text-slate-300 bg-navy-950/40">
                    <div>
                      <span>Demand served</span>
                      <span className="block text-[10px] text-slate-500 font-normal">
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
                          isSelected ? 'bg-cyan-500/10 font-bold' : ''
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="text-sm font-black text-white tabular-nums font-mono">
                            {opt.metrics.demandServedPercent}%
                          </div>
                          {delta !== 0 ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-emerald-400 tabular-nums font-mono">
                              <TrendingUp className="w-3 h-3 mr-0.5" />
                              +{delta}%
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">Baseline</span>
                          )}
                          <div className="text-[10px] text-slate-400 font-mono">
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
          <div className="p-3 bg-navy-950/80 rounded-xl border border-navy-800 text-xs flex items-center justify-between font-mono">
            <span className="text-slate-400">
              Active inspection: <strong className="text-cyan-400">{selectedOption?.title}</strong>
            </span>
            <ProvenanceTag provenance={selectedOption?.provenance} size="sm" />
          </div>
        </div>

        {/* Right Column: Why This One + Side Interactive Route Map */}
        <div className="lg:col-span-5 space-y-4">
          {/* Why This One Panel (for Recommended Option) */}
          <div className="bg-navy-900/90 rounded-card p-5 shadow-glass border border-cyan-500/40 space-y-3 backdrop-blur-md">
            <div className="flex items-center justify-between pb-2 border-b border-navy-800">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-sm font-bold text-white font-mono">Why this one (Rationale)</h3>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Score: 92/100
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-navy-950/80 p-3 rounded-xl border border-navy-800">
              {interventionResult?.rationale}
            </p>

            {/* Assumptions */}
            <div>
              <span className="text-xs font-bold text-white block mb-1 font-mono">
                Underlying operational assumptions:
              </span>
              <ul className="space-y-1 text-xs text-slate-400 pl-4 list-disc">
                {interventionResult?.assumptions.map((assump, idx) => (
                  <li key={idx} className="leading-snug">
                    {assump}
                  </li>
                ))}
              </ul>
            </div>

            {/* Trade-offs */}
            {selectedOption?.tradeOffs && (
              <div className="pt-2 border-t border-navy-800">
                <span className="text-xs font-bold text-amber-400 block mb-1 font-mono">
                  Acknowledged trade-offs:
                </span>
                <ul className="space-y-1 text-xs text-slate-400 pl-4 list-disc">
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
          <div className="bg-navy-950 rounded-card p-3 shadow-glass border border-navy-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-white px-1">
              <div className="flex items-center gap-1.5 font-bold font-mono">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Reroute corridor topology</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono">
                {selectedOption?.id === 'opt-reroute-hal-corridor' ? 'Detour active' : 'Standard'}
              </span>
            </div>

            <InteractiveMap
              is3D={false}
              showOverlayPanels={false}
              className="h-[220px] w-full"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
                <span className="text-slate-300">Detour path</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-risk-red shadow-[0_0_8px_rgba(255,59,83,0.6)]" />
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
      <div className="bg-navy-900/90 rounded-card shadow-glass border border-navy-700/80 overflow-hidden backdrop-blur-md">
        <button
          type="button"
          onClick={() => setShowDecisionTrace(!showDecisionTrace)}
          className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-white hover:bg-navy-850 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="font-mono">Auditable decision trace & algorithmic constraints</span>
            <span className="text-[10px] font-mono text-slate-400 font-normal">
              (Model {interventionResult?.decisionTrace.modelVersion})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ProvenanceTag type="Rule-based" size="sm" />
            {showDecisionTrace ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </button>

        {showDecisionTrace && interventionResult && (
          <div className="p-4 pt-0 border-t border-navy-800 text-xs space-y-3 bg-navy-950/60">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 font-mono text-[11px]">
              <div>
                <strong className="text-cyan-400 block mb-1">Inputs considered:</strong>
                <ul className="space-y-1 text-slate-300 pl-4 list-disc">
                  {interventionResult.decisionTrace.inputsConsidered.map((inp, idx) => (
                    <li key={idx}>{inp}</li>
                  ))}
                </ul>
              </div>

              <div>
                <strong className="text-cyan-400 block mb-1">Constraints enforced:</strong>
                <ul className="space-y-1 text-slate-300 pl-4 list-disc">
                  {interventionResult.decisionTrace.constraintsEnforced.map((con, idx) => (
                    <li key={idx}>{con}</li>
                  ))}
                </ul>
              </div>

              <div>
                <strong className="text-cyan-400 block mb-1">Rules applied:</strong>
                <ul className="space-y-1 text-slate-300 pl-4 list-disc">
                  {interventionResult.decisionTrace.rulesApplied.map((rul, idx) => (
                    <li key={idx}>{rul}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 border-t border-navy-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Timestamp: {interventionResult.decisionTrace.computedAtIST}</span>
              <span>Architecture digest: sha256:d8a23b9701fc3e1</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
