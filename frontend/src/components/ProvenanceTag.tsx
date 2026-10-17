import React, { useState } from 'react';
import { Database, Sparkles, Activity, ShieldCheck, Info } from 'lucide-react';
import { ProvenanceMeta, ProvenanceType } from '../contracts';

interface ProvenanceTagProps {
  provenance?: ProvenanceMeta;
  type?: ProvenanceType;
  source?: string;
  licence?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const ProvenanceTag: React.FC<ProvenanceTagProps> = ({
  provenance,
  type = provenance?.type || 'Model estimate',
  source = provenance?.source || 'Crisiscope X Model',
  licence = provenance?.licence || 'ODbL / GODL',
  size = 'sm',
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getTagStyle = () => {
    switch (type) {
      case 'Observed':
        return {
          icon: <Database className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />,
          bg: 'bg-navy-950/80',
          text: 'text-sky-300',
          border: 'border-sky-500/30',
          label: 'Observed',
          desc: 'Historical ground sensor or gazetted spatial data',
        };
      case 'Synthetic scenario':
        return {
          icon: <Sparkles className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />,
          bg: 'bg-purple-950/70',
          text: 'text-purple-300',
          border: 'border-purple-500/40',
          label: 'Synthetic scenario',
          desc: 'Simulated storm injection for contingency testing',
        };
      case 'Model estimate':
        return {
          icon: <Activity className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />,
          bg: 'bg-amber-950/60',
          text: 'text-amber-300',
          border: 'border-amber-500/40',
          label: 'Model estimate',
          desc: 'Predicted by topological routing & runoff model',
        };
      case 'Rule-based':
        return {
          icon: <ShieldCheck className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />,
          bg: 'bg-emerald-950/60',
          text: 'text-emerald-300',
          border: 'border-emerald-500/40',
          label: 'Rule-based',
          desc: 'Deterministic operational procedure or diversion protocol',
        };
      default:
        return {
          icon: <Info className="w-2.5 h-2.5" />,
          bg: 'bg-navy-950/80',
          text: 'text-slate-300',
          border: 'border-slate-700',
          label: type,
          desc: 'Documented data origin',
        };
    }
  };

  const style = getTagStyle();

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      tabIndex={0}
      role="note"
      aria-label={`Provenance: ${style.label}. Source: ${source}. Licence: ${licence}`}
    >
      <span
        className={`inline-flex items-center gap-1 font-mono rounded-badge border backdrop-blur-xs transition-colors cursor-help select-none ${
          size === 'sm' ? 'px-1.5 py-0.5 text-[10px] uppercase tracking-wider' : 'px-2 py-1 text-xs'
        } ${style.bg} ${style.text} ${style.border}`}
      >
        {style.icon}
        <span>{style.label}</span>
      </span>

      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-1.5 z-50 w-64 p-3 bg-navy-950 text-white text-xs rounded-xl shadow-dropdown border border-cyan-500/30 pointer-events-none animate-in fade-in duration-150">
          <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
            {style.icon}
            <span className="font-mono text-cyan-300">{style.label}</span>
          </div>
          <p className="text-slate-300 text-[11px] mb-2 leading-relaxed">{style.desc}</p>
          <div className="pt-2 border-t border-navy-800 space-y-1 text-[10px] text-slate-400 font-mono">
            <div>
              <span className="text-slate-200">Source: </span>
              {source}
            </div>
            <div>
              <span className="text-slate-200">Licence: </span>
              {licence}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
