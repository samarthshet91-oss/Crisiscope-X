import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle2, ArrowRight, Sparkles, Activity } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { ProvenanceTag } from '../components/ProvenanceTag';

export const DecisionStrip: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { interventionResult, riskResult, currentScenario, modelStatus, modelStatusReason } = useAppStore();

  const isStaleOrHighUncertainty =
    modelStatus === 'failed' ||
    (interventionResult && !interventionResult.trustGate.allFresh) ||
    (riskResult && riskResult.uncertainty.score > 0.35);

  const staleReason =
    modelStatusReason ||
    interventionResult?.trustGate.humanReviewReason ||
    (interventionResult?.trustGate.staleDatasets && interventionResult.trustGate.staleDatasets.length > 0
      ? `Stale input: ${interventionResult.trustGate.staleDatasets[0].name}`
      : 'Sensor latency exceeds operational tolerance');

  const recommendedOption =
    interventionResult?.alternatives.find((a) => a.id === interventionResult.recommendedOptionId) ||
    interventionResult?.baseline;

  const confidencePercent = riskResult
    ? Math.round((1 - riskResult.uncertainty.score) * 100)
    : 85;

  return (
    <aside
      aria-label="Decision strip"
      onClick={() => navigate('/console/lab')}
      className={`w-full border-b cursor-pointer transition-all px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-sm select-none backdrop-blur-md ${
        isStaleOrHighUncertainty
          ? 'bg-amber-950/40 border-amber-500/40 text-amber-200 hover:bg-amber-950/60'
          : 'bg-navy-900/85 border-navy-700/80 text-ink hover:bg-navy-850'
      }`}
    >
      {/* Left: Recommendation / Warning */}
      <div className="flex items-center gap-3 min-w-0">
        {isStaleOrHighUncertainty ? (
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0 shadow-sm animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold text-amber-300 uppercase tracking-wide">
                Needs human review:
              </span>
              <span className="text-amber-200 font-medium">{staleReason}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 shrink-0 shadow-[0_0_10px_rgba(0,229,255,0.25)]">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] uppercase tracking-wider font-mono font-bold text-cyan-400">
                Top recommendation:
              </span>
              <span className="font-bold text-white text-xs sm:text-sm">
                {recommendedOption?.title || 'Alternative A: Reroute via HAL Old Airport Road'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-semibold tabular-nums">
                <CheckCircle2 className="w-3 h-3" />
                {confidencePercent}% confidence
              </span>
              <ProvenanceTag type="Model estimate" size="sm" />
            </div>
          </div>
        )}
      </div>

      {/* Right: Freshness Chips + Action Link */}
      <div className="flex items-center gap-3 ml-auto text-xs flex-wrap">
        <div className="hidden lg:flex items-center gap-2 border-r border-navy-700/80 pr-3">
          <span className="text-slate-400 text-[11px] font-mono">Input freshness:</span>
          {/* Rainfall */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-navy-950/80 text-slate-300 font-mono text-[11px] border border-navy-800">
            <span className={`w-1.5 h-1.5 rounded-full ${modelStatus === 'failed' ? 'bg-risk-red animate-pulse' : 'bg-emerald-400'}`} />
            Rain: {modelStatus === 'failed' ? '182m (Stale)' : '16m'}
          </span>
          {/* Roads */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-navy-950/80 text-slate-300 font-mono text-[11px] border border-navy-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Roads: 12m
          </span>
          {/* Facilities */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-navy-950/80 text-slate-300 font-mono text-[11px] border border-navy-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Facilities: 25m
          </span>
          {/* Scenario */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/50 text-cyan-300 font-mono text-[11px] border border-cyan-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            {currentScenario?.scenarioId === 'scenario-blr-central-storm' ? 'Hebbal 45mm' : 'ORR 72mm'}
          </span>
        </div>

        <div className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold text-xs group">
          <span>Response Lab</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </aside>
  );
};
