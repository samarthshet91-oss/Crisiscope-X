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
          bg: 'bg-red-50 border-red-200',
          text: 'text-risk-red',
          icon: <AlertCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          label: 'Severe',
        };
      case 'High':
        return {
          bg: 'bg-amber-50 border-amber-300',
          text: 'text-amber-800',
          icon: <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          label: 'High',
        };
      case 'Moderate':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-800',
          icon: <Info className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          label: 'Moderate',
        };
      case 'Low':
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-200',
          text: 'text-risk-green',
          icon: <CheckCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          label: 'Low',
        };
    }
  };

  const config = getBadgeConfig();

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-badge border ${sizeClasses} ${config.bg} ${config.text} ${className}`}
      role="status"
      aria-label={`Relative risk level: ${config.label}${showEstimateLabel ? ' (Model estimate)' : ''}`}
    >
      {config.icon}
      <span>{config.label}</span>
      {showEstimateLabel && (
        <span className="text-[10px] font-normal opacity-80 pl-1 border-l border-current">
          Model estimate
        </span>
      )}
    </span>
  );
};
