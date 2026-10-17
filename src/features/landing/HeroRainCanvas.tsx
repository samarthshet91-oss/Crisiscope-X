import React, { useEffect, useRef } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface HotspotNode {
  name: string;
  x: number;
  y: number;
  z: number;
  severity: 'Severe' | 'High' | 'Moderate' | 'Safe';
  label: string;
}

interface DataPacket {
  startNode: number;
  endNode: number;
  progress: number;
  speed: number;
  color: string;
}

export const HeroRainCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId: number;
    let isVisible = true;

    // Mouse parallax tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetMouseX = Math.max(-1, Math.min(1, nx));
      targetMouseY = Math.max(-1, Math.min(1, ny));
    };

    window.addEventListener('mousemove', handleMouseMove);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    let width = 0;
    let height = 0;

    const resize = () => {
      if (!canvas) return;
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // Raindrops with 3 depth layers
    interface Drop {
      x: number;
      y: number;
      length: number;
      speedY: number;
      speedX: number;
      opacity: number;
      layer: number; // 0 = far, 1 = mid, 2 = near
    }

    const dropCount = prefersReducedMotion ? 0 : Math.min(180, Math.floor(width / 7));
    const drops: Drop[] = [];

    for (let i = 0; i < dropCount; i++) {
      const layer = Math.random() < 0.3 ? 0 : Math.random() < 0.7 ? 1 : 2;
      drops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: layer === 0 ? 10 + Math.random() * 8 : layer === 1 ? 18 + Math.random() * 12 : 28 + Math.random() * 18,
        speedY: layer === 0 ? 8 + Math.random() * 4 : layer === 1 ? 14 + Math.random() * 6 : 22 + Math.random() * 8,
        speedX: -1.2,
        opacity: layer === 0 ? 0.12 : layer === 1 ? 0.25 : 0.45,
        layer,
      });
    }

    // Splash ripples when rain hits the ground
    interface Splash {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      opacity: number;
    }
    const splashes: Splash[] = [];

    // Hotspot nodes in Bengaluru terrain space
    const hotspotNodes: HotspotNode[] = [
      { name: 'Ecospace Underpass', x: 0.15, y: 0.65, z: 25, severity: 'Severe', label: '100% Submerged' },
      { name: 'Kadubeesanahalli', x: 0.38, y: 0.58, z: 15, severity: 'High', label: 'Queue Spread +35m' },
      { name: 'Bellandur Lake Outfall', x: 0.58, y: 0.72, z: 5, severity: 'Severe', label: 'Weir Capacity Peak' },
      { name: 'Sakra World Hospital', x: 0.32, y: 0.42, z: 35, severity: 'High', label: 'West Gate Blocked' },
      { name: 'HAL Old Airport Corridor', x: 0.72, y: 0.38, z: 40, severity: 'Safe', label: 'Active Reroute Corridor' },
      { name: 'Koramangala Basin', x: 0.82, y: 0.60, z: 18, severity: 'Moderate', label: 'Rajakaluve 82%' },
    ];

    // Data packets traveling along network routes
    const routes: [number, number][] = [
      [0, 1],
      [1, 2],
      [1, 3],
      [3, 4],
      [2, 5],
      [4, 0],
    ];

    const packets: DataPacket[] = [
      { startNode: 0, endNode: 1, progress: 0.1, speed: 0.008, color: '#FF3B53' },
      { startNode: 1, endNode: 3, progress: 0.4, speed: 0.006, color: '#F59E0B' },
      { startNode: 3, endNode: 4, progress: 0.7, speed: 0.009, color: '#00E5FF' },
      { startNode: 2, endNode: 5, progress: 0.2, speed: 0.007, color: '#00E5FF' },
    ];

    // Buildings for 3D city blocks
    interface Building3D {
      x: number;
      y: number;
      w: number;
      d: number;
      h: number;
      roofColor: string;
      facadeColor: string;
      windowRows: number;
    }

    const buildings: Building3D[] = [];
    const bldCount = 22;
    for (let i = 0; i < bldCount; i++) {
      const bx = 0.08 + (i / bldCount) * 0.84 + (Math.random() * 0.04 - 0.02);
      const by = 0.35 + Math.random() * 0.38;
      const h = 25 + Math.random() * 85;
      buildings.push({
        x: bx,
        y: by,
        w: 18 + Math.random() * 24,
        d: 14 + Math.random() * 16,
        h,
        roofColor: 'rgba(14, 28, 58, 0.85)',
        facadeColor: 'rgba(9, 18, 40, 0.75)',
        windowRows: Math.floor(h / 14),
      });
    }

    let frame = 0;

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      frame++;

      // Smooth mouse lerp
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Camera perspective transform values
      const pitch = 0.55 + currentMouseY * 0.06;
      const yaw = currentMouseX * 0.08;
      const horizonY = height * 0.35 + currentMouseY * 20;
      const groundBaseY = height * 0.88;

      // 1. Perspective 3D Terrain Elevation Grid
      ctx.save();
      const gridCols = 24;
      const gridRows = 16;
      const gridWidth = width * 1.3;
      const gridStartX = -width * 0.15 + currentMouseX * 30;

      for (let r = 0; r <= gridRows; r++) {
        const rowNorm = r / gridRows;
        // Exponential depth scaling for perspective
        const depth = Math.pow(rowNorm, 1.8);
        const y = horizonY + depth * (groundBaseY - horizonY);
        const scale = 0.3 + depth * 0.7;

        ctx.beginPath();
        for (let c = 0; c <= gridCols; c++) {
          const colNorm = c / gridCols;
          const x = gridStartX + (colNorm - 0.5) * gridWidth * scale + width * 0.5;

          // Undulating elevation representing Bengaluru ridge and lake basin
          const valley1 = Math.sin(colNorm * Math.PI * 2.2) * 18 * depth;
          const valley2 = Math.cos(rowNorm * Math.PI * 3.0 + frame * 0.015) * 8 * depth;
          const elevatedY = y - (valley1 + valley2);

          if (c === 0) ctx.moveTo(x, elevatedY);
          else ctx.lineTo(x, elevatedY);
        }

        const alpha = Math.min(0.28, depth * 0.32);
        ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
        ctx.lineWidth = depth > 0.7 ? 1.2 : 0.8;
        ctx.stroke();
      }

      // Longitudinal lines
      for (let c = 0; c <= gridCols; c += 2) {
        const colNorm = c / gridCols;
        ctx.beginPath();
        for (let r = 0; r <= gridRows; r++) {
          const rowNorm = r / gridRows;
          const depth = Math.pow(rowNorm, 1.8);
          const y = horizonY + depth * (groundBaseY - horizonY);
          const scale = 0.3 + depth * 0.7;
          const x = gridStartX + (colNorm - 0.5) * gridWidth * scale + width * 0.5;
          const valley1 = Math.sin(colNorm * Math.PI * 2.2) * 18 * depth;
          const valley2 = Math.cos(rowNorm * Math.PI * 3.0 + frame * 0.015) * 8 * depth;
          const elevatedY = y - (valley1 + valley2);

          if (r === 0) ctx.moveTo(x, elevatedY);
          else ctx.lineTo(x, elevatedY);
        }
        ctx.strokeStyle = `rgba(0, 229, 255, 0.09)`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      ctx.restore();

      // 2. Glowing Flood Basin Water Caustics in Valley Depressions
      ctx.save();
      const basinCenterX = width * 0.38 + currentMouseX * 15;
      const basinCenterY = height * 0.68 + currentMouseY * 10;
      const basinGrad = ctx.createRadialGradient(
        basinCenterX,
        basinCenterY,
        10,
        basinCenterX,
        basinCenterY,
        width * 0.28
      );
      basinGrad.addColorStop(0, 'rgba(255, 59, 83, 0.28)'); // Red choke point at underpass
      basinGrad.addColorStop(0.35, 'rgba(0, 229, 255, 0.18)'); // Flood spreading outward
      basinGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.fillStyle = basinGrad;
      ctx.beginPath();
      ctx.ellipse(basinCenterX, basinCenterY, width * 0.28, height * 0.14, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. 3D Extruded Buildings
      ctx.save();
      buildings.forEach((b) => {
        const depth = Math.pow(b.y, 1.6);
        const scale = 0.4 + depth * 0.7;
        const baseY = horizonY + depth * (groundBaseY - horizonY);
        const baseX = width * b.x + (b.x - 0.5) * currentMouseX * 40;
        const bWidth = b.w * scale;
        const bDepth = b.d * scale;
        const bHeight = b.h * scale;

        // Facade Front
        ctx.fillStyle = b.facadeColor;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(baseX - bWidth / 2, baseY - bHeight, bWidth, bHeight);
        ctx.fill();
        ctx.stroke();

        // Facade Roof (Iso-perspective tilt)
        ctx.fillStyle = b.roofColor;
        ctx.beginPath();
        ctx.moveTo(baseX - bWidth / 2, baseY - bHeight);
        ctx.lineTo(baseX - bWidth / 2 + bDepth * 0.6, baseY - bHeight - bDepth * 0.4);
        ctx.lineTo(baseX + bWidth / 2 + bDepth * 0.6, baseY - bHeight - bDepth * 0.4);
        ctx.lineTo(baseX + bWidth / 2, baseY - bHeight);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Right side wall
        ctx.fillStyle = 'rgba(6, 13, 30, 0.85)';
        ctx.beginPath();
        ctx.moveTo(baseX + bWidth / 2, baseY - bHeight);
        ctx.lineTo(baseX + bWidth / 2 + bDepth * 0.6, baseY - bHeight - bDepth * 0.4);
        ctx.lineTo(baseX + bWidth / 2 + bDepth * 0.6, baseY - bDepth * 0.4);
        ctx.lineTo(baseX + bWidth / 2, baseY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Glowing cyan window lights
        if (b.windowRows > 1) {
          ctx.fillStyle = 'rgba(0, 229, 255, 0.4)';
          for (let r = 1; r < b.windowRows; r++) {
            const wy = baseY - bHeight + r * 12 * scale;
            if (wy < baseY - 6) {
              ctx.fillRect(baseX - bWidth / 2 + 3, wy, bWidth - 6, 1.5);
            }
          }
        }
      });
      ctx.restore();

      // 4. Vector Telemetry Routes & Flowing Packets
      const nodeCoords = hotspotNodes.map((node) => {
        const depth = Math.pow(node.y, 1.6);
        const scale = 0.4 + depth * 0.7;
        const y = horizonY + depth * (groundBaseY - horizonY) - node.z * scale;
        const x = width * node.x + (node.x - 0.5) * currentMouseX * 50;
        return { x, y, scale };
      });

      // Draw connection lines
      ctx.save();
      routes.forEach(([n1, n2]) => {
        const p1 = nodeCoords[n1];
        const p2 = nodeCoords[n2];
        if (!p1 || !p2) return;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 15;
        ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.22)';
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.restore();

      // Draw traveling telemetry data packets
      ctx.save();
      packets.forEach((pkt) => {
        if (!prefersReducedMotion) {
          pkt.progress += pkt.speed;
          if (pkt.progress > 1) pkt.progress = 0;
        }

        const p1 = nodeCoords[pkt.startNode];
        const p2 = nodeCoords[pkt.endNode];
        if (!p1 || !p2) return;

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 15;
        const t = pkt.progress;
        // Quadratic bezier position
        const px = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * midX + t * t * p2.x;
        const py = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * midY + t * t * p2.y;

        ctx.fillStyle = pkt.color;
        ctx.shadowColor = pkt.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      ctx.restore();

      // 5. Hotspot Nodes & Sonar Beacon Rings
      ctx.save();
      hotspotNodes.forEach((node, i) => {
        const pos = nodeCoords[i];
        if (!pos) return;

        const isSevere = node.severity === 'Severe';
        const isHigh = node.severity === 'High';
        const color = isSevere ? '#FF3B53' : isHigh ? '#F59E0B' : '#00E5FF';

        // Animated sonar rings
        const pulse = (frame * 0.03 + i * 1.5) % Math.PI;
        const pulseRadius = 8 + Math.sin(pulse) * 16;
        const pulseAlpha = Math.max(0, 1 - Math.sin(pulse));

        ctx.strokeStyle = color;
        ctx.globalAlpha = pulseAlpha * 0.6;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Node center marker
        ctx.globalAlpha = 1;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Node HUD Tag
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(node.name, pos.x + 8, pos.y - 4);
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = color;
        ctx.fillText(node.label, pos.x + 8, pos.y + 8);
      });
      ctx.restore();

      // 6. Rainfall Particles & Splash Ripples
      if (!prefersReducedMotion) {
        ctx.save();
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';

        for (let i = 0; i < drops.length; i++) {
          const d = drops[i];

          ctx.strokeStyle =
            d.layer === 2
              ? `rgba(0, 229, 255, ${d.opacity})`
              : d.layer === 1
              ? `rgba(56, 189, 248, ${d.opacity})`
              : `rgba(148, 163, 184, ${d.opacity})`;

          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + d.speedX * (d.length / 10), d.y + d.length);
          ctx.stroke();

          d.x += d.speedX;
          d.y += d.speedY;

          // Ground impact splash
          if (d.y > height * 0.82 && Math.random() < 0.15) {
            splashes.push({
              x: d.x,
              y: d.y,
              radius: 1,
              maxRadius: 6 + Math.random() * 8,
              opacity: 0.6,
            });
          }

          if (d.y > height || d.x < 0) {
            d.x = Math.random() * (width + 100);
            d.y = -30;
          }
        }

        // Render Splashes
        for (let s = splashes.length - 1; s >= 0; s--) {
          const sp = splashes[s];
          sp.radius += 0.8;
          sp.opacity -= 0.04;

          if (sp.opacity <= 0) {
            splashes.splice(s, 1);
            continue;
          }

          ctx.strokeStyle = `rgba(0, 229, 255, ${sp.opacity})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.ellipse(sp.x, sp.y, sp.radius * 1.5, sp.radius * 0.6, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 7. Atmospheric Horizon Fog Vignette
      ctx.save();
      const fogGrad = ctx.createLinearGradient(0, horizonY - 60, 0, horizonY + 80);
      fogGrad.addColorStop(0, 'rgba(4, 8, 20, 0.85)');
      fogGrad.addColorStop(0.5, 'rgba(8, 16, 38, 0.35)');
      fogGrad.addColorStop(1, 'rgba(4, 8, 20, 0)');
      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, 0, width, height);

      // Bottom fade into platform overview
      const bottomFade = ctx.createLinearGradient(0, height - 120, 0, height);
      bottomFade.addColorStop(0, 'rgba(4, 8, 20, 0)');
      bottomFade.addColorStop(1, 'rgba(4, 8, 20, 0.95)');
      ctx.fillStyle = bottomFade;
      ctx.fillRect(0, height - 120, width, 120);
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};
