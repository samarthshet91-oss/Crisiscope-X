import React from 'react';
import { CloudRain, Radio, Info } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useAppStore } from '../../store/useAppStore';
import { ProvenanceTag } from '../../components/ProvenanceTag';

export const RainfallPanel: React.FC = () => {
  const { preparedData } = useAppStore();

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
    { time: '18:00', mm: 68.4 },
  ];

  return (
    <div className="bg-card border border-slate-200/80 dark:border-navy-700/80 rounded-card p-4 text-ink shadow-card flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400 flex items-center justify-center">
              <CloudRain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                Rainfall telemetry
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-300">
                <Radio className="w-3 h-3 text-emerald-500 dark:text-emerald-400 animate-pulse" />
                <span>KSNDMC Telemetric Network</span>
              </div>
            </div>
          </div>
          <ProvenanceTag type="Observed" source="KSNDMC Telemetry BLR-04" size="sm" />
        </div>

        {/* Primary Station Reading */}
        <div className="bg-slate-50 dark:bg-navy-950/70 border border-slate-200 dark:border-navy-800 rounded-xl p-3 mb-3">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
              {primaryStation.name}
            </span>
            <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {primaryStation.qualityFlags.ageMinutes}m ago
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-ink tabular-nums">
              {primaryStation.rainfallHourlyMm ?? 'Not available'}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">mm / hr</span>
            <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
              24h cum: <strong className="text-slate-800 dark:text-slate-200 tabular-nums">{primaryStation.rainfall24hMm ?? 'Not available'} mm</strong>
            </span>
          </div>
        </div>

        {/* Small trend sparkline */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>6-hour precipitation surge</span>
            <span className="font-mono text-sky-300">Peak: 68.4 mm/h</span>
          </div>
          <div className="h-20 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 2, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#5B6B86" fontSize={9} tickLine={false} />
                <YAxis stroke="#5B6B86" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#060D1E',
                    borderColor: '#1E356A',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                  formatter={(val: any) => [`${val} mm/h`, 'Intensity']}
                />
                <Area
                  type="monotone"
                  dataKey="mm"
                  stroke="#38BDF8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#rainGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Mandatory satellite disclaimer */}
      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-800 flex items-start gap-2 text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
        <Info className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
        <p>
          Satellite rainfall estimates cover about 10 km. They cannot show which street is flooded. Ground telemetric stations are prioritized.
        </p>
      </div>
    </div>
  );
};
