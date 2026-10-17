import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe2,
  Building2,
  ArrowRight,
  ShieldCheck,
  Compass,
  Radio,
  Sparkles,
  Layers,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { HeroRainCanvas } from './HeroRainCanvas';
import { HERO_ORDER, HERO_SCENES, type SceneId } from '../../config/hero';
import { useAppStore } from '../../store/useAppStore';
import './hero.css';

const CityTwin3D = lazy(() => import('./CityTwin3D'));
const EarthIntro = lazy(() => import('./EarthIntro'));
const EarthGlobe3D = lazy(() => import('./EarthGlobe3D'));

/** The Earth dive plays once per page load (not again when returning from the console). */
let introPlayed = false;

const CLIP_IDS = HERO_ORDER.filter((id) => HERO_SCENES[id].clip);
const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

/** CSS/SVG artwork for a side slot. A scene may supply a photographic `cutout` instead. */
const SlotArt: React.FC<{ id: SceneId; shown: boolean }> = ({ id, shown }) => {
  const scene = HERO_SCENES[id];
  const cls = shown ? 'is-shown' : '';
  if (scene.cutout) {
    return <img data-planet={id} alt="" src={scene.cutout} className={cls} />;
  }
  if (scene.orb === 'radar') {
    return (
      <span className={`orb orb--radar ${cls}`} data-planet={id} aria-hidden="true">
        <i />
      </span>
    );
  }
  if (scene.orb === 'graph') {
    return (
      <span className={`orb orb--graph ${cls}`} data-planet={id} aria-hidden="true">
        <svg viewBox="0 0 100 100" fill="none">
          <g stroke="rgba(200,255,246,.34)" strokeWidth=".7" strokeLinecap="round">
            <path d="M10 30 L30 44 L52 36 L74 50 L92 40" />
            <path d="M30 44 L36 70 L58 78 L74 50" />
            <path d="M52 36 L58 78" />
            <path d="M14 70 L36 70" />
            <path d="M74 50 L88 74" />
          </g>
          <path className="route" d="M14 70 L36 70 L58 78 L74 50 L92 40" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <g fill="#eafffb">
            {[[10, 30], [30, 44], [52, 36], [74, 50], [92, 40], [36, 70], [58, 78], [88, 74]].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="1.7" />
            ))}
          </g>
          <circle cx="14" cy="70" r="3" fill="#fff" />
        </svg>
      </span>
    );
  }
  return (
    <span className={`orb orb--pulse ${cls}`} data-planet={id} aria-hidden="true">
      <i />
      <i />
    </span>
  );
};

