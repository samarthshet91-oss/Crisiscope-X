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

  const COLORS = ['#1769FF', '#12A5A0', '#F59E0B', '#E5384D'];

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
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
              <LineChartIcon className="w-4 h-4" />
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-ink tracking-tight">
              Risk Analytics
            </h1>
            <RiskBadge level={riskResult?.riskLevel || 'Severe'} showEstimateLabel size="sm" />
            <ProvenanceTag type="Model estimate" size="sm" />
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Ward-level predictive risk indices, multi-factor attribution, and uncertainty range bounds across Bengaluru basins.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl text-xs font-semibold self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'overview' ? 'bg-white text-ink shadow-xs' : 'text-slate-600 hover:text-ink'
            }`}
          >
            Risk overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('factors')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'factors' ? 'bg-white text-ink shadow-xs' : 'text-slate-600 hover:text-ink'
            }`}
          >
            Contributing factors
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'comparison' ? 'bg-white text-ink shadow-xs' : 'text-slate-600 hover:text-ink'
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
          changeValue="+3"
          changeDirection="up"
          isIncreaseWorse={true}
          icon={AlertTriangle}
          provenanceType="Observed"
          provenanceSource="BBMP Chronic Waterlogging Points"
          subtext="Identified in BBMP 2024 Drainage Survey"
        />

        <KpiCard
          title="High-risk wards"
          value={`${highRiskWards} wards`}
          changeValue="+1"
          changeDirection="up"
          isIncreaseWorse={true}
          icon={MapPin}
          provenanceType="Model estimate"
          subtext="Risk score > 60/100 threshold"
        />

        <KpiCard
          title="Critical facilities at risk"
          value={`${criticalFacilitiesCount} assets`}
          changeValue="+2"
          changeDirection="up"
          isIncreaseWorse={true}
          icon={Building}
          provenanceType="Model estimate"
          subtext="Hospitals and primary care centres in flood buffer"
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
          <div className="lg:col-span-7 bg-card rounded-card p-5 shadow-card border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-ink">Relative risk by ward</h3>
                <p className="text-[11px] text-slate-500">
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
                    stroke="#5B6B86"
                    fontSize={11}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke="#5B6B86" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#060D1E',
                      borderColor: '#1E356A',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#fff',
                    }}
                    formatter={(val: any, name: any, item: any) => [
                      `${val}/100 (${item.payload.level})`,
                      'Risk index',
                    ]}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="#1769FF" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
              <span>Source: Crisiscope X Hydrological Graph Model</span>
              <span className="font-mono">Wards: Bellandur, Doddanekkundi, Koramangala</span>
            </div>
          </div>

          {/* Donut Chart: Contributing Factors */}
          <div className="lg:col-span-5 bg-card rounded-card p-5 shadow-card border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-ink">Contributing factor attribution</h3>
                <p className="text-[11px] text-slate-500">Weight breakdown of flood vulnerability</p>
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
                      backgroundColor: '#060D1E',
                      borderColor: '#1E356A',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#fff',
                    }}
                    formatter={(val: any) => [`${val}%`, 'Contribution weight']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 pt-1 border-t border-slate-100 text-xs">
              {contributingData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-slate-700 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-ink tabular-nums">{item.weight}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Line Chart: Rainfall and Risk over scenario timeline with uncertainty band */}
      <div className="bg-card rounded-card p-5 shadow-card border border-slate-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-ink">
              Rainfall intensity & risk projection over scenario timeline
            </h3>
            <p className="text-[11px] text-slate-500">
              Shaded band reflects model uncertainty range [optimistic, expected, pessimistic bounds]
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono">
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
                  <stop offset="5%" stopColor="#1769FF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1769FF" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#5B6B86" fontSize={11} />
              <YAxis yAxisId="left" stroke="#5B6B86" fontSize={11} domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" stroke="#0EA5E9" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#060D1E',
                  borderColor: '#1E356A',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#fff',
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
                stroke="#1769FF"
                strokeWidth={2.5}
                name="Expected risk score"
                dot={{ r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="rainfall"
                stroke="#0EA5E9"
                strokeWidth={2}
                strokeDasharray="4 4"
                name="Rainfall (mm/h)"
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
