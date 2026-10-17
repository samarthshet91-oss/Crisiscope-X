import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EARTH_MASK_URI } from './earthMask';

/**
 * Opening shot: planet Earth in deep space -> rotating globe with satellites & night city lights
 * -> globe turns smoothly toward southern India -> locks onto Bengaluru (12.97°N, 77.59°E)
 * -> camera dives through cloud layers & atmospheric rain -> seamless reveal into Bengaluru 3D City Twin.
 * Fully self-contained procedural rendering (embedded equirectangular land mask, no network dependency).
 */

export const INTRO_DURATION = 5.2;   // seconds total shot
const T_REVEAL = 4.7;                // city dolly starts
const T_END = 5.0;                   // overlay fades out

const BLR = { lat: 12.97, lon: 77.59 };
const AIM = { lat: 13.5, lon: 77.9 }; // where the dive lands (inland of the marker)

const NOISE = /* glsl */ `
float hash(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x){
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i + vec3(0.,0.,0.)), hash(i + vec3(1.,0.,0.)), f.x),
                 mix(hash(i + vec3(0.,1.,0.)), hash(i + vec3(1.,1.,0.)), f.x), f.y),
             mix(mix(hash(i + vec3(0.,0.,1.)), hash(i + vec3(1.,0.,1.)), f.x),
                 mix(hash(i + vec3(0.,1.,1.)), hash(i + vec3(1.,1.,1.)), f.x), f.y), f.z);
}
float fbm(vec3 p){ float a = .5, s = 0.; for (int i = 0; i < 5; i++){ s += a * noise(p); p *= 2.04; a *= .5; } return s; }
`;

const SURFACE_VERT = /* glsl */ `
varying vec3 vPos; varying vec3 vNW; varying vec3 vWP;
void main(){
  vPos = position;
  vNW = normalize(mat3(modelMatrix) * position);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWP = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const EARTH_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uMask;
uniform vec3 uSun;
uniform float uTime;
varying vec3 vPos; varying vec3 vNW; varying vec3 vWP;
${NOISE}

void main(){
  vec3 p = normalize(vPos);
  float lon = atan(p.x, p.z);
  float lat = asin(clamp(p.y, -1., 1.));
  vec2 uv = vec2(lon / 6.2831853 + .5, lat / 3.1415926 + .5);

  float m = texture2D(uMask, uv).r;
  float n1 = fbm(p * 20.0);
  float n2 = fbm(p * 68.0);
  float n3 = fbm(p * 140.0);

  // Fractal coastline detail
  float mm = m + (n1 - .5) * .22 + (n2 - .5) * .08 + (n3 - .5) * .025;
  float land = smoothstep(.47, .52, mm);
  float shallow = smoothstep(.14, .47, mm) * (1. - land);
  float absLat = abs(lat);

  // Ocean color gradient: deep ocean trench -> continental shelf turquoise
  vec3 deepOcean = vec3(.012, .065, .18);
  vec3 coastShelf = vec3(.06, .35, .55);
  vec3 ocean = mix(deepOcean, coastShelf, shallow);

  // Land color gradient: lush vegetation -> arid desert -> mountains -> snow caps
  float desert = smoothstep(.20, .38, absLat) * (1. - smoothstep(.48, .62, absLat)) * smoothstep(.35, .65, fbm(p * 6. + 4.));
  vec3 vegetation = mix(vec3(.06, .24, .08), vec3(.18, .40, .14), n1);
  vec3 desertColor = vec3(.74, .58, .36);
  vec3 lc = mix(vegetation, desertColor, desert);

  // Mountain ridges
  float mountains = smoothstep(.55, .85, fbm(p * 14.0)) * land;
  lc = mix(lc, vec3(.42, .38, .32), mountains * .65);

  // Polar snow caps
  float snow = smoothstep(1.05, 1.25, absLat + (n1 - .5) * .20);
  lc = mix(lc, vec3(.94, .97, 1.), snow);
  ocean = mix(ocean, vec3(.78, .89, .98), snow * .88);

  vec3 surface = mix(ocean, lc, land);

  // Shading: Sun direction & camera view
  vec3 N = normalize(vNW);
  vec3 L = normalize(uSun);
  vec3 V = normalize(cameraPosition - vWP);
  float d = dot(N, L);
  float dayLit = smoothstep(-.18, .32, d);
  float nightLit = smoothstep(.10, -.28, d);

  // Day lighting + ambient space light
  vec3 col = surface * (.04 + dayLit * 1.15);

  // Ocean specular reflection (sun glint)
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.), 110.) * (1. - land) * dayLit * 1.35;
  col += vec3(1., .96, .86) * spec;

  // Night-side city lights (amber/golden clusters on populated landmasses)
  float cityCluster = smoothstep(.48, .76, fbm(p * 45.0 + vec3(1.2, 5.4, 3.1)))
                    * smoothstep(.30, .72, fbm(p * 16.0 + vec3(4.3, 2.1, 7.8)));
  float habitability = smoothstep(1.30, .95, absLat) * smoothstep(.04, .25, absLat + .3);
  vec3 cityLightGold = vec3(1.0, .80, .38) * 3.4;
  vec3 cityLights = cityLightGold * cityCluster * land * nightLit * habitability;
  col += cityLights;

  // Atmospheric Fresnel edge scattering (Rayleigh blue rim)
  float fr = pow(1. - max(dot(N, V), 0.), 3.3);
  vec3 atmoBlue = vec3(.18, .58, 1.);
  col += atmoBlue * fr * (.25 + dayLit * .85);

  gl_FragColor = vec4(col, 1.);
}
`;

