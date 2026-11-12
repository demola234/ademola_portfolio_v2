// UI click sounds, synthesised with the Web Audio API (no audio files).
// A short tick plays when a link or button is pressed; the glass lead
// action gets a lower one. Visitors can mute it with the nav toggle
// ([data-sound-toggle]); the choice is remembered per browser.

const STORAGE_KEY = 'ui-sound';
const PRESSABLE = 'a[href], button, [role="button"], .seg, summary';

let ctx: AudioContext | null = null;
let enabled = readEnabled();

function readEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch {
    return true; // storage blocked: default on
  }
}

function saveEnabled(on: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
  } catch {
    /* not persisted */
  }
}

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
  if (!enabled) return;
  tick(target.closest('.glass') ? 520 : 1250);
}

function pressableFrom(event: Event): Element | null {
  const el = (event.target as Element | null)?.closest?.(PRESSABLE);
  if (!el || el.matches(':disabled, [aria-disabled="true"], [data-sound-toggle]')) return null;
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

// Mute toggle
function renderToggles() {
  document.querySelectorAll<HTMLButtonElement>('[data-sound-toggle]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(enabled));
    btn.setAttribute('aria-label', enabled ? 'Click sounds on — mute' : 'Click sounds off — unmute');
    btn.dataset.state = enabled ? 'on' : 'off';
  });
}

document.addEventListener('click', (event) => {
  const btn = (event.target as Element | null)?.closest?.('[data-sound-toggle]');
  if (!btn) return;
  enabled = !enabled;
  saveEnabled(enabled);
  renderToggles();
  if (enabled) tick(1250); // confirm that sound is back on
});

renderToggles();
