import { create } from 'zustand';
import {
  ScenarioDefinition,
  RiskResult,
  InterventionResult,
  ScenarioAlert,
  PreparedData,
  AffectedAsset,
  ModelStatusType,
} from '../contracts';
import { api, IS_MOCK_MODE } from '../api';
import { DATASETS_CONFIG } from '../config/datasets';

export type AppMode = 'Mock data' | 'Replay' | 'Live simulation';

export interface LayerVisibilityState {
  floodHotspots: boolean;
  drains: boolean;
  roadNetwork: boolean;
  facilities: boolean;
  rainfallStations: boolean;
  riskOverlay: boolean;
  terrain3D: boolean;
  nasaImerg: boolean;
  ghslPopulation: boolean;
  copernicusFlood: boolean;
}

export interface GuidedDemoState {
  isActive: boolean;
  currentStep: number;
  elapsedSeconds: number;
  totalSeconds: number;
}

interface AppStoreState {
  // Mode and Status
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  modelStatus: ModelStatusType;
  modelStatusReason: string;
  runtimeArchitecture: string;
  setRuntimeArchitecture: (arch: string) => void;
  setModelStatus: (status: ModelStatusType, reason?: string) => void;

  // Scenarios and Data
  scenarios: ScenarioDefinition[];
  currentScenario: ScenarioDefinition | null;
  setCurrentScenario: (scenario: ScenarioDefinition) => void;
  riskResult: RiskResult | null;
  interventionResult: InterventionResult | null;
  alerts: ScenarioAlert[];
  preparedData: PreparedData[];
  selectedAsset: AffectedAsset | null;
  setSelectedAsset: (asset: AffectedAsset | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Layers
  layers: LayerVisibilityState;
  toggleLayer: (layerKey: keyof LayerVisibilityState) => void;
  setLayer: (layerKey: keyof LayerVisibilityState, visible: boolean) => void;

  // Simulation and Cascade Controls
  rainfallIntensityMm: number;
  setRainfallIntensityMm: (mm: number) => void;
  injectedDisruptions: string[];
  toggleDisruptRoad: (roadId: string) => void;
  injectedUnavailableFacilities: string[];
  toggleUnavailableFacility: (facilityId: string) => void;
  isSimulating: boolean;
  timelineStep: number;
  setTimelineStep: (step: number) => void;
  isTimelinePlaying: boolean;
  setIsTimelinePlaying: (playing: boolean) => void;
  timelineSpeed: number;
  setTimelineSpeed: (speed: number) => void;

  // Guided Demo Mode
  guidedDemo: GuidedDemoState;
  startGuidedDemo: () => void;
  nextDemoStep: () => void;
  skipDemoStep: () => void;
  endGuidedDemo: () => void;
  tickDemoTimer: () => void;

  // Loader
  isLoading: boolean;
  loadAllData: () => Promise<void>;
  runCascadeSimulation: () => Promise<void>;
  resetScenarioState: () => void;
}

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('cx-theme') as 'light' | 'dark' | null;
  const theme = saved || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  }
  return theme;
};

