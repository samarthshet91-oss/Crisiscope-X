/**
 * Map configuration
 * Centred on Bengaluru with dark treatment matching Navy 900.
 */

import { ACTIVE_CITY } from './city';

export const MAP_CONFIG = {
  defaultCenter: ACTIVE_CITY.coordinates,
  defaultZoom: 11.5,
  minZoom: 9,
  maxZoom: 18,
  defaultPitch: 0,
  pitch3D: 52,
  defaultBearing: -15,
  attributionText: '© OpenStreetMap contributors, © CARTO | Crisiscope X prototype',
  // Vector or raster dark style
  darkRasterStyle: {
    version: 8 as const,
    sources: {
      'carto-dark': {
        type: 'raster' as const,
        tiles: [
          'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
          'https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
          'https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
        ],
        tileSize: 256,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
      },
    },
    layers: [
      {
        id: 'carto-dark-layer',
        type: 'raster' as const,
        source: 'carto-dark',
        minzoom: 0,
        maxzoom: 20,
        paint: {
          'raster-opacity': 0.92,
          'raster-contrast': 0.1,
        },
      },
    ],
  },
};
