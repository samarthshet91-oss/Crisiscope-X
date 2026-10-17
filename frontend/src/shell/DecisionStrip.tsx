import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { ProvenanceTag } from '../components/ProvenanceTag';

export const DecisionStrip: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { interventionResult, riskResult, currentScenario, modelStatus, modelStatusReason, theme } = useAppStore();

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
      className={`w-full border-b cursor-pointer transition-colors px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm select-none backdrop-blur-md ${
        isStaleOrHighUncertainty
          ? theme === 'dark'
            ? 'bg-amber-950/70 border-amber-500/40 text-amber-200 hover:bg-amber-900/60'
            : 'bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100/70'
          : theme === 'dark'
            ? 'bg-navy-900/90 border-cyan-500/20 text-slate-200 hover:bg-navy-800/90 hover:border-cyan-500/40'
            : 'bg-white/95 border-slate-200 text-slate-800 hover:bg-slate-50 shadow-xs'
      }`}
    >
      {/* Left: Recommendation / Warning */}
      <div className="flex items-center gap-3 min-w-0">
        {isStaleOrHighUncertainty ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-black shrink-0 shadow-sm animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-amber-500 dark:text-amber-300">Needs human review:</span>
              <span className="text-amber-800 dark:text-amber-200 text-xs font-medium">{staleReason}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40 shrink-0 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider font-mono font-semibold text-signal-blue dark:text-cyan-400">
                Top recommendation:
              </span>
              <span className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {recommendedOption?.title || 'Alternative A: Reroute via HAL Old Airport Road'}
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/30 font-semibold tabular-nums font-mono">
                <CheckCircle2 className="w-3 h-3" />
                {confidencePercent}% confidence
              </span>
              <ProvenanceTag type="Model estimate" size="sm" />
            </div>
          </div>
        )}
      </div>

      {/* Right: Freshness Chips + Action Link */}
      <div className="flex items-center gap-3 ml-auto text-xs flex-wrap font-mono">
        <div className={`hidden lg:flex items-center gap-2 pr-3 ${theme === 'dark' ? 'border-r border-navy-700 text-slate-400' : 'border-r border-slate-200 text-slate-500'}`}>
          <span className="font-medium text-[11px]">Input freshness:</span>
          {/* Rainfall */}
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-navy-950/80 border border-navy-700 text-slate-300 text-[10px]">
            <span className={`w-1.5 h-1.5 rounded-full ${modelStatus === 'failed' ? 'bg-risk-red animate-ping' : 'bg-risk-green'}`} />
            Rain: {modelStatus === 'failed' ? '182m (Stale)' : '16m'}
          </span>
          {/* Roads */}
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-navy-950/80 border border-navy-700 text-slate-300 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-risk-green" />
            Roads: 12m
          </span>
          {/* Facilities */}
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-navy-950/80 border border-navy-700 text-slate-300 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-risk-green" />
            Facilities: 25m
          </span>
          {/* Scenario */}
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 font-mono text-[10px] border border-cyan-800">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            {currentScenario?.scenarioId === 'scenario-blr-central-storm' ? 'Hebbal 45mm' : 'ORR 72mm'}
          </span>
        </div>

        <div className="flex items-center gap-1 text-cyan-400 font-semibold hover:text-cyan-300 text-xs">
          <span>Response Lab</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </aside>
  );
};
