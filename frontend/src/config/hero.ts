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

/* ---------------------------------------------------------------------
   Cinematic hero scenes (SpaceEdu-style "featured + two flanking slots").
   Exactly one scene is featured (headline + backdrop tint); the other two
   fill the left / right slots. Clicking a slot makes it the featured one.
   --------------------------------------------------------------------- */

export type SceneId = 'detect' | 'decide' | 'respond';

export interface HeroScene {
  id: SceneId;
  name: string;            // uppercase headline + slot label
  eyebrow: string;         // small caps line above the headline
  accent: number;          // 0xRRGGBB — tints the 3D city twin
  tint: string;            // CSS colour used for the backdrop glow
  lede: [string, string];  // two lines (second line starts after a <br>)
  orb: 'radar' | 'graph' | 'pulse'; // built-in CSS artwork for the side slots
  /** Optional photographic cut-out (transparent PNG). Overrides the CSS orb. */
  cutout?: string;
  /** Optional looping backdrop clip + poster. Lazy-loaded on first use. */
  clip?: string;
  still?: string;
}

export const HERO_ORDER: SceneId[] = ['detect', 'decide', 'respond'];

export const HERO_SCENES: Record<SceneId, HeroScene> = {
  detect: {
    id: 'detect',
    name: 'DETECT',
    eyebrow: 'STAGE 01',
    accent: 0x4cc9f0,
    tint: 'rgba(23,105,255,.55)',
    orb: 'radar',
    lede: [
      'Rain gauges, satellite passes and road graphs merge into one live picture of Bengaluru.',
      'Crisiscope X flags the next flooded underpass before it cuts off a hospital.',
    ],
  },
  decide: {
    id: 'decide',
    name: 'DECIDE',
    eyebrow: 'STAGE 02',
    accent: 0x2ee6c5,
    tint: 'rgba(18,165,160,.50)',
    orb: 'graph',
    lede: [
      'Compare a baseline against reroutes, dewatering and facility shifts in a counterfactual lab.',
      'Every recommendation arrives with reasons, trade-offs and honest uncertainty.',
    ],
  },
  respond: {
    id: 'respond',
    name: 'RESPOND',
    eyebrow: 'STAGE 03',
    accent: 0xffb454,
    tint: 'rgba(245,158,11,.42)',
    orb: 'pulse',
    lede: [
      'Turn the best option into an explainable dispatch the control room can act on in minutes.',
      'Prototype only: scenarios are synthetic. In a real emergency, call 112 or 108.',
    ],
  },
};
