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
          icon: <Database className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          bg: 'bg-slate-100',
          text: 'text-slate-700',
          border: 'border-slate-300',
          label: 'Observed',
          desc: 'Historical ground sensor or gazetted spatial data',
        };
      case 'Synthetic scenario':
        return {
          icon: <Sparkles className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-200',
          label: 'Synthetic scenario',
          desc: 'Simulated storm injection for contingency testing',
        };
      case 'Model estimate':
        return {
          icon: <Activity className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          bg: 'bg-amber-50',
          text: 'text-amber-800',
          border: 'border-amber-300',
          label: 'Model estimate',
          desc: 'Predicted by topological routing & runoff model',
        };
      case 'Rule-based':
        return {
          icon: <ShieldCheck className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          bg: 'bg-emerald-50',
          text: 'text-emerald-800',
          border: 'border-emerald-300',
          label: 'Rule-based',
          desc: 'Deterministic operational procedure or diversion protocol',
        };
      default:
        return {
          icon: <Info className="w-3 h-3" />,
          bg: 'bg-slate-100',
          text: 'text-slate-600',
          border: 'border-slate-200',
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
        className={`inline-flex items-center gap-1 font-medium rounded-badge border transition-colors cursor-help select-none ${
          size === 'sm' ? 'px-1.5 py-0.5 text-[11px] leading-tight' : 'px-2 py-1 text-xs'
        } ${style.bg} ${style.text} ${style.border}`}
      >
        {style.icon}
        <span>{style.label}</span>
      </span>

      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-1.5 z-50 w-64 p-2.5 bg-navy-950 text-white text-xs rounded-lg shadow-dropdown border border-navy-700 pointer-events-none animate-in fade-in duration-150">
          <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
            {style.icon}
            <span>{style.label}</span>
          </div>
          <p className="text-slate-300 text-[11px] mb-2 leading-relaxed">{style.desc}</p>
          <div className="pt-1.5 border-t border-navy-800 space-y-1 text-[10px] text-slate-400">
            <div>
              <span className="text-slate-300 font-medium">Source: </span>
              {source}
            </div>
            <div>
              <span className="text-slate-300 font-medium">Licence: </span>
              {licence}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
