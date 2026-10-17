import React, { useEffect, useRef } from 'react';
import { HERO_CONFIG } from '../../config/hero';

export const HeroRainCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let animationFrameId: number;
    let isVisible = true;

    // Intersection observer to pause off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(canvas);

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle definition
    interface RainDrop {
      x: number;
      y: number;
      l: number;
      xs: number;
      ys: number;
      opacity: number;
    }

    interface Ripple { x: number; y: number; r: number; a: number }
    const ripples: Ripple[] = [];
    let t = 0;
    const count = HERO_CONFIG.rainParticleCount;
    const drops: RainDrop[] = [];

    for (let i = 0; i < count; i++) {
      drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        l: Math.random() * 25 + 15,
        xs: -1.5,
        ys: Math.random() * 12 + 10,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.02;

      // Neon horizon grid (perspective floor)
      const horizon = canvas.height * 0.72;
      ctx.lineWidth = 1;
      for (let i = 0; i < 14; i++) {
        const k = ((i + (t * 2) % 1) / 14);
        const y = horizon + Math.pow(k, 2.2) * (canvas.height - horizon);
        ctx.strokeStyle = `rgba(56,189,248,${0.05 + k * 0.18})`;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
      for (let i = -12; i <= 12; i++) {
        ctx.strokeStyle = 'rgba(56,189,248,0.10)';
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 + i * 18, horizon);
        ctx.lineTo(canvas.width / 2 + i * 140, canvas.height);
        ctx.stroke();
      }

      // Draw subtle city skyline silhouettes
      ctx.fillStyle = 'rgba(6, 13, 30, 0.55)';
      const skylinePoints = [
        [0, canvas.height - 180],
        [120, canvas.height - 240],
        [220, canvas.height - 200],
        [340, canvas.height - 310],
        [460, canvas.height - 210],
        [580, canvas.height - 280],
        [720, canvas.height - 190],
        [880, canvas.height - 340],
        [1040, canvas.height - 230],
        [1200, canvas.height - 290],
        [1400, canvas.height - 200],
        [canvas.width, canvas.height - 170],
        [canvas.width, canvas.height],
        [0, canvas.height],
      ];
      ctx.beginPath();
      skylinePoints.forEach(([x, y], idx) => {
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(56,189,248,0.25)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Raindrops
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';

      for (let i = 0; i < count; i++) {
        const d = drops[i];
        ctx.strokeStyle = `rgba(56, 189, 248, ${d.opacity})`;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.xs, d.y + d.ys);
        ctx.stroke();

        d.x += d.xs;
        d.y += d.ys;

        if (d.y > canvas.height * 0.9 && Math.random() < 0.04 && ripples.length < 40) {
          ripples.push({ x: d.x, y: canvas.height * (0.78 + Math.random() * 0.2), r: 1, a: 0.5 });
        }
        if (d.x < 0 || d.y > canvas.height) {
          d.x = Math.random() * (canvas.width + 100);
          d.y = -20;
        }
      }

      // Expanding ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += 1.1; r.a -= 0.012;
        if (r.a <= 0) { ripples.splice(i, 1); continue; }
        ctx.strokeStyle = `rgba(94,234,212,${r.a})`;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.r * 2, r.r * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
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
