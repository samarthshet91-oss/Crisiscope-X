import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, LucideIcon } from 'lucide-react';
import { ProvenanceTag } from '../../components/ProvenanceTag';
import { ProvenanceType } from '../../contracts';

interface KpiCardProps {
  title: string;
  value: string | number;
  changeValue?: string | number;
  changeDirection?: 'up' | 'down' | 'neutral';
  isIncreaseWorse?: boolean;
  icon: LucideIcon;
  provenanceType: ProvenanceType;
  provenanceSource?: string;
  subtext?: string;
  isNotLoaded?: boolean;
  accentColor?: 'cyan' | 'coral' | 'amber' | 'emerald';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  changeValue,
  changeDirection = 'neutral',
  isIncreaseWorse = true,
  icon: Icon,
  provenanceType,
  provenanceSource,
  subtext,
  isNotLoaded = false,
  accentColor = 'cyan',
}) => {
  const getChangeStyle = () => {
    if (changeDirection === 'neutral' || !changeValue) {
      return {
        text: 'text-slate-400',
        bg: 'bg-navy-950/80 border-navy-800',
        icon: <Minus className="w-3 h-3" />,
      };
    }

    const isWorse = (changeDirection === 'up' && isIncreaseWorse) || (changeDirection === 'down' && !isIncreaseWorse);

    if (isWorse) {
      return {
        text: 'text-risk-red',
        bg: 'bg-risk-red/10 border-risk-red/30',
        icon: changeDirection === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />,
      };
    }

    return {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      icon: changeDirection === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />,
    };
  };

  const changeStyle = getChangeStyle();

  return (
    <div className="bg-navy-900/90 rounded-card p-4 shadow-glass border border-navy-700/80 flex flex-col justify-between transition-all duration-200 hover:border-cyan-500/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6),0_0_15px_rgba(0,229,255,0.15)] group backdrop-blur-md">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_10px_rgba(0,229,255,0.2)] transition-all">
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-300 line-clamp-1">{title}</span>
        </div>
        <ProvenanceTag type={provenanceType} source={provenanceSource} size="sm" />
      </div>

      <div className="mt-1">
        {isNotLoaded ? (
          <div className="text-xl font-bold text-slate-500 font-mono">Not loaded</div>
        ) : (
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl font-black text-white tracking-tight tabular-nums font-mono">
              {value}
            </span>
            {changeValue && (
              <span
                className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border ${changeStyle.bg} ${changeStyle.text} tabular-nums`}
              >
                {changeStyle.icon}
                <span>{changeValue}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {subtext && (
        <div className="mt-2.5 pt-2 border-t border-navy-800/80 text-[11px] text-slate-400 leading-snug">
          {subtext}
        </div>
      )}
    </div>
  );
};
