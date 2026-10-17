import {
  BackendResponse,
  ScenarioDefinition,
  RiskResult,
  InterventionResult,
  PreparedData,
  ScenarioAlert,
  ModelStatusType,
} from '../contracts';
import {
  MOCK_PREPARED_DATA,
  MOCK_SCENARIOS,
  MOCK_RISK_RESULT,
  MOCK_INTERVENTION_RESULT,
  MOCK_ALERTS,
} from './mock/fixtures';

const API_BASE = import.meta.env.VITE_API_BASE;
export const IS_MOCK_MODE = !API_BASE;

export interface SimulationParams {
  scenarioId?: string;
  rainfallIntensity?: number;
  injectedDisruptions?: string[];
  injectedUnavailableFacilities?: string[];
}

class ApiClient {
  private customModelStatus: ModelStatusType = 'ok';
  private customModelStatusReason: string = '';
  private customArchitecture: string = 's390x'; // LinuxONE / s390x verified
  private isStaleDatasetSimulated: boolean = false;

  public setCustomStatus(status: ModelStatusType, reason?: string) {
    this.customModelStatus = status;
    this.customModelStatusReason = reason || '';
  }

  public setCustomArchitecture(arch: string) {
    this.customArchitecture = arch;
  }

  public setStaleDatasetSimulation(stale: boolean) {
    this.isStaleDatasetSimulated = stale;
  }

  public getCustomArchitecture(): string {
    return this.customArchitecture;
  }

  public getCustomStatus(): { status: ModelStatusType; reason: string } {
    return { status: this.customModelStatus, reason: this.customModelStatusReason };
  }

  // --- Generic API Wrapper ---
  private async execute<T>(endpoint: string, mockDataFactory: () => T): Promise<BackendResponse<T>> {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}${endpoint}`);
        if (!res.ok) {
          throw new Error(`API error ${res.status}: ${res.statusText}`);
        }
        return await res.json();
      } catch (err: any) {
        return {
          schemaVersion: '1.0.0',
          data: mockDataFactory(),
          inputErrors: [
            {
              field: 'VITE_API_BASE',
              message: `Failed to reach live API at ${API_BASE}. Falling back to mock data.`,
              suggestedFix: 'Check backend server health or verify network connectivity.',
              critical: false,
            },
          ],
          modelStatus: 'degraded',
          modelStatusReason: 'Live API connection error; rendered mock data fallback.',
          processingMetadata: {
            processingMs: 0,
            runtimeArchitecture: 'unknown',
            modelVersion: 'v2.4.1-fallback',
            timestamp: new Date().toISOString(),
          },
        };
      }
    }

    // Pure Mock Mode
    await new Promise((resolve) => setTimeout(resolve, 80)); // Simulate micro latency

    const baseData = mockDataFactory();

    return {
      schemaVersion: '1.0.0',
      data: baseData,
      inputErrors: this.customModelStatus === 'failed' ? [
        {
          field: 'rainfall_telemetry',
          message: 'KSNDMC station #BLR-04 communication timeout (>180 min since last ping).',
          suggestedFix: 'Restore telemetry link or switch to historical synoptic calibration.',
          critical: true,
        },
      ] : [],
      modelStatus: this.customModelStatus,
      modelStatusReason: this.customModelStatusReason || (this.customModelStatus === 'failed' ? 'KSNDMC rainfall is 3 hours old. Recommendations are paused until it updates.' : undefined),
      processingMetadata: {
        processingMs: 412,
        runtimeArchitecture: this.customArchitecture, // e.g. "s390x"
        modelVersion: 'v2.4.1-hydra-cascade',
        timestamp: '2026-10-16T18:20:00+05:30',
        systemDigest: 'sha256:d8a23b9701fc3e1',
      },
    };
  }

  // --- Specific Calls ---
  async getPreparedData(): Promise<BackendResponse<PreparedData[]>> {
    return this.execute('/api/v1/data/prepared', () => MOCK_PREPARED_DATA);
  }

  async getScenarios(): Promise<BackendResponse<ScenarioDefinition[]>> {
    return this.execute('/api/v1/scenarios', () => MOCK_SCENARIOS);
  }

  async getScenarioById(id: string): Promise<BackendResponse<ScenarioDefinition>> {
    return this.execute(`/api/v1/scenarios/${id}`, () => {
      const found = MOCK_SCENARIOS.find((s) => s.scenarioId === id);
      return found || MOCK_SCENARIOS[0];
    });
  }

  async getRiskResult(scenarioId?: string): Promise<BackendResponse<RiskResult>> {
    return this.execute(`/api/v1/risk?scenarioId=${scenarioId || 'default'}`, () => MOCK_RISK_RESULT);
  }

  async getInterventionResult(scenarioId?: string): Promise<BackendResponse<InterventionResult>> {
    return this.execute(`/api/v1/interventions?scenarioId=${scenarioId || 'default'}`, () => {
      const clone = JSON.parse(JSON.stringify(MOCK_INTERVENTION_RESULT)) as InterventionResult;
      if (this.isStaleDatasetSimulated) {
        clone.trustGate.allFresh = false;
        clone.trustGate.staleDatasets = [{ name: 'KSNDMC Telemetry BLR-04', ageHours: 3.2 }];
        clone.trustGate.humanReviewNeeded = true;
        clone.trustGate.humanReviewReason = 'KSNDMC rainfall is 3 hours old. Recommendations are paused until it updates.';
      }
      return clone;
    });
  }

  async getScenarioAlerts(scenarioId?: string): Promise<BackendResponse<ScenarioAlert[]>> {
    return this.execute(`/api/v1/alerts?scenarioId=${scenarioId || 'default'}`, () => MOCK_ALERTS);
  }

  async runSimulation(params: SimulationParams): Promise<BackendResponse<{
    scenario: ScenarioDefinition;
    risk: RiskResult;
    interventions: InterventionResult;
    cascadeProgression: Array<{ step: number; assetId: string; name: string; impact: string }>;
  }>> {
    return this.execute('/api/v1/simulation/run', () => {
      const scenario = JSON.parse(JSON.stringify(MOCK_SCENARIOS[0])) as ScenarioDefinition;
      if (params.rainfallIntensity) {
        scenario.rainfallIntensityMmPerHour = params.rainfallIntensity;
      }
      return {
        scenario,
        risk: MOCK_RISK_RESULT,
        interventions: MOCK_INTERVENTION_RESULT,
        cascadeProgression: [
          { step: 1, assetId: 'road-ecospace-underpass', name: 'Ecospace Underpass', impact: 'Flooded road (100% carriage submerged)' },
          { step: 2, assetId: 'road-kadubeesanahalli-junc', name: 'Kadubeesanahalli Junction', impact: 'Connected road gridlock (+35 min delay)' },
          { step: 3, assetId: 'road-sarjapur-junction', name: 'Sarjapur-ORR Junction (Iblur)', impact: 'Detour route saturated' },
          { step: 4, assetId: 'fac-sakra-world-hospital', name: 'Sakra World Hospital', impact: 'Reduced access (-65% inbound ambulance throughput)' },
        ],
      };
    });
  }
}

export const api = new ApiClient();
