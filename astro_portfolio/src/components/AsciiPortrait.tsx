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

    const drawAscii = () => {
      sampleCtx.drawImage(video, 0, 0, cols, rows);
      const px = sampleCtx.getImageData(0, 0, cols, rows).data;
      ctx.clearRect(0, 0, size, size);
      ctx.font = `${FONT_SIZE}px ui-monospace, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = (r * cols + c) * 4;
          const brightness = (px[i] + px[i + 1] + px[i + 2]) / (3 * 255);
          const ch = CHARS[Math.floor(brightness * (CHARS.length - 1))];
          if (ch === ' ') continue;
          ctx.fillStyle = `rgba(${color}, ${(0.35 + brightness * 0.65).toFixed(2)})`;
          ctx.fillText(ch, c * COL_GAP + COL_GAP / 2, r * ROW_GAP + ROW_GAP / 2);
        }
      }
    };

    const drawSpotlight = () => {
      if (pointer.strength < 0.01) return;
      spotCtx.globalCompositeOperation = 'source-over';
      spotCtx.clearRect(0, 0, size, size);
      spotCtx.drawImage(video, 0, 0, size, size);
      spotCtx.globalCompositeOperation = 'destination-in';
      const g = spotCtx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, spotlight);
      g.addColorStop(0, `rgba(0,0,0,${pointer.strength})`);
      g.addColorStop(0.65, `rgba(0,0,0,${pointer.strength})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      spotCtx.fillStyle = g;
      spotCtx.fillRect(0, 0, size, size);
      ctx.drawImage(spot, 0, 0, size, size);
    };

    const frame = () => {
      raf = 0;
      if (!visible || video.readyState < 2) return schedule();
      pointer.x += (pointer.tx - pointer.x) * 0.2;
      pointer.y += (pointer.ty - pointer.y) * 0.2;
      pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * 0.18;
      drawAscii();
      drawSpotlight();
      schedule();
    };
    const schedule = () => {
      // A still portrait (reduced motion) only needs redrawing while the spotlight moves or fades.
      const needed = !reduceMotion || pointer.active || pointer.strength > 0.01 || video.readyState < 2;
      if (!raf && needed) raf = requestAnimationFrame(frame);
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
