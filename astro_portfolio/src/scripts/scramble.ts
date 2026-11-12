// Text scramble: letters churn through asterisks and symbols, then settle
// into the target text from left to right.

const GLYPHS = '****##%%++==@';
const FRAME_MS = 32;

export interface ScrambleOptions {
  /** ms between each letter settling */
  stagger?: number;
  /** ms each letter churns before it can settle */
  churn?: number;
}

const running = new WeakMap<HTMLElement, number>();

/** Animate `el`'s text to `to`. Resolves when the text has settled. */
export function scramble(el: HTMLElement, to: string, { stagger = 45, churn = 220 }: ScrambleOptions = {}): Promise<void> {
  const prev = running.get(el);
  if (prev) clearInterval(prev);

  const from = el.textContent ?? '';
  const length = Math.max(from.length, to.length);
  const start = performance.now();

  return new Promise((resolve) => {
    const id = window.setInterval(() => {
      const t = performance.now() - start;
      let out = '';
      let done = true;
      for (let i = 0; i < length; i++) {
        const settleAt = churn + i * stagger;
        const target = to[i] ?? '';
        if (t >= settleAt) {
          out += target;
        } else {
          done = false;
          // Spaces stay spaces so the words keep their shape while they churn.
          out += target === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      el.textContent = out;
      if (done) {
        clearInterval(id);
        running.delete(el);
        el.textContent = to;
        resolve();
      }
    }, FRAME_MS);
    running.set(el, id);
  });
}
