import React from 'react';
import { PlayCircle, Cpu, Database } from 'lucide-react';
import { AppMode } from '../store/useAppStore';

interface ModeBadgeProps {
  mode: AppMode;
  onToggle?: () => void;
  className?: string;
}

export const ModeBadge: React.FC<ModeBadgeProps> = ({ mode, onToggle, className = '' }) => {
  const getModeDetails = () => {
    switch (mode) {
      case 'Replay':
        return {
          icon: <PlayCircle className="w-3.5 h-3.5" />,
          label: 'Replay',
          bg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
          dot: 'bg-indigo-500',
        };
      case 'Live simulation':
        return {
          icon: <Cpu className="w-3.5 h-3.5" />,
          label: 'Live simulation',
          bg: 'bg-sky-50 border-sky-200 text-sky-700',
          dot: 'bg-sky-500',
        };
      case 'Mock data':
      default:
        return {
          icon: <Database className="w-3.5 h-3.5" />,
          label: 'Mock data',
          bg: 'bg-amber-50 border-amber-300 text-amber-800',
          dot: 'bg-amber-500',
        };
    }
  };

  const details = getModeDetails();

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-badge border transition-all hover:opacity-90 active:scale-95 ${details.bg} ${className}`}
      title={`Current runtime mode: ${details.label}. Click to switch mode.`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${details.dot}`} />
      {details.icon}
      <span>{details.label}</span>
    </button>
  );
};
