import React, { useEffect, useRef, useState } from 'react';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sliders,
  Eye,
  Layers,
  Sparkles,
  CloudRain,
  Navigation,
  Building,
  AlertTriangle,
} from 'lucide-react';

interface Cascade3DProps {
  timelineStep: number;
  rainfallIntensityMm: number;
  isSimulating: boolean;
  injectedDisruptions: string[];
  injectedUnavailableFacilities: string[];
  onDisruptRoad?: (roadId: string) => void;
  onToggleFacility?: (facilityId: string) => void;
}

interface BuildingDef {
  id: string;
  name: string;
  x: number; // grid x
  y: number; // grid y
  w: number; // width
  d: number; // depth
  h: number; // height
  type: 'techpark' | 'hospital' | 'commercial' | 'transit';
  roofFeature?: 'helipad' | 'antenna' | 'ac';
}

export const Cascade3DDigitalTwin: React.FC<Cascade3DProps> = ({
  timelineStep,
  rainfallIntensityMm,
  isSimulating,
  injectedDisruptions,
  injectedUnavailableFacilities,
  onDisruptRoad,
  onToggleFacility,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Camera angles and zoom
  const [cameraAngle, setCameraAngle] = useState(-42); // degrees yaw
  const [cameraPitch, setCameraPitch] = useState(38); // degrees pitch
  const [zoom, setZoom] = useState(1.0);
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);

  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Reset Camera View
  const resetCamera = () => {
    setCameraAngle(-42);
    setCameraPitch(38);
    setZoom(1.0);
  };

  // Buildings in the Outer Ring Road Bellandur-Ecospace digital twin corridor
  const buildings: BuildingDef[] = [
    {
      id: 'bld-ecospace-1',
      name: 'Ecospace Tech Park 1',
      x: -140,
      y: -60,
      w: 90,
      d: 55,
      h: 95,
      type: 'techpark',
      roofFeature: 'helipad',
    },
    {
      id: 'bld-ecospace-2',
      name: 'Ecospace Campus 2',
      x: -140,
      y: 20,
      w: 80,
      d: 65,
      h: 120,
      type: 'techpark',
      roofFeature: 'ac',
    },
    {
      id: 'bld-rmz-1',
      name: 'RMZ EcoWorld North',
      x: -130,
      y: 110,
      w: 75,
      d: 50,
      h: 140,
      type: 'techpark',
      roofFeature: 'antenna',
    },
    {
      id: 'bld-hospital-sakra',
      name: 'Sakra World Hospital',
      x: 80,
      y: -80,
      w: 110,
      d: 75,
      h: 80,
      type: 'hospital',
      roofFeature: 'helipad',
    },
    {
      id: 'bld-commercial-1',
      name: 'Bellandur Gateway',
      x: 90,
      y: 30,
      w: 70,
      d: 60,
      h: 110,
      type: 'commercial',
      roofFeature: 'ac',
    },
    {
      id: 'bld-commercial-2',
      name: 'Kadubeesanahalli Hub',
      x: 100,
      y: 115,
      w: 85,
      d: 50,
      h: 130,
      type: 'commercial',
    },
  ];

  // Mouse drag camera controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setCameraAngle((prev) => (prev + deltaX * 0.45) % 360);
    setCameraPitch((prev) => Math.max(15, Math.min(75, prev - deltaY * 0.35)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.65, Math.min(1.8, prev - e.deltaY * 0.0012)));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId: number;
    let frame = 0;

    const resize = () => {
      const container = containerRef.current;
      if (!container || !canvas) return;
      canvas.width = container.clientWidth * window.devicePixelRatio;
      canvas.height = container.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    // Iso-3D projection helper
    const project = (
      x: number,
      y: number,
      z: number,
      width: number,
      height: number
    ): { px: number; py: number; depth: number } => {
      const radYaw = (cameraAngle * Math.PI) / 180;
      const radPitch = (cameraPitch * Math.PI) / 180;

      // Rotate around Z axis (yaw)
      const xRot = x * Math.cos(radYaw) - y * Math.sin(radYaw);
      const yRot = x * Math.sin(radYaw) + y * Math.cos(radYaw);

      // Rotate around X axis (pitch)
      const yProjected = yRot * Math.sin(radPitch) - z * Math.cos(radPitch);
      const zProjected = yRot * Math.cos(radPitch) + z * Math.sin(radPitch);

      // Perspective projection
      const fov = 750;
      const cameraDist = 580 / zoom;
      const depth = cameraDist + zProjected;
      const scale = fov / Math.max(50, depth);

      const px = width / 2 + xRot * scale;
      const py = height / 2 + yProjected * scale + 30;

      return { px, py, depth };
    };

    // Runoff flow particles along rajakaluve canal
    const runoffParticles = Array.from({ length: 40 }, () => ({
      progress: Math.random(),
      speed: 0.006 + Math.random() * 0.006,
      offset: (Math.random() - 0.5) * 8,
    }));

    // Raindrop particles for 3D simulation
    const rainParticles = Array.from({ length: 120 }, () => ({
      x: (Math.random() - 0.5) * 600,
      y: (Math.random() - 0.5) * 600,
      z: 50 + Math.random() * 300,
      speed: 12 + Math.random() * 8,
      len: 16 + Math.random() * 12,
    }));

    const render = () => {
      frame++;
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, width, height);

      // Deep command center background with subtle gradient
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        50,
        width / 2,
        height / 2,
        width * 0.7
      );
      bgGrad.addColorStop(0, '#0A1530');
      bgGrad.addColorStop(0.65, '#060D1E');
      bgGrad.addColorStop(1, '#040814');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Coordinate Grid Lines (Ground Plane at Z = 0)
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 320;
      const gridStep = 40;

      for (let g = -gridSize; g <= gridSize; g += gridStep) {
        const p1 = project(g, -gridSize, 0, width, height);
        const p2 = project(g, gridSize, 0, width, height);
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();

        const p3 = project(-gridSize, g, 0, width, height);
        const p4 = project(gridSize, g, 0, width, height);
        ctx.beginPath();
        ctx.moveTo(p3.px, p3.py);
        ctx.lineTo(p4.px, p4.py);
        ctx.stroke();
      }

      // Rajakaluve Primary Stormwater Canal (Z = -2)
      ctx.save();
      const canalP1 = project(-240, -140, -2, width, height);
      const canalP2 = project(-40, -30, -2, width, height);
      const canalP3 = project(60, 40, -2, width, height);
      const canalP4 = project(240, 160, -2, width, height);

      ctx.beginPath();
      ctx.moveTo(canalP1.px, canalP1.py);
      ctx.bezierCurveTo(canalP2.px, canalP2.py, canalP3.px, canalP3.py, canalP4.px, canalP4.py);
      ctx.lineWidth = 16 * zoom;
      ctx.strokeStyle = 'rgba(8, 24, 48, 0.9)';
      ctx.stroke();

      // Water stream inside canal
      const canalWaterAlpha = 0.4 + (rainfallIntensityMm / 120) * 0.45;
      ctx.strokeStyle = `rgba(0, 229, 255, ${canalWaterAlpha})`;
      ctx.lineWidth = 8 * zoom;
      ctx.stroke();

      // Animated runoff particles in canal
      if (!prefersReducedMotion) {
        runoffParticles.forEach((pt) => {
          pt.progress += pt.speed;
          if (pt.progress > 1) pt.progress = 0;
          const t = pt.progress;
          // Cubic bezier point on canal
          const cx =
            Math.pow(1 - t, 3) * -240 +
            3 * Math.pow(1 - t, 2) * t * -40 +
            3 * (1 - t) * Math.pow(t, 2) * 60 +
            Math.pow(t, 3) * 240;
          const cy =
            Math.pow(1 - t, 3) * -140 +
            3 * Math.pow(1 - t, 2) * t * -30 +
            3 * (1 - t) * Math.pow(t, 2) * 40 +
            Math.pow(t, 3) * 160;

          const pCanal = project(cx, cy + pt.offset, 0, width, height);
          ctx.fillStyle = '#00E5FF';
          ctx.beginPath();
          ctx.arc(pCanal.px, pCanal.py, 2.2 * zoom, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      ctx.restore();

      // Road Network Layer: Outer Ring Road (ORR) Arterial Highway
      const isEcospaceFlooded =
        timelineStep >= 1 || injectedDisruptions.includes('road-ecospace-underpass');

      // Main Carriage (ORR)
      ctx.save();
      const orrStart = project(-280, 0, 0, width, height);
      const orrMid1 = project(-70, 0, -18, width, height); // Depressed underpass entrance
      const orrCenter = project(0, 0, -24, width, height); // Ecospace Underpass lowest barrel
      const orrMid2 = project(70, 0, -18, width, height); // Underpass exit ramp
      const orrEnd = project(280, 0, 0, width, height);

      // Roadbed
      ctx.beginPath();
      ctx.moveTo(orrStart.px, orrStart.py);
      ctx.lineTo(orrMid1.px, orrMid1.py);
      ctx.lineTo(orrCenter.px, orrCenter.py);
      ctx.lineTo(orrMid2.px, orrMid2.py);
      ctx.lineTo(orrEnd.px, orrEnd.py);
      ctx.strokeStyle = '#121F38';
      ctx.lineWidth = 26 * zoom;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Road lanes
      ctx.strokeStyle = '#1E3560';
      ctx.lineWidth = 22 * zoom;
      ctx.stroke();

      // Dashed lane divider
      ctx.strokeStyle = isEcospaceFlooded ? '#FF3B53' : '#00E5FF';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Service Feeder Roads connecting to Kadubeesanahalli & Sakra
      ctx.save();
      const srv1 = project(-90, -80, 0, width, height);
      const srv2 = project(0, -70, 0, width, height);
      const srv3 = project(100, -80, 0, width, height);

      ctx.beginPath();
      ctx.moveTo(srv1.px, srv1.py);
      ctx.lineTo(srv2.px, srv2.py);
      ctx.lineTo(srv3.px, srv3.py);
      ctx.strokeStyle = '#182E54';
      ctx.lineWidth = 14 * zoom;
      ctx.stroke();

      // Alternate Reroute Path (HAL Corridor Bypass)
      if (timelineStep >= 2) {
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.setLineDash([]);
      }
      ctx.restore();

      // Water accumulation in Ecospace Underpass Barrel
      if (isEcospaceFlooded) {
        ctx.save();
        const waterRise = Math.min(22, 6 + timelineStep * 5 + (rainfallIntensityMm / 120) * 6);
        const waterCenter = project(0, 0, -24 + waterRise, width, height);
        const waterP1 = project(-60, -18, -24 + waterRise, width, height);
        const waterP2 = project(60, -18, -24 + waterRise, width, height);
        const waterP3 = project(60, 18, -24 + waterRise, width, height);
        const waterP4 = project(-60, 18, -24 + waterRise, width, height);

        // Water surface polygon
        ctx.beginPath();
        ctx.moveTo(waterP1.px, waterP1.py);
        ctx.lineTo(waterP2.px, waterP2.py);
        ctx.lineTo(waterP3.px, waterP3.py);
        ctx.lineTo(waterP4.px, waterP4.py);
        ctx.closePath();

        const floodGrad = ctx.createRadialGradient(
          waterCenter.px,
          waterCenter.py,
          5,
          waterCenter.px,
          waterCenter.py,
          45 * zoom
        );
        floodGrad.addColorStop(0, 'rgba(255, 59, 83, 0.7)'); // Severe flood core
        floodGrad.addColorStop(0.6, 'rgba(0, 229, 255, 0.45)');
        floodGrad.addColorStop(1, 'rgba(0, 229, 255, 0.15)');
        ctx.fillStyle = floodGrad;
        ctx.fill();

        // Water boundary glow
        ctx.strokeStyle = 'rgba(255, 59, 83, 0.9)';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#FF3B53';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Sonar Wave Halo at Ecospace choke point
        const haloRadius = (15 + (frame * 0.5) % 35) * zoom;
        const haloAlpha = Math.max(0, 1 - haloRadius / (50 * zoom));
        ctx.strokeStyle = `rgba(255, 59, 83, ${haloAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(waterCenter.px, waterCenter.py, haloRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      // Sort and Render 3D Buildings by Depth
      const renderedBuildings = buildings.map((b) => {
        const center = project(b.x + b.w / 2, b.y + b.d / 2, 0, width, height);
        return { ...b, depth: center.depth };
      });

      // Sort back-to-front
      renderedBuildings.sort((a, b) => b.depth - a.depth);

      renderedBuildings.forEach((b) => {
        ctx.save();
        const p1 = project(b.x, b.y, 0, width, height);
        const p2 = project(b.x + b.w, b.y, 0, width, height);
        const p3 = project(b.x + b.w, b.y + b.d, 0, width, height);
        const p4 = project(b.x, b.y + b.d, 0, width, height);

        const r1 = project(b.x, b.y, b.h, width, height);
        const r2 = project(b.x + b.w, b.y, b.h, width, height);
        const r3 = project(b.x + b.w, b.y + b.d, b.h, width, height);
        const r4 = project(b.x, b.y + b.d, b.h, width, height);

        const isHospital = b.type === 'hospital';
        const isSakraIsolated =
          timelineStep >= 3 || injectedUnavailableFacilities.includes('fac-sakra-world-hospital');

        // Wall colors
        const wallBaseColor = isHospital ? '#0F2648' : '#0B1732';
        const wallHighlightColor = isHospital ? '#173D72' : '#142750';

        // Front Wall
        ctx.fillStyle = wallBaseColor;
        ctx.strokeStyle = isHospital ? 'rgba(0, 229, 255, 0.4)' : 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.lineTo(r2.px, r2.py);
        ctx.lineTo(r1.px, r1.py);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Right Wall
        ctx.fillStyle = wallHighlightColor;
        ctx.beginPath();
        ctx.moveTo(p2.px, p2.py);
        ctx.lineTo(p3.px, p3.py);
        ctx.lineTo(r3.px, r3.py);
        ctx.lineTo(r2.px, r2.py);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Roof Top
        ctx.fillStyle = isHospital ? '#193F78' : '#162C58';
        ctx.beginPath();
        ctx.moveTo(r1.px, r1.py);
        ctx.lineTo(r2.px, r2.py);
        ctx.lineTo(r3.px, r3.py);
        ctx.lineTo(r4.px, r4.py);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Window Rows
        ctx.fillStyle = isHospital
          ? isSakraIsolated
            ? 'rgba(255, 59, 83, 0.6)'
            : 'rgba(0, 229, 255, 0.6)'
          : 'rgba(56, 189, 248, 0.35)';

        for (let zh = 12; zh < b.h - 8; zh += 16) {
          const w1 = project(b.x + 4, b.y, zh, width, height);
          const w2 = project(b.x + b.w - 4, b.y, zh, width, height);
          ctx.beginPath();
          ctx.moveTo(w1.px, w1.py);
          ctx.lineTo(w2.px, w2.py);
          ctx.lineWidth = 2 * zoom;
          ctx.stroke();
        }

        // Helipad or Roof Feature
        if (b.roofFeature === 'helipad') {
          const roofCenter = project(b.x + b.w / 2, b.y + b.d / 2, b.h + 1, width, height);
          ctx.strokeStyle = isHospital
            ? isSakraIsolated
              ? '#FF3B53'
              : '#00E5FF'
            : '#F59E0B';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(roofCenter.px, roofCenter.py, 10 * zoom, 0, Math.PI * 2);
          ctx.stroke();

          ctx.font = `${Math.max(8, 10 * zoom)}px "JetBrains Mono", monospace`;
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('H', roofCenter.px, roofCenter.py);
        }

        // 3D Hospital Access Status Beacon
        if (isHospital) {
          const beaconTop = project(b.x + b.w / 2, b.y + b.d / 2, b.h + 30, width, height);
          const beaconColor = isSakraIsolated ? '#FF3B53' : '#10B981';

          ctx.strokeStyle = beaconColor;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(beaconTop.px, beaconTop.py, 6 * zoom, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = beaconColor;
          ctx.shadowColor = beaconColor;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(beaconTop.px, beaconTop.py, 3 * zoom, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // HUD Tag
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText('Sakra Trauma Center', beaconTop.px, beaconTop.py - 12);
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.fillStyle = beaconColor;
          ctx.fillText(
            isSakraIsolated ? 'WEST GATE BLOCKED (-2 Ingress)' : 'ALL INGRESS CLEAR',
            beaconTop.px,
            beaconTop.py + 14
          );
        }

        ctx.restore();
      });

      // Interactive 3D Hotspot Pins (Ecospace Choke Point)
      ctx.save();
      const underpassBeacon = project(0, 0, 10, width, height);
      ctx.fillStyle = isEcospaceFlooded ? '#FF3B53' : '#00E5FF';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(underpassBeacon.px, underpassBeacon.py, 5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('Ecospace Underpass', underpassBeacon.px + 12, underpassBeacon.py - 4);
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = isEcospaceFlooded ? '#FF3B53' : '#00E5FF';
      ctx.fillText(
        isEcospaceFlooded ? 'SUBMERGED (Severe Risk)' : 'FLOW NORMAL',
        underpassBeacon.px + 12,
        underpassBeacon.py + 8
      );
      ctx.restore();

      // 3D Animated Rainfall streaks
      if (!prefersReducedMotion) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';

        rainParticles.forEach((rp) => {
          rp.z -= rp.speed;
          if (rp.z < 0) {
            rp.z = 240 + Math.random() * 80;
            rp.x = (Math.random() - 0.5) * 500;
            rp.y = (Math.random() - 0.5) * 500;
          }

          const top = project(rp.x, rp.y, rp.z, width, height);
          const btm = project(rp.x - 4, rp.y - 2, rp.z - rp.len, width, height);

          ctx.beginPath();
          ctx.moveTo(top.px, top.py);
          ctx.lineTo(btm.px, btm.py);
          ctx.stroke();
        });
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [
    cameraAngle,
    cameraPitch,
    zoom,
    timelineStep,
    rainfallIntensityMm,
    injectedDisruptions,
    injectedUnavailableFacilities,
  ]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className="relative w-full h-full min-h-[460px] cursor-grab active:cursor-grabbing select-none overflow-hidden rounded-card border border-navy-700/80 bg-navy-950 shadow-glass"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Floating 3D Navigation & Camera Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-navy-900/90 backdrop-blur-md p-1.5 rounded-xl border border-navy-700/80 shadow-glass">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
          title="Zoom in (+)"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4 text-cyan-400" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.65, z - 0.15))}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
          title="Zoom out (-)"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4 text-cyan-400" />
        </button>
        <button
          type="button"
          onClick={resetCamera}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
          title="Reset 3D camera angle"
          aria-label="Reset 3D camera angle"
        >
          <RotateCcw className="w-4 h-4 text-slate-300" />
        </button>
      </div>

      {/* Floating Tactical Coordinate & Scenario HUD */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="p-3 bg-navy-950/90 backdrop-blur-md rounded-xl border border-cyan-500/30 text-white shadow-[0_0_20px_rgba(0,229,255,0.12)] space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-bold font-mono tracking-tight text-cyan-300">
              CASCADEVISION 3D DIGITAL TWIN
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Sector: Outer Ring Road Bellandur (Ecospace Corridor)
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-1 border-t border-navy-800/80">
            <span>Yaw: {Math.round(cameraAngle)}°</span>
            <span>Pitch: {Math.round(cameraPitch)}°</span>
            <span>Zoom: {Math.round(zoom * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Interactive Drag & Orbit Guidance Badge */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
        <div className="px-3 py-1.5 rounded-lg bg-navy-900/85 backdrop-blur-md border border-navy-700/80 text-[10px] text-slate-400 font-mono flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Click & drag to orbit • Scroll to zoom</span>
        </div>
      </div>
    </div>
  );
};