export const CinematicHero: React.FC = () => {
  const { theme, toggleTheme } = useAppStore();
  const rootRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const videoRefs = useRef<Partial<Record<SceneId, HTMLVideoElement | null>>>({});

  // Hero background view mode: 'twin' = 3D Bengaluru City Twin, 'earth' = 3D Rotating Earth Globe
  const [heroView, setHeroView] = useState<'twin' | 'earth'>('twin');

  const reduced = useMemo(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    []
  );

  /* ---------------- opening shot: Earth -> dive -> flood city ---------------- */
  const [hadIntro] = useState(() => !reduced && !introPlayed);
  const [intro, setIntro] = useState<'run' | 'leave' | 'off'>(hadIntro ? 'run' : 'off');
  const [reveal, setReveal] = useState<boolean | undefined>(hadIntro ? false : undefined);

  const finishIntro = useCallback(() => {
    introPlayed = true;
    setReveal(true);
    setIntro((s) => (s === 'run' ? 'leave' : s));
  }, []);

  const startReveal = useCallback(() => setReveal(true), []);

  useEffect(() => {
    if (intro !== 'leave') return;
    const id = window.setTimeout(() => setIntro('off'), 800);
    return () => clearTimeout(id);
  }, [intro]);

  useEffect(() => {
    if (intro !== 'run') return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') finishIntro(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [intro, finishIntro]);

  const introReady = intro !== 'run';

  /* ---------------- entrance: anim -> play -> done ---------------- */
  const [phase, setPhase] = useState<'anim' | 'play' | 'done'>(reduced ? 'done' : 'anim');
  useEffect(() => {
    if (reduced || !introReady) return;
    let raf1 = 0, raf2 = 0, guard = 0, finish = 0, started = false, cancelled = false;
    const start = () => {
      if (started || cancelled) return;
      started = true;
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          if (cancelled) return;
          setPhase('play');
          finish = window.setTimeout(() => setPhase('done'), 2150);
        });
      });
    };
    const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts;
    if (fonts?.ready) {
      fonts.ready.then(start);
      guard = window.setTimeout(start, 500);
    } else {
      start();
    }
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(guard);
      clearTimeout(finish);
    };
  }, [reduced, introReady]);

  /* ---------------- featured stage + flanking slots ---------------- */
  const [active, setActive] = useState<SceneId>('detect');
  const [swaps, setSwaps] = useState(0);
  const scene = HERO_SCENES[active];
  const [leftId, rightId] = HERO_ORDER.filter((id) => id !== active) as [SceneId, SceneId];

  const show = useCallback(
    (next: SceneId) => {
      if (!HERO_SCENES[next] || next === active) return;
      setActive(next);
      setSwaps((n) => n + 1);
    },
    [active]
  );

  /* Optional backdrop clips */
  const clipIds = CLIP_IDS;
  const warm = useCallback((id: SceneId) => {
    const v = videoRefs.current[id];
    if (v && !v.getAttribute('src') && v.dataset.src) {
      v.preload = 'auto';
      v.src = v.dataset.src;
      v.load();
    }
  }, []);

  useEffect(() => {
    clipIds.forEach((id) => {
      const v = videoRefs.current[id];
      if (!v) return;
      if (id === active) {
        warm(id);
        v.play()?.catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [active, clipIds, warm]);

  const [webgl, setWebgl] = useState(true);
  const onTwinFail = useCallback(() => setWebgl(false), []);

  /* ---------------- burger menu ---------------- */
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (navRef.current?.contains(t) || burgerRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        burgerRef.current?.focus();
      }
    };
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (reduced) return;
    const el = document.documentElement;
    const prev = el.style.scrollBehavior;
    el.style.scrollBehavior = 'smooth';
    return () => { el.style.scrollBehavior = prev; };
  }, [reduced]);

  const scrollNext = () => {
    const next = rootRef.current?.nextElementSibling as HTMLElement | null;
    next?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  const rootCls = `sx${hadIntro ? ' sx--intro' : ''}${phase === 'anim' ? ' anim' : phase === 'play' ? ' anim play' : ''}`;
  const swapCls = swaps > 0 ? ' sx-swap' : '';

  const renderSlot = (slot: 'l' | 'r', id: SceneId) => (
    <button
      type="button"
      key={slot}
      className={`planet planet-${slot}`}
      data-slot={slot}
      data-planet={id}
      aria-label={`Show ${titleCase(HERO_SCENES[id].name)} stage`}
      onClick={() => show(id)}
      onPointerEnter={() => warm(id)}
      onFocus={() => warm(id)}
    >
      {HERO_ORDER.map((k) => (
        <SlotArt key={k} id={k} shown={k === id} />
      ))}
    </button>
  );

  return (
    <section ref={rootRef} className={rootCls} aria-label="Crisiscope X hero">
      <div className="sky">
        <div className="base" />
        {HERO_ORDER.map((id) => (
          <div
            key={id}
            className={`tint${id === active ? ' is-active' : ''}`}
            style={{ ['--tint' as string]: HERO_SCENES[id].tint }}
          />
        ))}

        {webgl ? (
          heroView === 'twin' ? (
            <Suspense fallback={<HeroRainCanvas />}>
              <CityTwin3D theme={theme} accent={scene.accent} reveal={reveal} onFail={onTwinFail} />
            </Suspense>
          ) : (
            <Suspense fallback={<HeroRainCanvas />}>
              <EarthGlobe3D onFail={onTwinFail} interactive={true} />
            </Suspense>
          )
        ) : (
          <HeroRainCanvas />
        )}

        {clipIds.map((id) => (
          <video
            key={id}
            ref={(el) => { videoRefs.current[id] = el; }}
            data-planet={id}
            data-src={HERO_SCENES[id].clip}
            poster={HERO_SCENES[id].still}
            className={id === active ? 'is-active' : undefined}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
          />
        ))}
        <div className="scrim" />
      </div>

      <div className="ui">
        {/* Top Mission Control Navbar */}
        <header className="navbar">
          <div className="navrow" data-open={open ? 'true' : 'false'}>
            <div className="flex items-center gap-3">
              <a className="logo flex items-center gap-2" href="#">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-cyan-500/20">
                  CX
                </span>
                <span>crisiscope<i>x</i></span>
              </a>
              <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>BENGALURU FLOOD INTELLIGENCE</span>
              </span>
            </div>

            <nav
              className="links"
              id="site-nav"
              ref={navRef}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('a')) setOpen(false);
              }}
            >
              <a href="#" aria-current="page">Overview</a>
              <a href="#bengaluru">Context</a>
              <a href="#cascade">CascadeVision</a>
              <a href="#lab">Response Lab</a>
              <a href="#data">Data Sources</a>
              <button
                type="button"
                onClick={toggleTheme}
                className="p-1.5 rounded-lg border border-white/20 text-white/90 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center my-auto"
                title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-cyan-200" />}
              </button>
              <Link className="enroll" to="/console">Console</Link>
            </nav>

            <button
              ref={burgerRef}
              className="burger"
              type="button"
              aria-label={open ? 'Close navigation' : 'Open navigation'}
              aria-expanded={open}
              aria-controls="site-nav"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((o) => !o);
              }}
            >
              <span /><span /><span />
            </button>
          </div>
        </header>

        {/* View Mode Switcher Pill (Bengaluru Twin vs Orbital 3D Earth) */}
        <div className="absolute top-[88px] left-0 right-0 z-20 flex justify-center pointer-events-auto px-4">
          <div className="inline-flex items-center p-1 rounded-full bg-navy-950/80 border border-cyan-500/25 backdrop-blur-md shadow-2xl">
            <button
              type="button"
              onClick={() => setHeroView('twin')}
              className={`flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide transition-all ${
                heroView === 'twin'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Bengaluru Flood Twin</span>
            </button>

            <button
              type="button"
              onClick={() => setHeroView('earth')}
              className={`flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide transition-all ${
                heroView === 'earth'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>3D Earth Orbit</span>
            </button>
          </div>
        </div>

        {/* Hero Copy & Call To Action */}
        <div className="copy">
          <div className="col eyebrow">
            <span className="ent-mask">
              <span key={active} className={`ent-line${swapCls} flex items-center justify-center gap-2 text-xs font-mono tracking-widest text-cyan-400 uppercase`}>
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>CRISISCOPE X &middot; {scene.eyebrow} &middot; BENGALURU, KARNATAKA</span>
              </span>
            </span>
          </div>

          <h1 className="col title font-black" aria-live="polite">
            <span className="ent-mask">
              <span className={`ent-line${swapCls}`}>See the Flood Before It Happens.</span>
            </span>
          </h1>

          <div className="col rule"><span /></div>

          <p key={active} className={`col lede${swapCls} max-w-2xl mx-auto`}>
            Turn rainfall signals, urban infrastructure, and predictive intelligence into actionable flood-risk insights for Bengaluru.
          </p>

          <div className="col cta">
            {renderSlot('l', leftId)}
            {renderSlot('r', rightId)}

            {/* Primary & Secondary Action Group */}
            <div className="flex items-center justify-center gap-3 pointer-events-auto flex-wrap">
              <Link
                to="/console"
                className="hero-primary-cta"
              >
                <span>Explore Live Intelligence</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                to="/console/cascade"
                className="hero-secondary-cta"
              >
                <span>Experience CascadeVision</span>
              </Link>
            </div>

            <span className="label label-l">{HERO_SCENES[leftId].name}</span>
            <span className="label label-r">{HERO_SCENES[rightId].name}</span>
          </div>
        </div>
      </div>

      {/* Earth Intro Sequence Overlay */}
      {intro !== 'off' && (
        <div className={`earth-intro${intro === 'leave' ? ' is-leaving' : ''}`}>
          <Suspense fallback={null}>
            <EarthIntro onReveal={startReveal} onEnd={finishIntro} onFail={finishIntro} />
          </Suspense>
          <p className="intro-cap c1 font-mono text-cyan-300">PLANET EARTH &middot; DEEP SPACE ORBIT</p>
          <p className="intro-cap c2 font-mono text-white">BENGALURU &middot; 12.9716&deg;N 77.5946&deg;E</p>
          <button type="button" className="intro-skip" onClick={finishIntro}>SKIP INTRO (ESC)</button>
        </div>
      )}

      {/* Scroll Down Cue */}
      <button className="scroll" type="button" aria-label="Scroll to next section" onClick={scrollNext}>
        <svg viewBox="0 0 26 33" fill="none" aria-hidden="true">
          <path
            d="M13 1.5 V31.5 M1.9 20.4 L13 31.5 L24.1 20.4"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </svg>
      </button>
    </section>
  );
};

export default CinematicHero;
