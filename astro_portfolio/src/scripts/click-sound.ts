// UI click sounds, synthesised with the Web Audio API (no audio files).
// A short tick plays when a link or button is pressed; the glass lead
// action gets a lower one.

const PRESSABLE = 'a[href], button, [role="button"], .seg, summary';

let ctx: AudioContext | null = null;

/** A ~40ms tick: a sine blip with a fast exponential decay. */
function tick(frequency: number) {
  // The AudioContext is created on the first press, which counts as the user gesture browsers require.
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, now);
  osc.frequency.exponentialRampToValueAtTime(frequency * 0.55, now + 0.04);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.06, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}

function play(target: Element) {
  tick(target.closest('.glass') ? 520 : 1250);
}

function pressableFrom(event: Event): Element | null {
  const el = (event.target as Element | null)?.closest?.(PRESSABLE);
  if (!el || el.matches(':disabled, [aria-disabled="true"]')) return null;
  return el;
}

// Pointer presses tick on pointerdown so the sound lands with the finger, not after it.
document.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  const el = pressableFrom(event);
  if (el) play(el);
}, { capture: true, passive: true });

// Keyboard activation (Enter/Space) fires a click with detail 0.
document.addEventListener('click', (event) => {
  if ((event as MouseEvent).detail !== 0) return;
  const el = pressableFrom(event);
  if (el) play(el);
}, { capture: true });
