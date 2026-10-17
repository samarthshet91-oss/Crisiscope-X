import React, { useState } from 'react';
import {
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShieldCheck,
  AlertTriangle,
  Building,
  MapPin,
  Activity,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  ComposedChart,
  Legend,
} from 'recharts';
import { useAppStore } from '../../store/useAppStore';
import { KpiCard } from '../dashboard/KpiCard';
import { ProvenanceTag } from '../../components/ProvenanceTag';
import { RiskBadge } from '../../components/RiskBadge';

export const RiskAnalyticsPage: React.FC = () => {
  const { riskResult, currentScenario } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'factors' | 'comparison'>('overview');

  const wardData =
    riskResult?.wardSummaries.map((w) => ({
      name: w.wardName.split('(')[0].trim(),
      fullName: w.wardName,
      score: w.riskScore,
      level: w.riskLevel,
      flagged: w.flaggedLocationsCount,
      facilities: w.criticalFacilitiesAtRisk,
    })) || [];

  const contributingData =
    riskResult?.contributingFactors.map((f) => ({
      name: f.category,
      weight: f.weightPercent,
      score: f.riskContributionScore,
      evidence: f.evidenceRef,
    })) || [];

  const COLORS = ['#00E5FF', '#10B981', '#F59E0B', '#FF3B53'];

  // Timeline risk and rainfall chart data with uncertainty band (pessimistic / expected / optimistic)
  const timelineData = [
    { time: '17:00', rainfall: 22, risk: 34, minRisk: 28, maxRisk: 40 },
    { time: '17:30', rainfall: 38, risk: 48, minRisk: 42, maxRisk: 55 },
    { time: '18:00', rainfall: 58, risk: 65, minRisk: 58, maxRisk: 72 },
    { time: '18:20', rainfall: 72, risk: 78, minRisk: 72, maxRisk: 84 },
    { time: '18:40', rainfall: 64, risk: 74, minRisk: 68, maxRisk: 81 },
    { time: '19:00', rainfall: 42, risk: 62, minRisk: 56, maxRisk: 70 },
  ];

  const flaggedCount =
    wardData.reduce((acc, curr) => acc + curr.flagged, 0) || 12;
  const highRiskWards =
    wardData.filter((w) => w.score >= 60).length || 3;
  const criticalFacilitiesCount =
    wardData.reduce((acc, curr) => acc + curr.facilities, 0) || 5;
  const confidencePercent = riskResult
    ? Math.round((1 - riskResult.uncertainty.score) * 100)
    : 85;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.25)]">
              <LineChartIcon className="w-4 h-4" />
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight">
              Risk Analytics
            </h1>
            <RiskBadge level={riskResult?.riskLevel || 'Severe'} showEstimateLabel size="sm" />
            <ProvenanceTag type="Model estimate" size="sm" />
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Ward-level predictive risk indices, multi-factor attribution, and uncertainty range bounds across Bengaluru basins.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 p-1 bg-navy-900/90 rounded-xl border border-navy-700/80 text-xs font-semibold self-start sm:self-center shadow-glass">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-signal-blue text-navy-950 font-bold shadow-[0_0_12px_rgba(0,229,255,0.35)]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Risk overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('factors')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'factors'
                ? 'bg-signal-blue text-navy-950 font-bold shadow-[0_0_12px_rgba(0,229,255,0.35)]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Contributing factors
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'comparison'
                ? 'bg-signal-blue text-navy-950 font-bold shadow-[0_0_12px_rgba(0,229,255,0.35)]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Scenario comparison
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Flagged locations"
          value={`${flaggedCount} hotspots`}
          changeValue="+3 chronic"
          changeDirection="up"
          isIncreaseWorse={true}
          icon={AlertTriangle}
          provenanceType="Observed"
          provenanceSource="BBMP Chronic Waterlogging Points"
          subtext="Surveyed in BBMP 2024 Drainage Audit"
        />

        <KpiCard
          title="High-risk wards"
          value={`${highRiskWards} wards`}
          changeValue="Score > 60"
          changeDirection="up"
          isIncreaseWorse={true}
          icon={MapPin}
          provenanceType="Model estimate"
          subtext="Bellandur, Doddanekkundi, Koramangala"
        />

        <KpiCard
          title="Critical facilities at risk"
          value={`${criticalFacilitiesCount} assets`}
          changeValue="+2 in buffer"
          changeDirection="up"
          isIncreaseWorse={true}
          icon={Building}
          provenanceType="Model estimate"
          subtext="Hospitals and primary care centres in flood basin"
        />

        <KpiCard
          title="Data confidence"
          value={`${confidencePercent}%`}
          changeValue="Low uncertainty"
          changeDirection="neutral"
          icon={ShieldCheck}
          provenanceType="Rule-based"
          provenanceSource="Sensor density & age calibration"
          subtext={riskResult?.uncertainty.rationale}
        />
      </div>

      {/* Charts Section */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bar Chart: Risk by Ward */}
          <div className="lg:col-span-7 bg-navy-900/90 rounded-card p-5 shadow-glass border border-navy-700/80 space-y-3 backdrop-blur-md">
            <div className="flex items-center justify-between pb-2 border-b border-navy-800">
              <div>
                <h3 className="text-sm font-bold text-white font-mono">Relative risk by ward</h3>
                <p className="text-[11px] text-slate-400">
                  Computed from drainage density, slope and rainfall telemetry
                </p>
              </div>
              <ProvenanceTag type="Model estimate" size="sm" />
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wardData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#8FA2BE"
                    fontSize={11}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke="#8FA2BE" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#040814',
                      borderColor: '#00E5FF',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#fff',
                      boxShadow: '0 0 15px rgba(0,229,255,0.25)',
                    }}
                    formatter={(val: any, name: any, item: any) => [
                      `${val}/100 (${item.payload.level})`,
                      'Risk index',
                    ]}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="#00E5FF" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-navy-800 font-mono">
              <span>Source: Crisiscope X Hydrological Graph Model</span>
              <span>Wards: Bellandur, Doddanekkundi, Koramangala</span>
            </div>
          </div>

          {/* Donut Chart: Contributing Factors */}
          <div className="lg:col-span-5 bg-navy-900/90 rounded-card p-5 shadow-glass border border-navy-700/80 space-y-3 backdrop-blur-md">
            <div className="flex items-center justify-between pb-2 border-b border-navy-800">
              <div>
                <h3 className="text-sm font-bold text-white font-mono">Contributing factor attribution</h3>
                <p className="text-[11px] text-slate-400">Weight breakdown of flood vulnerability</p>
              </div>
              <ProvenanceTag type="Model estimate" size="sm" />
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contributingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="weight"
                  >
                    {contributingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#040814',
                      borderColor: '#00E5FF',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#fff',
                      boxShadow: '0 0 15px rgba(0,229,255,0.25)',
                    }}
                    formatter={(val: any) => [`${val}%`, 'Contribution weight']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 pt-1 border-t border-navy-800 text-xs font-mono">
              {contributingData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-slate-300 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-white tabular-nums">{item.weight}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Line Chart: Rainfall and Risk over scenario timeline with uncertainty band */}
      <div className="bg-navy-900/90 rounded-card p-5 shadow-glass border border-navy-700/80 space-y-3 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-navy-800 gap-2">
          <div>
            <h3 className="text-sm font-bold text-white font-mono">
              Rainfall intensity & risk projection over scenario timeline
            </h3>
            <p className="text-[11px] text-slate-400">
              Shaded band reflects model uncertainty range [optimistic, expected, pessimistic bounds]
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
              Uncertainty: ±6 pts
            </span>
            <ProvenanceTag type="Model estimate" size="sm" />
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timelineData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#8FA2BE" fontSize={11} />
              <YAxis yAxisId="left" stroke="#8FA2BE" fontSize={11} domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" stroke="#00E5FF" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#040814',
                  borderColor: '#00E5FF',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#fff',
                  boxShadow: '0 0 15px rgba(0,229,255,0.25)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {/* Shaded Uncertainty Band */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="maxRisk"
                stroke="transparent"
                fill="url(#bandGradient)"
                name="Pessimistic risk bound"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="risk"
                stroke="#00E5FF"
                strokeWidth={2.5}
                name="Expected risk score"
                dot={{ r: 4, fill: '#00E5FF' }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="rainfall"
                stroke="#38BDF8"
                strokeWidth={2}
                strokeDasharray="4 4"
                name="Rainfall (mm/h)"
                dot={{ r: 3, fill: '#38BDF8' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