export const useAppStore = create<AppStoreState>((set, get) => ({
  mode: IS_MOCK_MODE ? 'Mock data' : 'Live simulation',
  setMode: (mode) => set({ mode }),
  theme: getInitialTheme(),
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cx-theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
  modelStatus: 'ok',
  modelStatusReason: '',
  runtimeArchitecture: 's390x',
  setRuntimeArchitecture: (arch) => {
    api.setCustomArchitecture(arch);
    set({ runtimeArchitecture: arch });
  },
  setModelStatus: (status, reason) => {
    api.setCustomStatus(status, reason);
    set({ modelStatus: status, modelStatusReason: reason || '' });
    get().loadAllData();
  },

  scenarios: [],
  currentScenario: null,
  setCurrentScenario: (scenario) => {
    set({ currentScenario: scenario, timelineStep: 0 });
    get().loadAllData();
  },
  riskResult: null,
  interventionResult: null,
  alerts: [],
  preparedData: [],
  selectedAsset: null,
  setSelectedAsset: (asset) => set({ selectedAsset: asset }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  layers: {
    floodHotspots: true,
    drains: true,
    roadNetwork: true,
    facilities: true,
    rainfallStations: true,
    riskOverlay: true,
    terrain3D: false,
    nasaImerg: false,
    ghslPopulation: false,
    copernicusFlood: false,
  },
  toggleLayer: (layerKey) =>
    set((state) => ({
      layers: { ...state.layers, [layerKey]: !state.layers[layerKey] },
    })),
  setLayer: (layerKey, visible) =>
    set((state) => ({
      layers: { ...state.layers, [layerKey]: visible },
    })),

  rainfallIntensityMm: 72,
  setRainfallIntensityMm: (mm) => set({ rainfallIntensityMm: mm }),
  injectedDisruptions: [],
  toggleDisruptRoad: (roadId) =>
    set((state) => {
      const exists = state.injectedDisruptions.includes(roadId);
      return {
        injectedDisruptions: exists
          ? state.injectedDisruptions.filter((id) => id !== roadId)
          : [...state.injectedDisruptions, roadId],
      };
    }),
  injectedUnavailableFacilities: [],
  toggleUnavailableFacility: (facilityId) =>
    set((state) => {
      const exists = state.injectedUnavailableFacilities.includes(facilityId);
      return {
        injectedUnavailableFacilities: exists
          ? state.injectedUnavailableFacilities.filter((id) => id !== facilityId)
          : [...state.injectedUnavailableFacilities, facilityId],
      };
    }),
  isSimulating: false,
  timelineStep: 0,
  setTimelineStep: (step) => set({ timelineStep: step }),
  isTimelinePlaying: false,
  setIsTimelinePlaying: (playing) => set({ isTimelinePlaying: playing }),
  timelineSpeed: 1,
  setTimelineSpeed: (speed) => set({ timelineSpeed: speed }),

  // Guided demo
  guidedDemo: {
    isActive: false,
    currentStep: 0,
    elapsedSeconds: 0,
    totalSeconds: 300, // 5 minutes default
  },
  startGuidedDemo: () => {
    set({
      guidedDemo: {
        isActive: true,
        currentStep: 0,
        elapsedSeconds: 0,
        totalSeconds: 300,
      },
      timelineStep: 0,
    });
  },
  nextDemoStep: () => {
    set((state) => {
      const next = state.guidedDemo.currentStep + 1;
      if (next >= 7) {
        return {
          guidedDemo: { ...state.guidedDemo, isActive: false, currentStep: 0 },
        };
      }
      return {
        guidedDemo: { ...state.guidedDemo, currentStep: next },
        timelineStep: Math.min(next, 4),
      };
    });
  },
  skipDemoStep: () => {
    get().nextDemoStep();
  },
  endGuidedDemo: () => {
    set((state) => ({
      guidedDemo: { ...state.guidedDemo, isActive: false, currentStep: 0 },
    }));
  },
  tickDemoTimer: () => {
    set((state) => {
      if (!state.guidedDemo.isActive) return state;
      const newElapsed = state.guidedDemo.elapsedSeconds + 1;
      if (newElapsed >= state.guidedDemo.totalSeconds) {
        return {
          guidedDemo: { ...state.guidedDemo, isActive: false, elapsedSeconds: 0 },
        };
      }
      return {
        guidedDemo: { ...state.guidedDemo, elapsedSeconds: newElapsed },
      };
    });
  },

  isLoading: false,
  loadAllData: async () => {
    set({ isLoading: true });
    try {
      const [scenariosRes, prepRes, riskRes, interventionRes, alertsRes] = await Promise.all([
        api.getScenarios(),
        api.getPreparedData(),
        api.getRiskResult(get().currentScenario?.scenarioId),
        api.getInterventionResult(get().currentScenario?.scenarioId),
        api.getScenarioAlerts(get().currentScenario?.scenarioId),
      ]);

      const activeScenario = get().currentScenario || scenariosRes.data[0];

      set({
        scenarios: scenariosRes.data,
        currentScenario: activeScenario,
        preparedData: prepRes.data,
        riskResult: riskRes.data,
        interventionResult: interventionRes.data,
        alerts: alertsRes.data,
        modelStatus: riskRes.modelStatus,
        modelStatusReason: riskRes.modelStatusReason || '',
        runtimeArchitecture: riskRes.processingMetadata.runtimeArchitecture,
        rainfallIntensityMm: activeScenario.rainfallIntensityMmPerHour,
        isLoading: false,
      });
    } catch (e) {
      console.error('Error loading data in store:', e);
      set({ isLoading: false });
    }
  },

  runCascadeSimulation: async () => {
    set({ isSimulating: true });
    try {
      const simRes = await api.runSimulation({
        scenarioId: get().currentScenario?.scenarioId,
        rainfallIntensity: get().rainfallIntensityMm,
        injectedDisruptions: get().injectedDisruptions,
        injectedUnavailableFacilities: get().injectedUnavailableFacilities,
      });
      set({
        riskResult: simRes.data.risk,
        interventionResult: simRes.data.interventions,
        timelineStep: 1,
        isSimulating: false,
      });
    } catch (err) {
      set({ isSimulating: false });
    }
  },

  resetScenarioState: () => {
    const defaultScenario = get().scenarios[0] || null;
    set({
      currentScenario: defaultScenario,
      timelineStep: 0,
      isTimelinePlaying: false,
      injectedDisruptions: [],
      injectedUnavailableFacilities: [],
      rainfallIntensityMm: defaultScenario?.rainfallIntensityMmPerHour || 72,
    });
    get().loadAllData();
  },
}));
