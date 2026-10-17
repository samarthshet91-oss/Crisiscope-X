import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EARTH_MASK_URI } from './earthMask';

interface Props {
  onFail?: () => void;
  interactive?: boolean;
}

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

  float mm = m + (n1 - .5) * .22 + (n2 - .5) * .08 + (n3 - .5) * .025;
  float land = smoothstep(.47, .52, mm);
  float shallow = smoothstep(.14, .47, mm) * (1. - land);
  float absLat = abs(lat);

  // Deep ocean abyss to turquoise shelf
  vec3 deepOcean = vec3(.012, .065, .18);
  vec3 coastShelf = vec3(.06, .35, .55);
  vec3 ocean = mix(deepOcean, coastShelf, shallow);

  // Arid & lush terrain
  float desert = smoothstep(.20, .38, absLat) * (1. - smoothstep(.48, .62, absLat)) * smoothstep(.35, .65, fbm(p * 6. + 4.));
  vec3 vegetation = mix(vec3(.06, .24, .08), vec3(.18, .40, .14), n1);
  vec3 desertColor = vec3(.74, .58, .36);
  vec3 lc = mix(vegetation, desertColor, desert);

  // Mountain shading
  float mountains = smoothstep(.55, .85, fbm(p * 14.0)) * land;
  lc = mix(lc, vec3(.42, .38, .32), mountains * .65);

  // Polar snow caps
  float snow = smoothstep(1.05, 1.25, absLat + (n1 - .5) * .20);
  lc = mix(lc, vec3(.94, .97, 1.), snow);
  ocean = mix(ocean, vec3(.78, .89, .98), snow * .88);

  vec3 surface = mix(ocean, lc, land);

  vec3 N = normalize(vNW);
  vec3 L = normalize(uSun);
  vec3 V = normalize(cameraPosition - vWP);
  float d = dot(N, L);
  float dayLit = smoothstep(-.18, .32, d);
  float nightLit = smoothstep(.10, -.28, d);

  vec3 col = surface * (.04 + dayLit * 1.15);

  // Specular sun glint on oceans
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.), 110.) * (1. - land) * dayLit * 1.35;
  col += vec3(1., .96, .86) * spec;

  // Night city lights (golden glow on dark side)
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
  float c1 = fbm(p * 3.6 + vec3(uTime * .018, 0., uTime * .012));
  float c2 = fbm(p * 10.5 + vec3(0., uTime * .014, 0.));
  float c3 = fbm(p * 24.0 + vec3(uTime * .008, 0., uTime * .008));
  float cloudDensity = c1 * .75 + c2 * .32 + c3 * .10;
  float alpha = smoothstep(.48, .82, cloudDensity);

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

const rad = (d: number) => (d * Math.PI) / 180;
const BLR = { lat: 12.97, lon: 77.59 };

