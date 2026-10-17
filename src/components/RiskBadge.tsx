import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { RelativeRiskLevel } from '../contracts';

interface RiskBadgeProps {
  level: RelativeRiskLevel;
  showEstimateLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  showEstimateLabel = false,
  size = 'md',
  className = '',
}) => {
  const getBadgeConfig = () => {
    switch (level) {
      case 'Severe':
        return {
          bg: 'bg-risk-red/15 border-risk-red/50 shadow-[0_0_12px_rgba(255,59,83,0.3)]',
          text: 'text-risk-red',
          icon: <AlertCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          label: 'Severe',
        };
      case 'High':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
          text: 'text-amber-400',
          icon: <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          label: 'High',
        };
      case 'Moderate':
        return {
          bg: 'bg-yellow-500/15 border-yellow-500/35',
          text: 'text-yellow-300',
          icon: <Info className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          label: 'Moderate',
        };
      case 'Low':
      default:
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/40',
          text: 'text-emerald-400',
          icon: <CheckCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          label: 'Low',
        };
    }
  };

  const config = getBadgeConfig();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1 font-mono uppercase tracking-wider',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-semibold',
    lg: 'px-3 py-1.5 text-sm gap-2 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-badge border backdrop-blur-xs transition-colors ${sizeClasses} ${config.bg} ${config.text} ${className}`}
      role="status"
      aria-label={`Relative risk level: ${config.label}${showEstimateLabel ? ' (Model estimate)' : ''}`}
    >
      {config.icon}
      <span>{config.label}</span>
      {showEstimateLabel && (
        <span className="text-[10px] font-normal opacity-75 pl-1 border-l border-current">
          Model estimate
        </span>
      )}
    </span>
  );
};
