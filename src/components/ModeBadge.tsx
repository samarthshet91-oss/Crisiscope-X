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
          bg: 'bg-purple-950/70 border-purple-500/40 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
          dot: 'bg-purple-400',
        };
      case 'Live simulation':
        return {
          icon: <Cpu className="w-3.5 h-3.5" />,
          label: 'Live simulation',
          bg: 'bg-navy-950/80 border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.25)]',
          dot: 'bg-cyan-400 animate-pulse',
        };
      case 'Mock data':
      default:
        return {
          icon: <Database className="w-3.5 h-3.5" />,
          label: 'Mock data',
          bg: 'bg-navy-950/80 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
          dot: 'bg-amber-400',
        };
    }
  };

  const details = getModeDetails();

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-badge border backdrop-blur-md transition-all hover:brightness-125 active:scale-95 ${details.bg} ${className}`}
      title={`Current runtime mode: ${details.label}. Click to switch mode.`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${details.dot}`} />
      {details.icon}
      <span>{details.label}</span>
    </button>
  );
};
