import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Props {
  onFail?: () => void;
  /** 'dark' = cinematic night palette used by the hero; 'light' = original pastel look. */
  theme?: 'light' | 'dark';
  /** Hex colour for building edges / rain. Eases toward new values when it changes. */
  accent?: number;
  /**
   * Intro choreography. undefined = normal orbit. false = hold the camera far above the city.
   * true = descend from the sky into the normal orbit (used after the Earth dive).
   */
  reveal?: boolean;
}

/**
 * Flood digital-twin: a wireframe city grid where a translucent water plane rises and falls.
 * Buildings flip from cyan to red as water reaches them; teal hospital beacons turn red when cut off.
 */
const CityTwin3D: React.FC<Props> = ({ onFail, theme = 'light', accent = 0x1769ff, reveal }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const dark = theme === 'dark';
  const accentRef = useRef(new THREE.Color(accent));
  useEffect(() => { accentRef.current.setHex(accent); }, [accent]);
  const revealRef = useRef<boolean | undefined>(reveal);
  useEffect(() => { revealRef.current = reveal; }, [reveal]);

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
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(dark ? 0x04101f : 0xeaf1fc, dark ? 0.03 : 0.022);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
    const target = new THREE.Vector3(0, -1.5, 0);

    scene.add(new THREE.AmbientLight(0xffffff, dark ? 0.7 : 1.5));
    const key = new THREE.PointLight(0x7aa8ff, 90, 70);
    key.position.set(-8, 14, 6);
    scene.add(key);
    const sun = new THREE.DirectionalLight(0xffffff, dark ? 0.55 : 1.4);
    sun.position.set(10, 20, 8);
    scene.add(sun);

    // --- City ---
    const city = new THREE.Group();
    scene.add(city);
    const N = 11, SP = 2.1;
    const edgeOk = new THREE.LineBasicMaterial({ color: dark ? accent : 0x1769ff, transparent: true, opacity: dark ? 0.75 : 0.6 });
    const edgeBad = new THREE.LineBasicMaterial({ color: 0xe5384d, transparent: true, opacity: 0.9 });
    const fill = new THREE.MeshStandardMaterial({ color: dark ? 0x0a1c3c : 0xf4f8ff, roughness: dark ? 0.55 : 0.35, metalness: 0.1, transparent: true, opacity: dark ? 0.9 : 0.93 });

    interface B { h: number; edges: THREE.LineSegments }
    const buildings: B[] = [];
    const hospitals: { x: number; z: number; mesh: THREE.Mesh; ring: THREE.Mesh }[] = [];
    const hospitalSlots = new Set(['2,3', '8,2', '5,8']);
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (i === 5 || j === 5) continue; // main roads
        const isHosp = hospitalSlots.has(`${i},${j}`);
        const h = isHosp ? 1.2 : 0.6 + Math.pow(rnd(), 2.2) * 4.2;
        const w = 1.1 + rnd() * 0.4;
        const geo = new THREE.BoxGeometry(w, h, w);
        const m = new THREE.Mesh(geo, fill);
        const x = (i - N / 2) * SP, z = (j - N / 2) * SP;
        m.position.set(x, h / 2, z);
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeOk);
        m.add(edges);
        city.add(m);
        buildings.push({ h, edges });
        if (isHosp) {
          const beacon = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 1.6, 12),
            new THREE.MeshBasicMaterial({ color: 0x0e9f9a })
          );
          beacon.position.set(x, h + 0.9, z);
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.5, 0.025, 8, 40),
            new THREE.MeshBasicMaterial({ color: 0x0e9f9a, transparent: true })
          );
          ring.rotation.x = Math.PI / 2;
          ring.position.set(x, h + 0.2, z);
          city.add(beacon, ring);
          hospitals.push({ x, z, mesh: beacon, ring });
        }
      }
    }

    // Ground grid
    const grid = new THREE.GridHelper(N * SP + 6, 44, dark ? 0x3aa7c9 : 0x1769ff, dark ? 0x12305a : 0xbcd0f2);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = dark ? 0.55 : 0.7;
    city.add(grid);

    // Evacuation route (animated dashes) along main road
    const routePts: THREE.Vector3[] = [];
    const rx = (5 - N / 2) * SP;
    for (let k = 0; k <= 20; k++) routePts.push(new THREE.Vector3(rx, 0.06, -10.5 + k * 1.05));
    const routeGeo = new THREE.BufferGeometry().setFromPoints(routePts);
    const routeMat = new THREE.LineDashedMaterial({ color: 0x12a5a0, dashSize: 0.5, gapSize: 0.3 });
    const route = new THREE.Line(routeGeo, routeMat);
    route.computeLineDistances();
    city.add(route);

    // --- Water ---
    const SEG = 56, SIZE = N * SP + 8;
    const waterGeo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x38a8ff, transparent: true, opacity: dark ? 0.42 : 0.5, roughness: 0.1, metalness: 0.3,
      emissive: 0x1e7bff, emissiveIntensity: dark ? 0.7 : 0.45, side: THREE.DoubleSide,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    scene.add(water);
    const waterPos = waterGeo.attributes.position as THREE.BufferAttribute;
    const base = Float32Array.from(waterPos.array as Float32Array);

    // --- Rain ---
    const RAIN = 1400;
    const rainGeo = new THREE.BufferGeometry();
    const rp = new Float32Array(RAIN * 3);
    for (let i = 0; i < RAIN; i++) {
      rp[i * 3] = (Math.random() - 0.5) * 30;
      rp[i * 3 + 1] = Math.random() * 22;
      rp[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rp, 3));
    const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: dark ? accent : 0x1769ff, size: 0.07, transparent: true, opacity: dark ? 0.7 : 0.55 }));
    scene.add(rain);

    // --- Sizing ---
    const resize = () => {
      const w = mount.clientWidth || 1, h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // --- Interaction ---
    const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
    const onMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting), { threshold: 0.05 });
    io.observe(mount);

    let revealT0: number | null = null;
    const clock = new THREE.Clock();
    let raf = 0;
    const tmpV = new THREE.Vector3();

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const t = clock.getElapsedTime();
      const dt = Math.min(clock.getDelta(), 0.05) || 0.016;

      // Flood level cycles: dry -> rising -> peak -> receding
      const level = 0.15 + (Math.sin(t * 0.35 - 1.2) * 0.5 + 0.5) * 2.6;
      water.position.y = level;

      for (let i = 0; i < waterPos.count; i++) {
        const x = base[i * 3], z = base[i * 3 + 2];
        waterPos.setY(i, Math.sin(x * 0.7 + t * 1.6) * 0.07 + Math.cos(z * 0.9 + t * 1.2) * 0.06);
      }
      waterPos.needsUpdate = true;

      if (dark) {
        edgeOk.color.lerp(accentRef.current, 0.05);
        (rain.material as THREE.PointsMaterial).color.lerp(accentRef.current, 0.05);
      }
      for (const b of buildings) b.edges.material = level > b.h * 0.55 ? edgeBad : edgeOk;

      let cut = 0;
      for (const hp of hospitals) {
        const flooded = level > 1.0;
        if (flooded) cut++;
        const col = flooded ? 0xe5384d : 0x0e9f9a;
        (hp.mesh.material as THREE.MeshBasicMaterial).color.setHex(col);
        const rm = hp.ring.material as THREE.MeshBasicMaterial;
        rm.color.setHex(col);
        const p = (t * 0.8 + hp.x) % 1;
        hp.ring.scale.setScalar(1 + p * 2.4);
        rm.opacity = 1 - p;
        hp.mesh.scale.y = 0.85 + Math.sin(t * 3 + hp.x) * 0.15;
      }
      routeMat.color.setHex(cut > 0 ? 0xf59e0b : 0x12a5a0);
      (routeMat as any).dashOffset = -t * 0.8;

      // Rain
      const arr = rainGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < RAIN; i++) {
        let y = arr.getY(i) - 0.35;
        if (y < level) y = 22;
        arr.setY(i, y);
      }
      arr.needsUpdate = true;

      // Camera: slow orbit + mouse parallax
      mouse.sx += (mouse.x - mouse.sx) * 0.05;
      mouse.sy += (mouse.y - mouse.sy) * 0.05;
      // Intro: hold far above, then descend through the fog into the normal orbit
      let dolly = 0;
      if (revealRef.current !== undefined) {
        if (revealRef.current && revealT0 === null) revealT0 = t;
        const k = revealT0 === null ? 0 : Math.min(1, (t - revealT0) / 3.0);
        dolly = Math.pow(1 - k, 3);
      }
      const ang = t * 0.08 + mouse.sx * 0.5 + 0.8 + dolly * 1.1;
      const r = 24 + dolly * 46;
      camera.position.set(Math.cos(ang) * r, 13 - mouse.sy * 3 + dolly * 34, Math.sin(ang) * r);
      camera.lookAt(tmpV.copy(target));
      key.position.x = -8 + Math.sin(t * 0.5) * 6;

      renderer.render(scene, camera);
    };
    if (reduced) {
      camera.position.set(17, 13, 17);
      camera.lookAt(target);
      renderer.render(scene, camera);
    } else {
      frame();
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('mousemove', onMove);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
      });
      [edgeOk, edgeBad, fill, waterMat, routeMat].forEach((x) => x.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [onFail, dark]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        maskImage: 'radial-gradient(ellipse 85% 80% at 50% 55%, #000 45%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 85% 80% at 50% 55%, #000 45%, transparent 100%)',
      }}
      aria-hidden="true"
    />
  );
};

export default CityTwin3D;
