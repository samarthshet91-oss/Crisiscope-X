/**
 * Landing hero configuration
 */

export type HeroMode = 'hybrid' | '3d' | 'video' | 'static';

export interface HeroConfig {
  mode: HeroMode;
  videoSrcMp4: string;
  videoSrcWebm: string;
  posterSrc: string;
  enableCityCanvas: boolean;
  rainParticleCount: number;
}

export const HERO_CONFIG: HeroConfig = {
  mode: 'hybrid', // Combines cinematic dark styling with animated rain particles & canvas
  videoSrcMp4: '/media/hero-rain.mp4',
  videoSrcWebm: '/media/hero-rain.webm',
  posterSrc: '/media/hero-poster.jpg',
  enableCityCanvas: true,
  rainParticleCount: 120,
};
