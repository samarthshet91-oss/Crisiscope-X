import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, LucideIcon } from 'lucide-react';
import { ProvenanceTag } from '../../components/ProvenanceTag';
import { ProvenanceType } from '../../contracts';
import { useCountUp } from '../../hooks/useFx';

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
}) => {
  const getChangeStyle = () => {
    if (changeDirection === 'neutral' || !changeValue) {
      return {
        text: 'text-slate-400',
        bg: 'bg-navy-950/80 border border-navy-700',
        icon: <Minus className="w-3 h-3" />,
      };
    }

    const isWorse = (changeDirection === 'up' && isIncreaseWorse) || (changeDirection === 'down' && !isIncreaseWorse);

    if (isWorse) {
      return {
        text: 'text-red-400',
        bg: 'bg-red-500/10 border border-red-500/30',
        icon: changeDirection === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />,
      };
    }

    return {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border border-emerald-500/30',
      icon: changeDirection === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />,
    };
  };

  const changeStyle = getChangeStyle();
  const animatedValue = useCountUp(value);

  return (
    <div className="bg-card rounded-card p-4 border border-slate-200/80 dark:border-cyan-500/20 backdrop-blur-md flex flex-col justify-between cx-tilt group shadow-card hover:border-signal-blue/40 dark:hover:border-cyan-500/40 transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-signal-blue-light/50 border border-signal-blue/30 text-signal-blue dark:bg-navy-950/80 dark:border-cyan-500/30 dark:text-cyan-400 flex items-center justify-center shadow-xs">
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">{title}</span>
        </div>
        <ProvenanceTag type={provenanceType} source={provenanceSource} size="sm" />
      </div>

      <div className="mt-1">
        {isNotLoaded ? (
          <div className="text-xl font-bold text-slate-500">Not loaded</div>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-ink tracking-tight tabular-nums font-mono">
              {animatedValue}
            </span>
            {changeValue && (
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${changeStyle.bg} ${changeStyle.text} tabular-nums font-mono`}
              >
                {changeStyle.icon}
                <span>{changeValue} vs prev</span>
              </span>
            )}
          </div>
        )}
      </div>

      {subtext && (
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-navy-800 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
          {subtext}
        </div>
      )}
    </div>
  );
};
