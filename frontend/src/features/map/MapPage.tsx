import React from 'react';
import { Map as MapIcon, Layers, Compass, Maximize2 } from 'lucide-react';
import { InteractiveMap } from './InteractiveMap';
import { ProvenanceTag } from '../../components/ProvenanceTag';
import { useAppStore } from '../../store/useAppStore';

export const MapPage: React.FC = () => {
  const { currentScenario } = useAppStore();

  return (
    <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-signal-blue text-white flex items-center justify-center shadow-xs">
              <MapIcon className="w-4 h-4" />
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-ink tracking-tight">
              Bengaluru Basin Map Explorer
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-signal-blue-light/50 border border-signal-blue/30 text-signal-blue dark:bg-navy-900 dark:border-cyan-500/30 dark:text-cyan-300 font-mono font-bold">
              198 BBMP Wards
            </span>
            <ProvenanceTag type="Observed" size="sm" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Full spatial intelligence view with flood hotspots, stormwater drains, KSNDMC stations, and emergency facilities.
          </p>
        </div>
      </div>

      {/* Full Size Map View */}
      <div className="flex-1 w-full rounded-card overflow-hidden shadow-card border border-slate-200 dark:border-navy-800">
        <InteractiveMap
          is3D={false}
          showOverlayPanels={true}
          interactiveDisruption={true}
          className="h-full w-full"
        />
      </div>
    </div>
  );
};
