import { useEffect, useRef, useState } from 'react';

/** Count a number up from 0 to `target` with easing. Falls back to raw string if not numeric. */
export function useCountUp(value: string | number, duration = 1200) {
  const str = String(value);
  const match = str.match(/-?\d[\d,]*\.?\d*/);
  const [out, setOut] = useState(str);

  useEffect(() => {
    if (!match || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOut(str);
      return;
    }
    const raw = match[0];
    const target = parseFloat(raw.replace(/,/g, ''));
    const decimals = raw.includes('.') ? raw.split('.')[1].length : 0;
    const useComma = raw.includes(',');
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      let n = (target * eased).toFixed(decimals);
      if (useComma) n = Number(n).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      setOut(str.replace(raw, n));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [str, duration]);

  return out;
}

/** Adds `is-in` to elements with .cx-reveal when they scroll into view. */
export function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.cx-reveal');
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    els.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 80}ms`;
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
}

/** Tracks the mouse and exposes it as --mx / --my CSS variables on the referenced element. */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      el.style.setProperty('--mx', `${e.clientX}px`);
      el.style.setProperty('--my', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return ref;
}

/** 3D card tilt via event delegation: any element with .cx-tilt rotates toward the cursor. */
export function useTilt3D() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let active: HTMLElement | null = null;
    const move = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest?.('.cx-tilt') as HTMLElement | null;
      if (active && active !== el) active.style.transform = '';
      active = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--gx', `${(px + 0.5) * 100}%`);
      el.style.setProperty('--gy', `${(py + 0.5) * 100}%`);
      el.style.transform = `perspective(900px) rotateX(${(-py * 9).toFixed(2)}deg) rotateY(${(px * 11).toFixed(2)}deg) translateZ(8px)`;
    };
    const leave = () => { if (active) active.style.transform = ''; active = null; };
    document.addEventListener('mousemove', move, { passive: true });
    document.addEventListener('mouseleave', leave);
    return () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseleave', leave); };
  }, []);
}

/** Writes page scroll progress (0..1) to --sp on :root. */
export function useScrollProgress() {
  useEffect(() => {
    const f = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      document.documentElement.style.setProperty('--sp', String(max > 0 ? window.scrollY / max : 0));
    };
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
}
