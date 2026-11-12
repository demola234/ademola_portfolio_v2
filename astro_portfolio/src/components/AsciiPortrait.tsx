import { useEffect, useRef } from 'react';

interface Props {
  /** Video sources for the portrait, in order of preference. */
  sources: { src: string; type: string }[];
  size?: number;
  /** RGB triplet for the ASCII ink. */
  color?: string;
  /** Radius of the colour spotlight around the pointer, in CSS px. */
  spotlight?: number;
}

const CHARS = ' .:-=+*#%@';
const FONT_SIZE = 7;
const COL_GAP = FONT_SIZE * 0.7;
const ROW_GAP = FONT_SIZE * 1.1;

/**
 * An animated portrait drawn as ASCII, frame by frame, from a looping video.
 * Where the pointer is, a soft circle shows the video in its real colours.
 */
export default function AsciiPortrait({ sources, size = 300, color = '244, 244, 243', spotlight = 70 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    // One sample per character cell: the browser averages the frame for us when it scales it down.
    const cols = Math.floor(size / COL_GAP);
    const rows = Math.floor(size / ROW_GAP);
    const sample = document.createElement('canvas');
    sample.width = cols;
    sample.height = rows;
    const sampleCtx = sample.getContext('2d', { willReadFrequently: true })!;

    // The spotlight is drawn on its own layer, then masked to a soft-edged circle.
    const spot = document.createElement('canvas');
    spot.width = size * dpr;
    spot.height = size * dpr;
    const spotCtx = spot.getContext('2d')!;
    spotCtx.scale(dpr, dpr);

    const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false, strength: 0 };
    let raf = 0;
    let visible = true;
    let last = performance.now();

    const smoothstep = (e0: number, e1: number, t: number) => {
      const x = Math.min(1, Math.max(0, (t - e0) / (e1 - e0)));
      return x * x * (3 - 2 * x);
    };
    // The spotlight opens up as it fades in, and closes as it fades out.
    const radius = () => spotlight * (0.55 + 0.45 * (1 - Math.pow(1 - pointer.strength, 3)));
    // How much of the colour shows at a distance d from the pointer: 1 at the centre, easing to 0 at the edge.
    const reveal = (d: number, r: number) => pointer.strength * (1 - smoothstep(0.2, 1, d / r));

    const drawAscii = () => {
      sampleCtx.drawImage(video, 0, 0, cols, rows);
      const px = sampleCtx.getImageData(0, 0, cols, rows).data;
      ctx.clearRect(0, 0, size, size);
      ctx.font = `${FONT_SIZE}px ui-monospace, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const lit = pointer.strength > 0.01;
      const r = radius();
      for (let row = 0; row < rows; row++) {
        for (let c = 0; c < cols; c++) {
          const i = (row * cols + c) * 4;
          const brightness = (px[i] + px[i + 1] + px[i + 2]) / (3 * 255);
          const ch = CHARS[Math.floor(brightness * (CHARS.length - 1))];
          if (ch === ' ') continue;
          const x = c * COL_GAP + COL_GAP / 2;
          const y = row * ROW_GAP + ROW_GAP / 2;
          // Characters dissolve where the colour comes through, on the same falloff, so the two blend.
          const fade = lit ? 1 - reveal(Math.hypot(x - pointer.x, y - pointer.y), r) : 1;
          if (fade < 0.02) continue;
          ctx.fillStyle = `rgba(${color}, ${((0.35 + brightness * 0.65) * fade).toFixed(3)})`;
          ctx.fillText(ch, x, y);
        }
      }
    };

    const drawSpotlight = () => {
      if (pointer.strength < 0.01) return;
      const r = radius();
      spotCtx.globalCompositeOperation = 'source-over';
      spotCtx.clearRect(0, 0, size, size);
      spotCtx.drawImage(video, 0, 0, size, size);
      spotCtx.globalCompositeOperation = 'destination-in';
      const g = spotCtx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, r);
      // Sample the eased falloff so the edge has no visible ring.
      for (let k = 0; k <= 10; k++) {
        const t = k / 10;
        g.addColorStop(t, `rgba(0,0,0,${reveal(t * r, r).toFixed(3)})`);
      }
      spotCtx.fillStyle = g;
      spotCtx.fillRect(0, 0, size, size);
      ctx.drawImage(spot, 0, 0, size, size);
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!visible || video.readyState < 2) return schedule();
      // Time-based easing: the same feel at 60 Hz and 120 Hz.
      const follow = 1 - Math.exp(-dt / 0.09);
      pointer.x += (pointer.tx - pointer.x) * follow;
      pointer.y += (pointer.ty - pointer.y) * follow;
      const fadeTau = pointer.active ? 0.22 : 0.32; // opens a touch faster than it closes
      pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * (1 - Math.exp(-dt / fadeTau));
      if (!pointer.active && pointer.strength < 0.005) pointer.strength = 0;
      drawAscii();
      drawSpotlight();
      schedule();
    };
    const schedule = () => {
      // A still portrait (reduced motion) only needs redrawing while the spotlight moves or fades.
      const needed = !reduceMotion || pointer.active || pointer.strength > 0 || video.readyState < 2;
      if (!raf && needed) { last = Math.min(last, performance.now()); raf = requestAnimationFrame(frame); }
    };

    const toLocal = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = clientX - rect.left;
      pointer.ty = clientY - rect.top;
      if (!pointer.active) { pointer.x = pointer.tx; pointer.y = pointer.ty; }
      pointer.active = true;
      schedule();
    };
    const onMove = (e: PointerEvent) => toLocal(e.clientX, e.clientY);
    const onLeave = () => { pointer.active = false; schedule(); };
    const onUp = (e: PointerEvent) => { if (e.pointerType !== 'mouse') onLeave(); };

    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('pointercancel', onLeave);
    canvas.addEventListener('pointerup', onUp);

    // Stop work while the portrait is scrolled away.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        if (!reduceMotion) video.play().catch(() => {});
        schedule();
      } else {
        video.pause();
      }
    });
    io.observe(canvas);

    const onReady = () => schedule();
    video.addEventListener('loadeddata', onReady);
    if (!reduceMotion) video.play().catch(() => {});
    schedule();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      video.removeEventListener('loadeddata', onReady);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointercancel', onLeave);
      canvas.removeEventListener('pointerup', onUp);
    };
  }, [size, color, spotlight]);

  return (
    <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
      {/* The source video is never shown directly; it feeds the canvas. */}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
      >
        {sources.map((s) => <source key={s.src} src={s.src} type={s.type} />)}
      </video>
      <canvas
        ref={canvasRef}
        style={{ width: `${size}px`, height: `${size}px`, display: 'block', cursor: 'crosshair', touchAction: 'none' }}
      />
    </div>
  );
}
