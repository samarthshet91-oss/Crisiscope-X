/**
 * City configuration
 * Crisiscope X is dedicated to Bengaluru.
 */

export interface CityOption {
  id: string;
  name: string;
  state: string;
  country: string;
  enabled: boolean;
  coordinates: [number, number]; // [lng, lat]
  bounds: [[number, number], [number, number]];
  disabledReason?: string;
}

export const ACTIVE_CITY: CityOption = {
  id: 'bengaluru',
  name: 'Bengaluru',
  state: 'Karnataka',
  country: 'India',
  enabled: true,
  coordinates: [77.5946, 12.9716],
  bounds: [
    [77.45, 12.83], // SW
    [77.78, 13.14], // NE
  ],
};

export const AVAILABLE_CITIES: CityOption[] = [
  ACTIVE_CITY,
  {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    enabled: false,
    coordinates: [80.2707, 13.0827],
    bounds: [[80.1, 12.9], [80.35, 13.2]],
    disabledReason: 'Hydrological digital twin not yet calibrated for Chennai basins',
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    enabled: false,
    coordinates: [72.8777, 19.076],
    bounds: [[72.75, 18.89], [73.0, 19.25]],
    disabledReason: 'Tidal surge integration under development',
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    enabled: false,
    coordinates: [78.4867, 17.385],
    bounds: [[78.3, 17.2], [78.6, 17.55]],
    disabledReason: 'Musi river basin topography model pending verification',
  },
];