const CLOUD_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uSun;
uniform float uTime;
varying vec3 vPos; varying vec3 vNW; varying vec3 vWP;
${NOISE}

void main(){
  vec3 p = normalize(vPos);
  // Multi-octave swirling procedural clouds
  float c1 = fbm(p * 3.6 + vec3(uTime * .022, 0., uTime * .014));
  float c2 = fbm(p * 10.5 + vec3(0., uTime * .018, 0.));
  float c3 = fbm(p * 24.0 + vec3(uTime * .01, 0., uTime * .01));
  float cloudDensity = c1 * .75 + c2 * .32 + c3 * .10;
  float alpha = smoothstep(.48, .82, cloudDensity);

  // Directional illumination on clouds
  float d = dot(normalize(vNW), normalize(uSun));
  float lit = smoothstep(-.22, .40, d);
  vec3 cloudColor = vec3(1.0, 1.0, 1.0) * (.06 + lit * 1.05);

  gl_FragColor = vec4(cloudColor, alpha * .92);
}
`;

const ATMO_VERT = /* glsl */ `
varying vec3 vN;
void main(){
  vN = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const ATMO_FRAG = /* glsl */ `
varying vec3 vN;
void main(){
  float f = clamp(-dot(normalize(vN), vec3(0., 0., 1.)), 0., 1.);
  float i = clamp(pow(f * 2.4, 2.2), 0., 1.4);
  vec3 glowColor = vec3(.14, .62, 1.0);
  gl_FragColor = vec4(glowColor * i, i * .95);
}
`;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const smooth = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const rad = (d: number) => (d * Math.PI) / 180;

interface Props {
  onReveal: () => void;
  onEnd: () => void;
  onFail: () => void;
}

interface SatelliteData {
  id: string;
  name: string;
  type: string;
  alt: string;
  inc: number;
  speed: number;
  radius: number;
  phase: number;
  color: number;
}

const SATELLITE_CONFIGS: SatelliteData[] = [
  {
    id: 'insat-3dr',
    name: 'INSAT-3DR',
    type: 'MET / CLOUD TELEMETRY',
    alt: 'GEO 35,786 KM',
    inc: 14.5,
    speed: 0.35,
    radius: 1.48,
    phase: 0.8,
    color: 0x00f0ff,
  },
  {
    id: 'sentinel-1c',
    name: 'SENTINEL-1C',
    type: 'C-SAR FLOOD INUNDATION',
    alt: 'LEO 693 KM',
    inc: 98.2,
    speed: 0.65,
    radius: 1.34,
    phase: 2.4,
    color: 0x38bdf8,
  },
  {
    id: 'gpm-core',
    name: 'GPM CORE',
    type: 'PRECIPITATION RADAR (DPR)',
    alt: 'LEO 407 KM',
    inc: 65.0,
    speed: 0.85,
    radius: 1.22,
    phase: 4.2,
    color: 0x2ee6c5,
  },
];

export const EarthIntro: React.FC<Props> = ({ onReveal, onEnd, onFail }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const washRef = useRef<HTMLDivElement>(null);
  const cbs = useRef({ onReveal, onEnd, onFail });
  cbs.current = { onReveal, onEnd, onFail };

  const [activeSat, setActiveSat] = useState<SatelliteData>(SATELLITE_CONFIGS[0]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      cbs.current.onFail();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x02060d, 1);
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 200);
    const sun = new THREE.Vector3(-0.62, 0.38, 0.72).normalize();

    // --- Starfield (multi-layered realistic stars)
    const STARS = 2400;
    const sp = new Float32Array(STARS * 3);
    const sc = new Float32Array(STARS * 3);
    for (let i = 0; i < STARS; i++) {
      const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = Math.sqrt(1 - u * u);
      const dist = 75 + Math.random() * 45;
      sp[i * 3] = r * Math.cos(th) * dist;
      sp[i * 3 + 1] = u * dist;
      sp[i * 3 + 2] = r * Math.sin(th) * dist;

      // Subtle star color temperature (cool cyan-white to faint warm gold)
      const starTemp = Math.random();
      if (starTemp > 0.8) {
        sc[i * 3] = 0.75; sc[i * 3 + 1] = 0.88; sc[i * 3 + 2] = 1.0;
      } else if (starTemp > 0.4) {
        sc[i * 3] = 0.95; sc[i * 3 + 1] = 0.95; sc[i * 3 + 2] = 1.0;
      } else {
        sc[i * 3] = 1.0; sc[i * 3 + 1] = 0.90; sc[i * 3 + 2] = 0.75;
      }
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(sc, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.32,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // --- Earth Globe Group
    const globe = new THREE.Group();
    scene.add(globe);

    const maskTex = new THREE.Texture();
    maskTex.generateMipmaps = false;
    maskTex.minFilter = THREE.LinearFilter;
    maskTex.magFilter = THREE.LinearFilter;
    maskTex.wrapS = THREE.RepeatWrapping;

    const sunU = { value: sun };
    const timeU = { value: 0 };
    const earthMat = new THREE.ShaderMaterial({
      uniforms: { uMask: { value: maskTex }, uSun: sunU, uTime: timeU },
      vertexShader: SURFACE_VERT,
      fragmentShader: EARTH_FRAG,
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), earthMat);
    globe.add(earth);

    // Independent Clouds
    const cloudMat = new THREE.ShaderMaterial({
      uniforms: { uSun: sunU, uTime: timeU },
      vertexShader: SURFACE_VERT,
      fragmentShader: CLOUD_FRAG,
      transparent: true,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(new THREE.SphereGeometry(1.016, 96, 64), cloudMat);
    globe.add(clouds);

    // Atmospheric outer glow
    const atmoMat = new THREE.ShaderMaterial({
      vertexShader: ATMO_VERT,
      fragmentShader: ATMO_FRAG,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.095, 64, 48), atmoMat);
    scene.add(atmo);

    // --- Satellites & Orbital Lines
    const satelliteGroup = new THREE.Group();
    scene.add(satelliteGroup);

    interface SatRuntime {
      data: SatelliteData;
      mesh: THREE.Group;
      orbitLine: THREE.Line;
    }
    const satRuntimes: SatRuntime[] = [];

    SATELLITE_CONFIGS.forEach((cfg) => {
      // Orbital Ring
      const orbitPts: THREE.Vector3[] = [];
      const segments = 120;
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        orbitPts.push(new THREE.Vector3(Math.cos(theta) * cfg.radius, 0, Math.sin(theta) * cfg.radius));
      }
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
      const orbitMat = new THREE.LineBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
      });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      orbitLine.rotation.x = rad(cfg.inc);
      orbitLine.rotation.y = rad(cfg.phase * 20);
      satelliteGroup.add(orbitLine);

      // Satellite Object: Body + Solar Panels + Beacon Dot
      const sat = new THREE.Group();
      const bodyMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
      const panelMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
      const glowMat = new THREE.MeshBasicMaterial({ color: cfg.color, transparent: true, opacity: 0.9 });

      const body = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.016, 0.016), bodyMat);
      const leftPanel = new THREE.Mesh(new THREE.PlaneGeometry(0.045, 0.018), panelMat);
      leftPanel.position.x = -0.038;
      const rightPanel = new THREE.Mesh(new THREE.PlaneGeometry(0.045, 0.018), panelMat);
      rightPanel.position.x = 0.038;
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 12), glowMat);

      sat.add(body, leftPanel, rightPanel, beacon);
      satelliteGroup.add(sat);

      satRuntimes.push({ data: cfg, mesh: sat, orbitLine });
    });

    // --- Bengaluru Telemetry Target Marker (attached to globe)
    const phi = rad(BLR.lat), lam = rad(BLR.lon);
    const blrDir = new THREE.Vector3(Math.cos(phi) * Math.sin(lam), Math.sin(phi), Math.cos(phi) * Math.cos(lam));
    const marker = new THREE.Group();
    marker.position.copy(blrDir).multiplyScalar(1.006);
    marker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), blrDir);

    const dotMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, depthWrite: false });
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const reticleMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, depthWrite: false, wireframe: true });

    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.012, 24), dotMat);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.025, 0.032, 48), ringMat);
    const reticle = new THREE.Mesh(new THREE.RingGeometry(0.045, 0.052, 4), reticleMat);
    marker.add(dot, ring, reticle);
    globe.add(marker);

    // --- Sizing & Responsive setup
    let dStart = 3.8;
    const resize = () => {
      const w = mount.clientWidth || 1, h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const tanHalf = Math.tan(rad(35) / 2);
      dStart = Math.max(3.8, 1.25 / (tanHalf * camera.aspect));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // --- Animation Timeline
    const lon0 = rad(-40);
    let t0 = -1, raf = 0, revealed = false, ended = false, disposed = false;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (t0 < 0) t0 = now;
      const t = Math.min(INTRO_DURATION, (now - t0) / 1000);
      const p = t / INTRO_DURATION;

      // Accelerated cinematic camera dive toward southern India
      const f = Math.pow(p, 2.15);
      const d = Math.exp(lerp(Math.log(dStart), Math.log(1.008), f));
      camera.position.set(0, 0, d);
      camera.lookAt(0, 0, 0);
      camera.fov = 35 + 28 * Math.pow(f, 3.2);
      camera.updateProjectionMatrix();

      // Globe turns until Bengaluru faces the camera directly
      const g = easeOutCubic(seg(p, 0, 0.74));
      globe.rotation.set(rad(AIM.lat) * g, -lerp(lon0, rad(AIM.lon), g), 0, 'XYZ');

      // Continuous independent movement
      timeU.value = t;
      clouds.rotation.y = t * 0.026;

      // Animate satellites along their orbital tracks
      satRuntimes.forEach(({ data, mesh, orbitLine }) => {
        const theta = t * data.speed + data.phase;
        const pos = new THREE.Vector3(Math.cos(theta) * data.radius, 0, Math.sin(theta) * data.radius);
        pos.applyEuler(orbitLine.rotation);
        mesh.position.copy(pos);
        mesh.lookAt(0, 0, 0);

        // Fade out satellites as camera dives close
        const satFade = 1 - smooth(seg(d, 1.05, 1.45));
        mesh.visible = satFade > 0.02;
        orbitLine.visible = satFade > 0.02;
      });

      // Marker pulse animation
      const pulse = (t * 1.1) % 1;
      const near = 1 - smooth(seg(d, 1.02, 1.35));
      const mk = 1 - near;
      dotMat.opacity = mk * seg(t, 1.3, 2.3);
      ringMat.opacity = mk * seg(t, 1.3, 2.3) * (1 - pulse) * 0.9;
      reticleMat.opacity = mk * seg(t, 1.6, 2.5) * 0.7;
      ring.scale.setScalar(1 + pulse * 2.2);
      reticle.rotation.z = t * 0.5;

      // Cinematic atmosphere wash into the Bengaluru 3D City Twin
      if (washRef.current) {
        washRef.current.style.opacity = String(smooth(seg(t, 4.3, 4.95)));
      }

      renderer.render(scene, camera);

      if (!revealed && t >= T_REVEAL) {
        revealed = true;
        cbs.current.onReveal();
      }
      if (!ended && t >= T_END) {
        ended = true;
        cbs.current.onEnd();
      }
    };

    // Start rendering once continent mask decodes
    const img = new Image();
    const begin = () => { if (!disposed && !raf) raf = requestAnimationFrame(frame); };
    img.onload = () => { maskTex.image = img; maskTex.needsUpdate = true; begin(); };
    img.onerror = begin;
    img.src = EARTH_MASK_URI;

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      [starGeo, earth.geometry, clouds.geometry, atmo.geometry, dot.geometry, ring.geometry, reticle.geometry].forEach((x) => x.dispose());
      satRuntimes.forEach((s) => {
        s.orbitLine.geometry.dispose();
        (s.orbitLine.material as THREE.Material).dispose();
      });
      [starMat, earthMat, cloudMat, atmoMat, dotMat, ringMat, reticleMat, maskTex].forEach((x) => x.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <>
      <div ref={mountRef} className="earth-canvas" aria-hidden="true" />
      <div ref={washRef} className="earth-wash" aria-hidden="true" />

      {/* Futuristic Telemetry HUD Overlays */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-2 pointer-events-none text-xs font-mono">
        <div className="flex items-center gap-2 bg-navy-950/80 border border-cyan-500/30 px-3 py-1.5 rounded-full backdrop-blur text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold tracking-wider">EARTH OBSERVATION ORBIT</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300">LEO/GEO CONSTELLATION</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-400 px-3">
          <span>ALT: 705 KM</span>
          <span>INC: 98.2°</span>
          <span>TARGET: 12.9716° N, 77.5946° E</span>
        </div>
      </div>

      {/* Orbiting Satellite Telemetry Pill */}
      <div className="absolute top-6 right-6 z-10 hidden md:flex flex-col items-end gap-1.5 pointer-events-none font-mono text-[11px]">
        <div className="flex items-center gap-2 bg-navy-900/80 border border-cyan-500/30 px-3 py-1.5 rounded-lg backdrop-blur text-slate-300">
          <span className="text-cyan-400 font-bold">INSAT-3DR</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400">TRACKING CONVECTIVE MONSOON</span>
        </div>
        <div className="text-[10px] text-slate-400">
          SYNTHETIC ORBITAL MODEL · BENGALURU FLOOD RISK LAB
        </div>
      </div>
    </>
  );
};

export default EarthIntro;
