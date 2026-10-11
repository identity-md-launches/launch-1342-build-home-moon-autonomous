import { useEffect, useRef } from 'react';
import type { Seat } from '../data/swarm';
import { prefersReducedMotion } from '../lib/motion';
import './Lattice.css';

interface Props {
  seats: Record<string, Seat> | null;
  mySeat: number;
  working: boolean;
}

interface Node {
  id: number;
  /** Polar placement on a Vogel spiral; r in [0,1]. */
  r: number;
  a: number;
  /** 0 dim, 1 recently active, 2 working now. */
  heat: number;
  phase: number;
}

const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const PLACEHOLDER_COUNT = 320;
const HOUR = 60 * 60 * 1000;

function buildNodes(seats: Record<string, Seat> | null, mySeat: number, now: number): Node[] {
  const ids = seats
    ? Object.values(seats)
        .map((s) => s.tokenId)
        .filter((id) => id !== mySeat)
        .sort((a, b) => a - b)
    : Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => i + 1);
  const n = ids.length;
  const nodes: Node[] = [];
  ids.forEach((id, i) => {
    const seat = seats?.[String(id)];
    const last = seat?.last ? Date.parse(seat.last) : NaN;
    const heat = seat?.working ? 2 : Number.isFinite(last) && now - last < 6 * HOUR ? 1 : 0;
    nodes.push({
      id,
      r: Math.sqrt((i + 1) / (n + 1)),
      a: i * GOLDEN,
      heat,
      phase: (id * 0.618) % (Math.PI * 2),
    });
  });
  return nodes;
}

/* Colours are read from the tokens so a rebrand keeps the lattice in step. */
function readTokens(el: HTMLElement) {
  const cs = getComputedStyle(el);
  return {
    accent: cs.getPropertyValue('--color-accent').trim() || '#4fe3ff',
    deep: cs.getPropertyValue('--color-accent-deep').trim() || '#17b7d6',
    line: cs.getPropertyValue('--color-border-strong').trim() || '#36465a',
    dim: cs.getPropertyValue('--color-text-muted').trim() || '#7d8b99',
  };
}

/**
 * The swarm lattice: one node per IMD seat on a Vogel spiral, seat #558 at the
 * centre. Drift is a slow sinusoidal wobble; the centre pulses while working.
 * Frozen (drawn once) under prefers-reduced-motion, paused when offscreen or
 * when the tab is hidden. Canvas 2D only, no dependencies.
 */
export function Lattice({ seats, mySeat, working }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const nodes = useRef<Node[]>([]);
  const state = useRef({ seats, working });
  state.current = { seats, working };
  const wakeRef = useRef<() => void>(() => {});

  useEffect(() => {
    nodes.current = buildNodes(seats, mySeat, Date.now());
    wakeRef.current();
  }, [seats, mySeat]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let visible = true;
    let width = 0;
    let height = 0;
    let dpr = 1;
    const tokens = readTokens(canvas);
    const start = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      const reduced = prefersReducedMotion();
      const time = reduced ? 0 : (t - start) / 1000;
      const list = nodes.current;
      const wide = width > 832;
      const cx = width * (wide ? 0.68 : 0.5);
      const cy = wide ? height * 0.5 : width * 0.3;
      const radius = wide ? Math.min(width, height) * 0.62 : width * 0.62;
      const n = list.length;
      // Density adapts to area: skip nodes that would be closer than ~9px apart.
      const budget = Math.floor((radius * radius * 3.1) / 110);
      const stride = Math.max(1, Math.ceil(n / Math.max(60, budget)));

      ctx.clearRect(0, 0, width, height);

      const xy = new Float32Array(n * 2);
      for (let i = 0; i < n; i += stride) {
        const node = list[i]!;
        const wobble = reduced ? 0 : Math.sin(time * 0.35 + node.phase) * 0.012;
        const r = (node.r + wobble) * radius;
        const a = node.a + (reduced ? 0 : time * 0.006);
        xy[i * 2] = cx + Math.cos(a) * r;
        xy[i * 2 + 1] = cy + Math.sin(a) * r;
      }

      // Links: each node to its spiral predecessor and to the arm neighbour.
      ctx.lineWidth = 1;
      ctx.strokeStyle = tokens.line;
      ctx.globalAlpha = 0.42;
      ctx.beginPath();
      for (let i = stride; i < n; i += stride) {
        const j = i - stride;
        ctx.moveTo(xy[i * 2]!, xy[i * 2 + 1]!);
        ctx.lineTo(xy[j * 2]!, xy[j * 2 + 1]!);
        const k = i - stride * 8;
        if (k >= 0 && (i / stride) % 3 === 0) {
          ctx.moveTo(xy[i * 2]!, xy[i * 2 + 1]!);
          ctx.lineTo(xy[k * 2]!, xy[k * 2 + 1]!);
        }
      }
      ctx.stroke();
      // Spokes from the centre to the innermost ring.
      ctx.beginPath();
      for (let i = 0; i < Math.min(n, stride * 6); i += stride) {
        ctx.moveTo(cx, cy);
        ctx.lineTo(xy[i * 2]!, xy[i * 2 + 1]!);
      }
      ctx.stroke();

      // Nodes.
      for (let i = 0; i < n; i += stride) {
        const node = list[i]!;
        const x = xy[i * 2]!;
        const y = xy[i * 2 + 1]!;
        if (node.heat === 2) {
          ctx.globalAlpha = 0.95;
          ctx.fillStyle = tokens.accent;
          ctx.beginPath();
          ctx.arc(x, y, 2.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 0.25;
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        } else if (node.heat === 1) {
          ctx.globalAlpha = 0.8;
          ctx.fillStyle = tokens.deep;
          ctx.beginPath();
          ctx.arc(x, y, 1.6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.globalAlpha = 0.55;
          ctx.fillStyle = tokens.dim;
          ctx.beginPath();
          ctx.arc(x, y, 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Centre: this seat.
      const isWorking = state.current.working;
      const pulse = reduced || !isWorking ? 0 : (Math.sin(time * 2.6) + 1) / 2;
      ctx.globalAlpha = 0.18 + pulse * 0.22;
      ctx.fillStyle = tokens.accent;
      ctx.beginPath();
      ctx.arc(cx, cy, 22 + pulse * 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = tokens.accent;
      ctx.beginPath();
      ctx.arc(cx, cy, 12 + pulse * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
      // Crosshair ticks.
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const) {
        ctx.moveTo(cx + dx * 18, cy + dy * 18);
        ctx.lineTo(cx + dx * 26, cy + dy * 26);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const loop = (t: number) => {
      draw(t);
      if (!prefersReducedMotion() && visible && document.visibilityState === 'visible') {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    };
    const wake = () => {
      if (raf === 0) raf = requestAnimationFrame(loop);
    };
    wakeRef.current = wake;

    const ro = new ResizeObserver(() => {
      resize();
      wake();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) wake();
    });
    io.observe(canvas);
    const onVis = () => wake();
    document.addEventListener('visibilitychange', onVis);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener('change', wake);

    resize();
    wake();
    // Redraw once per data change even when frozen.
    const redraw = window.setInterval(wake, 20_000);

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      wakeRef.current = () => {};
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      mq.removeEventListener('change', wake);
      window.clearInterval(redraw);
    };
  }, []);

  // Wake the loop when the working flag changes so a frozen canvas also updates.
  useEffect(() => {
    wakeRef.current();
  }, [working]);

  return <canvas ref={ref} className="lattice" aria-hidden="true" />;
}