export const EarthGlobe3D: React.FC<Props> = ({ onFail, interactive = true }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [telemetry, setTelemetry] = useState({
    sat: 'INSAT-3DR',
    alt: '35,786 km (GEO)',
    sensor: 'Imager & Sounder',
    blrStatus: 'Convective Storm Monitoring Active',
  });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      onFail?.();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0.4, 2.9);

    const sun = new THREE.Vector3(-0.6, 0.4, 0.7).normalize();
    const sunU = { value: sun };
    const timeU = { value: 0 };

    // --- Starfield
    const STARS = 1500;
    const sp = new Float32Array(STARS * 3);
    for (let i = 0; i < STARS; i++) {
      const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = Math.sqrt(1 - u * u);
      const dist = 50 + Math.random() * 30;
      sp[i * 3] = r * Math.cos(th) * dist;
      sp[i * 3 + 1] = u * dist;
      sp[i * 3 + 2] = r * Math.sin(th) * dist;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xcfe2ff,
      size: 0.24,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // --- Earth Globe
    const globe = new THREE.Group();
    // Default tilt towards India
    globe.rotation.x = rad(18);
    globe.rotation.y = rad(-70);
    scene.add(globe);

    const maskTex = new THREE.Texture();
    maskTex.generateMipmaps = false;
    maskTex.minFilter = THREE.LinearFilter;
    maskTex.magFilter = THREE.LinearFilter;
    maskTex.wrapS = THREE.RepeatWrapping;

    const earthMat = new THREE.ShaderMaterial({
      uniforms: { uMask: { value: maskTex }, uSun: sunU, uTime: timeU },
      vertexShader: SURFACE_VERT,
      fragmentShader: EARTH_FRAG,
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), earthMat);
    globe.add(earth);

    // Independent Cloud Layer
    const cloudMat = new THREE.ShaderMaterial({
      uniforms: { uSun: sunU, uTime: timeU },
      vertexShader: SURFACE_VERT,
      fragmentShader: CLOUD_FRAG,
      transparent: true,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(new THREE.SphereGeometry(1.016, 96, 64), cloudMat);
    globe.add(clouds);

    // Atmosphere Glow
    const atmoMat = new THREE.ShaderMaterial({
      vertexShader: ATMO_VERT,
      fragmentShader: ATMO_FRAG,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.085, 64, 48), atmoMat);
    scene.add(atmo);

    // --- Bengaluru Marker
    const phi = rad(BLR.lat), lam = rad(BLR.lon);
    const blrDir = new THREE.Vector3(Math.cos(phi) * Math.sin(lam), Math.sin(phi), Math.cos(phi) * Math.cos(lam));
    const marker = new THREE.Group();
    marker.position.copy(blrDir).multiplyScalar(1.006);
    marker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), blrDir);

    const dotMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, depthWrite: false });
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.012, 24), dotMat);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.024, 0.032, 48), ringMat);
    marker.add(dot, ring);
    globe.add(marker);

    // --- Satellites & Orbital paths
    const satGroup = new THREE.Group();
    scene.add(satGroup);

    interface Sat {
      mesh: THREE.Group;
      radius: number;
      speed: number;
      rotX: number;
      rotY: number;
      phase: number;
    }
    const sats: Sat[] = [];
    const configs = [
      { name: 'INSAT-3DR', r: 1.45, speed: 0.25, inc: 15, col: 0x00f0ff, phase: 0 },
      { name: 'SENTINEL-1C', r: 1.32, speed: 0.5, inc: 98, col: 0x38bdf8, phase: 2.1 },
      { name: 'GPM-CORE', r: 1.22, speed: 0.7, inc: 65, col: 0x2ee6c5, phase: 4.5 },
    ];

    configs.forEach((cfg) => {
      const orbitPts: THREE.Vector3[] = [];
      for (let s = 0; s <= 100; s++) {
        const th = (s / 100) * Math.PI * 2;
        orbitPts.push(new THREE.Vector3(Math.cos(th) * cfg.r, 0, Math.sin(th) * cfg.r));
      }
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
      const orbitMat = new THREE.LineBasicMaterial({ color: cfg.col, transparent: true, opacity: 0.25 });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      orbitLine.rotation.x = rad(cfg.inc);
      orbitLine.rotation.y = rad(cfg.phase * 30);
      satGroup.add(orbitLine);

      const satMesh = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.016, 0.016), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      const panels = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.02), new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 8), new THREE.MeshBasicMaterial({ color: cfg.col }));
      satMesh.add(body, panels, beacon);
      satGroup.add(satMesh);

      sats.push({
        mesh: satMesh,
        radius: cfg.r,
        speed: cfg.speed,
        rotX: rad(cfg.inc),
        rotY: rad(cfg.phase * 30),
        phase: cfg.phase,
      });
    });

    // Resize
    const resize = () => {
      const w = mount.clientWidth || 1, h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // Mouse Parallax & Drag interaction
    const mouse = { x: 0, y: 0, sx: 0, sy: 0, isDragging: false, prevX: 0, prevY: 0, rotVelX: 0, rotVelY: 0 };
    const onMouseMove = (e: MouseEvent) => {
      if (mouse.isDragging && interactive) {
        const dx = e.clientX - mouse.prevX;
        const dy = e.clientY - mouse.prevY;
        mouse.rotVelY += dx * 0.005;
        mouse.rotVelX += dy * 0.005;
        mouse.prevX = e.clientX;
        mouse.prevY = e.clientY;
      }
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onMouseDown = (e: MouseEvent) => {
      mouse.isDragging = true;
      mouse.prevX = e.clientX;
      mouse.prevY = e.clientY;
    };
    const onMouseUp = () => {
      mouse.isDragging = false;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    // Visibility
    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0.05 });
    io.observe(mount);

    const clock = new THREE.Clock();
    let raf = 0;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const t = clock.getElapsedTime();
      timeU.value = t;

      // Continuous Earth rotation around axis
      globe.rotation.y += 0.0022 + mouse.rotVelY;
      globe.rotation.x = Math.max(-0.6, Math.min(0.6, globe.rotation.x + mouse.rotVelX));
      mouse.rotVelX *= 0.92;
      mouse.rotVelY *= 0.92;

      // Differential cloud drift
      clouds.rotation.y = t * 0.015;

      // Mouse Parallax
      mouse.sx += (mouse.x - mouse.sx) * 0.04;
      mouse.sy += (mouse.y - mouse.sy) * 0.04;
      camera.position.x = mouse.sx * 0.15;
      camera.position.y = 0.4 - mouse.sy * 0.12;
      camera.lookAt(0, 0, 0);

      // Marker pulse
      const p = (t * 1.2) % 1;
      ring.scale.setScalar(1 + p * 2.2);
      ringMat.opacity = (1 - p) * 0.85;

      // Orbiting Satellites
      sats.forEach((s) => {
        const theta = t * s.speed + s.phase;
        const pos = new THREE.Vector3(Math.cos(theta) * s.radius, 0, Math.sin(theta) * s.radius);
        pos.applyEuler(new THREE.Euler(s.rotX, s.rotY, 0));
        s.mesh.position.copy(pos);
        s.mesh.lookAt(0, 0, 0);
      });

      renderer.render(scene, camera);
    };

    const img = new Image();
    img.onload = () => {
      maskTex.image = img;
      maskTex.needsUpdate = true;
      frame();
    };
    img.onerror = () => frame();
    img.src = EARTH_MASK_URI;

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      mount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      [starGeo, earth.geometry, clouds.geometry, atmo.geometry, dot.geometry, ring.geometry].forEach((g) => g.dispose());
      [starMat, earthMat, cloudMat, atmoMat, dotMat, ringMat, maskTex].forEach((m) => m.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [interactive, onFail]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mountRef}
        className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing"
        style={{
          maskImage: 'radial-gradient(ellipse 90% 85% at 50% 50%, #000 50%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 85% at 50% 50%, #000 50%, transparent 100%)',
        }}
        aria-label="Interactive 3D Earth Orbit Observation"
      />

      {/* Floating Mission Control Telemetry Tags */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none hidden sm:flex flex-col gap-1.5 font-mono text-[11px]">
        <div className="flex items-center gap-2 bg-navy-950/85 border border-cyan-500/30 px-3 py-1.5 rounded-full backdrop-blur-md text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold tracking-wider">EARTH OBSERVATION ORBIT</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">LIVE ROTATION</span>
        </div>
        <div className="flex items-center gap-3 bg-navy-900/70 border border-slate-700/60 px-3 py-1 rounded-md backdrop-blur-sm text-slate-400">
          <span>TARGET: BENGALURU</span>
          <span>12.97° N, 77.59° E</span>
          <span className="text-cyan-400">STATUS: CONVECTIVE MONSOON</span>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-10 pointer-events-none hidden md:flex flex-col items-end gap-1 font-mono text-[10px] text-slate-400">
        <div className="bg-navy-950/80 border border-cyan-500/20 px-2.5 py-1 rounded backdrop-blur">
          INSAT-3DR [GEO] · SENTINEL-1C [LEO-SSO] · GPM CORE [LEO]
        </div>
        <div>DRAG GLOBE TO ROTATE · TIME-BASED CONTINUOUS ORBIT</div>
      </div>
    </div>
  );
};

export default EarthGlobe3D;
