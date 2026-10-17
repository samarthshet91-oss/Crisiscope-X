import React from 'react';
import { CloudRain, Radio, Info, Activity } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useAppStore } from '../../store/useAppStore';
import { ProvenanceTag } from '../../components/ProvenanceTag';

export const RainfallPanel: React.FC = () => {
  const { preparedData, rainfallIntensityMm } = useAppStore();

  const stations = preparedData.filter((d) => d.entityType === 'rainfall_station');
  const primaryStation = stations[0] || {
    name: 'KSNDMC Bellandur #BLR-04',
    rainfallHourlyMm: 68.4,
    rainfall24hMm: 114.2,
    timestamp: '2026-10-16T18:04:00+05:30',
    qualityFlags: { ageMinutes: 16 },
  };

  // 6-hour rainfall trend data for Bellandur
  const trendData = [
    { time: '13:00', mm: 4.2 },
    { time: '14:00', mm: 8.5 },
    { time: '15:00', mm: 16.0 },
    { time: '16:00', mm: 32.4 },
    { time: '17:00', mm: 52.0 },
    { time: '18:00', mm: rainfallIntensityMm || 68.4 },
  ];

  const currentMm = rainfallIntensityMm || primaryStation.rainfallHourlyMm || 68.4;
  const isCloudburst = currentMm >= 65;
  const isHeavy = currentMm >= 30;

  return (
    <div className="bg-navy-900/90 border border-navy-700/80 rounded-card p-4 text-white shadow-glass flex flex-col justify-between backdrop-blur-md h-full">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(0,229,255,0.2)]">
              <CloudRain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Rainfall telemetry
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>KSNDMC Sensor Stream</span>
              </div>
            </div>
          </div>
          <ProvenanceTag type="Observed" source="KSNDMC Telemetry BLR-04" size="sm" />
        </div>

        {/* Primary Station Reading Card */}
        <div className="bg-navy-950/80 border border-navy-800 rounded-xl p-3.5 mb-3 shadow-inner">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-300 truncate max-w-[200px]">
              {primaryStation.name}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {primaryStation.qualityFlags.ageMinutes}m ago (Fresh)
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tabular-nums font-mono">
              {currentMm}
            </span>
            <span className="text-xs font-semibold text-cyan-400 font-mono">mm / hr</span>
            <span
              className={`ml-auto text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
                isCloudburst
                  ? 'bg-risk-red/20 text-risk-red border border-risk-red/40 animate-pulse'
                  : isHeavy
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {isCloudburst ? 'CLOUDBURST' : isHeavy ? 'HEAVY' : 'MODERATE'}
            </span>
          </div>

          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-navy-800/80 pt-2 font-mono">
            <span>24h Cumulative:</span>
            <span className="text-slate-200 font-bold tabular-nums">
              {primaryStation.rainfall24hMm ?? 114.2} mm
            </span>
          </div>
        </div>

        {/* 6-Hour Precipitation Surge Graph */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-mono">
            <span>6-hour precipitation surge</span>
            <span className="text-cyan-400 font-semibold">Peak: {currentMm} mm/h</span>
          </div>
          <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#62748E" fontSize={9} tickLine={false} />
                <YAxis stroke="#62748E" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#040814',
                    borderColor: '#00E5FF',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                    boxShadow: '0 0 15px rgba(0,229,255,0.2)',
                  }}
                  formatter={(val: any) => [`${val} mm/h`, 'Intensity']}
                />
                <Area
                  type="monotone"
                  dataKey="mm"
                  stroke="#00E5FF"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#rainGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Mandatory Satellite / Telemetry Disclaimer */}
      <div className="p-2.5 rounded-xl bg-navy-950/90 border border-navy-800 flex items-start gap-2 text-[10px] text-slate-400 leading-snug">
        <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <p>
          Satellite estimates (NASA GPM 10km grid) lack street precision. Telemetric rain-gauges (KSNDMC) are prioritized for hydraulic calculation.
        </p>
      </div>
    </div>
  );
};
