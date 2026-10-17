/**
 * Crisiscope X — Core TypeScript API Contracts
 * /src/contracts/index.ts
 */

export type ProvenanceType = 'Observed' | 'Synthetic scenario' | 'Model estimate' | 'Rule-based';

export type ModelStatusType = 'ok' | 'degraded' | 'failed';

export type RelativeRiskLevel = 'Low' | 'Moderate' | 'High' | 'Severe';

export interface ProvenanceMeta {
  type: ProvenanceType;
  source: string;
  licence: string;
  notes?: string;
  timestamp?: string;
}

export interface InputError {
  field: string;
  message: string;
  suggestedFix: string;
  critical: boolean;
}

export interface ProcessingMetadata {
  processingMs: number;
  runtimeArchitecture: string; // e.g., "s390x" or "x86_64" or "arm64"
  modelVersion: string;
  timestamp: string;
  systemDigest?: string;
}

export interface BackendResponse<T> {
  schemaVersion: string;
  data: T;
  inputErrors: InputError[];
  modelStatus: ModelStatusType;
  modelStatusReason?: string;
  processingMetadata: ProcessingMetadata;
}

export interface DataQualityFlags {
  isStale: boolean;
  ageMinutes: number;
  missingFields: string[];
  timestampConsistent: boolean;
  uncertaintyScore: number; // 0 to 1
  coverageVerified: boolean;
}

export interface PreparedData {
  id: string;
  entityType: 'rainfall_station' | 'road_segment' | 'facility' | 'drain' | 'hotspot';
  name: string;
  coordinates: [number, number]; // [lng, lat]
  timestamp: string;
  rainfallHourlyMm?: number;
  rainfall24hMm?: number;
  qualityFlags: DataQualityFlags;
  provenance: ProvenanceMeta;
  attributes: Record<string, any>;
}

export interface AffectedAsset {
  id: string;
  name: string;
  type: 'road' | 'hospital' | 'clinic' | 'shelter' | 'bridge';
  wardId: string;
  wardName: string;
  coordinates: [number, number];
  disruptionType: 'flooded_road' | 'submerged_underpass' | 'reduced_access' | 'isolated' | 'demand_surge';
  severity: RelativeRiskLevel;
  delayIncreaseMinutes?: number;
  connectedAssetsCount?: number;
  reason: string;
  timestampIST: string;
  provenance: ProvenanceMeta;
}

export interface ScenarioDefinition {
  scenarioId: string;
  title: string;
  description: string;
  eventTimeIST: string;
  rainfallIntensityMmPerHour: number;
  rainfallAccumulationMm: number;
  syntheticLabels: string[];
  demandAssumptions: string[];
  affectedAssets: AffectedAsset[];
  timelineEvents: ScenarioTimelineEvent[];
  provenance: ProvenanceMeta;
}

export interface ScenarioTimelineEvent {
  stepId: string;
  timeIST: string;
  title: string;
  description: string;
  type: 'rainfall_spike' | 'road_disruption' | 'cascade_spread' | 'facility_reduced' | 'demand_increase';
  assetId?: string;
  affectedCount: number;
  severity: RelativeRiskLevel;
}

export interface ContributingFactor {
  id: string;
  factorName: string;
  category: 'Rainfall intensity' | 'Drainage capacity' | 'Topography & elevation' | 'Road network topology';
  weightPercent: number; // e.g. 42%
  riskContributionScore: number;
  evidenceRef: string;
  provenance: ProvenanceMeta;
}

export interface WardRiskSummary {
  wardId: string;
  wardName: string;
  riskScore: number; // 0 - 100
  riskLevel: RelativeRiskLevel;
  flaggedLocationsCount: number;
  criticalFacilitiesAtRisk: number;
  populationEstimateGHSL?: number | null;
  provenance: ProvenanceMeta;
}

export interface RiskResult {
  riskScore: number; // 0 - 100
  riskLevel: RelativeRiskLevel;
  contributingFactors: ContributingFactor[];
  affectedAssets: AffectedAsset[];
  wardSummaries: WardRiskSummary[];
  uncertainty: {
    score: number; // 0 (low) - 1 (high)
    level: 'Low' | 'Medium' | 'High';
    confidenceInterval: [number, number]; // e.g. [68, 78]
    pessimisticScore?: number;
    expectedScore?: number;
    optimisticScore?: number;
    rationale: string;
  };
  evidenceRefs: string[];
  provenance: ProvenanceMeta;
}

export interface ComparisonMetrics {
  travelTimeMinutes: number;
  accessibilityPercent: number;
  demandServedPercent: number;
  delayedVehiclesCount?: number;
  facilitiesAccessibleCount: number;
  totalFacilitiesCount: number;
}

export interface InterventionOption {
  id: string;
  title: string;
  type: 'baseline' | 'reroute_traffic' | 'dispatch_mobile_drain' | 'activate_secondary_facility';
  metrics: ComparisonMetrics;
  metricsDelta: {
    travelTimeDelta: number; // negative is improvement
    accessibilityDelta: number; // positive is improvement
    demandServedDelta: number;
  };
  keyActions: string[];
  routesGeometry?: [number, number][][];
  safePathsGeometry?: [number, number][][];
  tradeOffs: string[];
  provenance: ProvenanceMeta;
}

export interface InterventionResult {
  scenarioId: string;
  baseline: InterventionOption;
  alternatives: InterventionOption[];
  ranking: {
    rank: number;
    optionId: string;
    score: number;
    isRecommended: boolean;
  }[];
  recommendedOptionId: string | null;
  noAlternativeBeatsBaseline: boolean;
  rationale: string;
  assumptions: string[];
  decisionTrace: {
    inputsConsidered: string[];
    constraintsEnforced: string[];
    rulesApplied: string[];
    modelVersion: string;
    computedAtIST: string;
  };
  trustGate: {
    allFresh: boolean;
    staleDatasets: { name: string; ageHours: number }[];
    humanReviewNeeded: boolean;
    humanReviewReason?: string;
  };
  provenance: ProvenanceMeta;
}

export interface ScenarioAlert {
  id: string;
  title: string;
  severity: RelativeRiskLevel;
  category: 'Disruption' | 'Access cut-off' | 'Drainage overflow' | 'Rainfall threshold';
  description: string;
  locationName: string;
  wardName: string;
  coordinates: [number, number];
  timestampIST: string;
  provenance: ProvenanceMeta;
  suggestedAction: string;
}

export interface DatasetItem {
  id: string;
  name: string;
  category: 'Core' | 'Useful additions' | 'Optional';
  status: 'Loaded' | 'Mock' | 'Not loaded' | 'Stale';
  ageMinutes: number;
  lastUpdatedIST: string;
  licence: string;
  verifiedCoverage: boolean;
  format: string;
  useCase: string;
  limitInPlainLanguage: string;
  attribution: string;
}
