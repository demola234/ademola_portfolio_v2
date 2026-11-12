// Generates narrated audio, with per-word timings, for each article in src/content/writing
// using ElevenLabs.
//
//   npm run audio                  generate audio for new or changed articles
//   npm run audio -- <slug> ...    only these articles
//   npm run audio -- --force       regenerate even if unchanged (e.g. after a voice swap)
//   npm run audio -- --dry-run     print the narration text; no API calls
//
// Env (read from astro_portfolio/.env): ELEVENLABS_API_KEY, optional ELEVENLABS_VOICE_ID.
// Output: public/audio/<slug>.mp3, public/audio/<slug>.json (word timings for the
// reading highlight) and src/data/audio.json, which the article page reads.

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { toString } from 'mdast-util-to-string';
import YAML from 'yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WRITING_DIR = path.join(ROOT, 'src/content/writing');
const AUDIO_DIR = path.join(ROOT, 'public/audio');
const MANIFEST_PATH = path.join(ROOT, 'src/data/audio.json');

const FORMAT_VERSION = 2; // bump when output changes shape, to force regeneration
const MODEL_ID = 'eleven_multilingual_v2';
const OUTPUT_FORMAT = 'mp3_44100_128';
const MAX_CHUNK_CHARS = 4000; // stay well under the model's per-request limit
const DEFAULT_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'; // ElevenLabs premade voice "George"
const AUTHOR = 'Ademola Kolawole';

// The first cue explains where to find skipped content; repeats stay short.
const CODE_CUE = "There's a code example here. You'll find it in the written article.";
const CODE_CUE_AGAIN = 'Another code example here.';
const TABLE_CUE = "There's a table here. You'll find it in the written article.";

const args = process.argv.slice(2);
const force = args.includes('--force');
const dryRun = args.includes('--dry-run');
const onlySlugs = args.filter((a) => !a.startsWith('--'));

const apiKey = process.env.ELEVENLABS_API_KEY;
const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;

if (!dryRun && !apiKey) {
  console.error('ELEVENLABS_API_KEY is not set. Add it to astro_portfolio/.env.');
  process.exit(1);
}

// ── markdown → narration ──────────────────────────────────────────────────────
// A narration is a list of pieces: { text, content }. `content` pieces are words that
// appear in the article body and get highlighted; the rest (title, byline, cues) are
// spoken only.

function parseArticle(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const data = match ? YAML.parse(match[1]) : {};
  const body = match ? source.slice(match[0].length) : source;
  return { data, body };
}

function sentence(text) {
  const t = text.replace(/\s+/g, ' ').trim();
  if (!t) return '';
  return /[.!?:;…"”')]$/.test(t) ? t : `${t}.`;
}

function narrationPieces(markdown) {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  // Hard line breaks have no text of their own; without this, "ship.<br>You" reads as "ship.You".
  const breaksToSpaces = (node) => {
    if (node.type === 'break') Object.assign(node, { type: 'text', value: ' ' });
    node.children?.forEach(breaksToSpaces);
  };
  breaksToSpaces(tree);
  const pieces = [];
  let codeSeen = false;
  let lastWasCue = false;
  const say = (text, content) => {
    if (text) pieces.push({ text, content });
    lastWasCue = false;
  };
  const cue = (text) => {
    // Collapse back-to-back cues (e.g. several code blocks in a row).
    if (!lastWasCue) pieces.push({ text, content: false });
    lastWasCue = true;
  };

  const walk = (node) => {
    switch (node.type) {
      case 'heading':
      case 'paragraph':
        say(sentence(toString(node, { includeImageAlt: false, includeHtml: false })), true);
        break;
      case 'code':
        cue(codeSeen ? CODE_CUE_AGAIN : CODE_CUE);
        codeSeen = true;
        break;
      case 'table':
        cue(TABLE_CUE);
        break;
      case 'root':
      case 'list':
      case 'listItem':
      case 'blockquote':
        node.children.forEach(walk);
        break;
      default:
        // html, image, thematicBreak, definition, footnotes: not read aloud
        break;
    }
  };
  walk(tree);
  return pieces;
}

/** Packs pieces into request-sized chunks without splitting mid-sentence. */
function chunk(pieces) {
  const small = pieces.flatMap((p) =>
    p.text.length <= MAX_CHUNK_CHARS
      ? [p]
      : p.text
          .match(/[^.!?]+[.!?]+["”')]*\s*|[^.!?]+$/g)
          .map((s) => ({ text: s.trim(), content: p.content })),
  );
  const chunks = [];
  let current = [];
  let length = 0;
  for (const piece of small) {
    if (current.length && length + piece.text.length + 2 > MAX_CHUNK_CHARS) {
      chunks.push(current);
      current = [];
      length = 0;
    }
    current.push(piece);
    length += piece.text.length + 2;
  }
  if (current.length) chunks.push(current);
  return chunks;
}

const chunkText = (pieces) => pieces.map((p) => p.text).join('\n\n');

// ── word alignment ───────────────────────────────────────────────────────────

/** Same normalisation as the page script, so words match on both sides. */
const norm = (w) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

/**
 * Pairs up two word lists that should be nearly identical, tolerating small
 * differences by skipping ahead on either side. Returns [indexA, indexB] pairs.
 */
function alignWords(a, b, window = 8) {
  const pairs = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      pairs.push([i++, j++]);
      continue;
    }
    const ai = a.slice(i + 1, i + 1 + window).indexOf(b[j]);
    const bj = b.slice(j + 1, j + 1 + window).indexOf(a[i]);
    if (ai !== -1 && (bj === -1 || ai <= bj)) i += ai + 1;
    else if (bj !== -1) j += bj + 1;
    else pairs.push([i++, j++]); // substitution: same slot, different spelling
  }
  return pairs;
}

/** Start time (seconds) of each word in `pieces`, from ElevenLabs' character alignment. */
function wordTimes(pieces, alignment) {
  const words = pieces.flatMap((p) =>
    (p.text.match(/\S+/g) ?? []).map((w) => ({ w, content: p.content })),
  );
  // Words as ElevenLabs saw them, each with the start time of its first character.
  const spoken = [];
  let current = null;
  alignment.characters.forEach((ch, k) => {
    if (/\s/.test(ch)) {
      current = null;
    } else if (current) {
      current.w += ch;
    } else {
      current = { w: ch, t: alignment.character_start_times_seconds[k] };
      spoken.push(current);
    }
  });

  const keep = words.map((w, k) => ({ ...w, k })).filter((w) => norm(w.w));
  const spokenKept = spoken.filter((s) => norm(s.w));
  const times = new Map();
  for (const [x, y] of alignWords(keep.map((w) => norm(w.w)), spokenKept.map((s) => norm(s.w)))) {
    times.set(keep[x].k, spokenKept[y].t);
  }
  return words.map((w, k) => ({ ...w, t: times.get(k) }));
}

// ── ElevenLabs ────────────────────────────────────────────────────────────────

async function synthesize(text, previousText, nextText) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=${OUTPUT_FORMAT}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      // Context around the chunk keeps intonation continuous across chunk boundaries.
      previous_text: previousText?.slice(-500) || undefined,
      next_text: nextText?.slice(0, 500) || undefined,
    }),
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  if (!json.alignment?.characters) throw new Error('ElevenLabs response had no alignment data');
  return { audio: Buffer.from(json.audio_base64, 'base64'), alignment: json.alignment };
}

// ── mp3 joining ───────────────────────────────────────────────────────────────

const MPEG1_L3_KBPS = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const MPEG1_SAMPLE_RATES = [44100, 48000, 32000];
const SAMPLES_PER_FRAME = 1152;

/**
 * Keeps only the MPEG audio frames of one response. Each response starts with an
 * ID3 tag and an "Info" frame recording that response's own length; left in a
 * joined file, players read the first one and report the wrong total duration.
 */
function audioFrames(buf) {
  const frames = [];
  let sampleRate = 44100;
  let i = 0;
  while (i + 4 <= buf.length) {
    if (buf.toString('latin1', i, i + 3) === 'ID3' && i + 10 <= buf.length) {
      i += 10 + ((buf[i + 6] << 21) | (buf[i + 7] << 14) | (buf[i + 8] << 7) | buf[i + 9]);
      continue;
    }
    const isMpeg1L3 = buf[i] === 0xff && (buf[i + 1] & 0xfe) === 0xfa;
    const kbps = MPEG1_L3_KBPS[buf[i + 2] >> 4];
    const rate = MPEG1_SAMPLE_RATES[(buf[i + 2] >> 2) & 0x3];
    if (!isMpeg1L3 || !kbps || !rate) {
      i++; // not a frame header (e.g. trailing ID3v1 tag); resync
      continue;
    }
    const len = Math.floor((144 * kbps * 1000) / rate) + ((buf[i + 2] >> 1) & 1);
    const frame = buf.subarray(i, i + len);
    const head = frame.toString('latin1', 0, 48);
    if (!head.includes('Info') && !head.includes('Xing')) frames.push(frame);
    sampleRate = rate;
    i += len;
  }
  return { frames, seconds: (frames.length * SAMPLES_PER_FRAME) / sampleRate };
}

// ── main ──────────────────────────────────────────────────────────────────────

async function loadManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return {};
    throw err;
  }
}

async function saveManifest(manifest) {
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(MANIFEST_PATH, `${JSON.stringify(sorted, null, 2)}\n`);
}

async function main() {
  const files = (await readdir(WRITING_DIR)).filter((f) => f.endsWith('.md')).sort();
  const allSlugs = files.map((f) => f.replace(/\.md$/, ''));
  const unknown = onlySlugs.filter((s) => !allSlugs.includes(s));
  if (unknown.length) {
    console.error(`Unknown article slug(s): ${unknown.join(', ')}`);
    process.exit(1);
  }

  const manifest = await loadManifest();

  // Drop audio for articles that no longer exist.
  if (!dryRun) {
    for (const slug of Object.keys(manifest)) {
      if (!allSlugs.includes(slug)) {
        await rm(path.join(AUDIO_DIR, `${slug}.mp3`), { force: true });
        await rm(path.join(AUDIO_DIR, `${slug}.json`), { force: true });
        delete manifest[slug];
        console.log(`removed  ${slug} (article deleted)`);
      }
    }
  }

  await mkdir(AUDIO_DIR, { recursive: true });
  let totalChars = 0;

  for (const slug of onlySlugs.length ? onlySlugs : allSlugs) {
    const { data, body } = parseArticle(await readFile(path.join(WRITING_DIR, `${slug}.md`), 'utf8'));
    const pieces = [
      { text: sentence(data.title ?? slug), content: false },
      { text: `By ${AUTHOR}.`, content: false },
      ...narrationPieces(body),
    ];
    const chunks = chunk(pieces);
    const texts = chunks.map(chunkText);
    const text = texts.join('\n\n');
    const hash = createHash('sha256')
      .update(`${FORMAT_VERSION}\0${voiceId}\0${MODEL_ID}\0${text}`)
      .digest('hex')
      .slice(0, 16);
    const file = `/audio/${slug}.mp3`;
    const timings = `/audio/${slug}.json`;

    if (dryRun) {
      console.log(`\n===== ${slug} (${text.length} chars, ${chunks.length} chunk(s)) =====\n${text}`);
      totalChars += text.length;
      continue;
    }

    if (!force && manifest[slug]?.hash === hash && existsSync(path.join(ROOT, 'public', file))) {
      console.log(`skip     ${slug} (unchanged)`);
      continue;
    }

    console.log(`generate ${slug} (${text.length} chars, ${chunks.length} chunk(s))`);
    const frames = [];
    const words = [];
    const starts = [];
    let offset = 0; // seconds of audio before the current chunk
    for (let i = 0; i < chunks.length; i++) {
      const { audio, alignment } = await synthesize(texts[i], texts[i - 1], texts[i + 1]);
      const part = audioFrames(audio);
      for (const w of wordTimes(chunks[i], alignment)) {
        if (w.content && w.t !== undefined && norm(w.w)) {
          words.push(w.w);
          starts.push(Math.round((offset + w.t) * 1000));
        }
      }
      frames.push(...part.frames);
      offset += part.seconds;
    }

    await writeFile(path.join(ROOT, 'public', file), Buffer.concat(frames));
    // `t` holds each word's start time in milliseconds.
    await writeFile(path.join(ROOT, 'public', timings), JSON.stringify({ words, t: starts }));
    manifest[slug] = { file, timings, hash, durationSec: Math.round(offset) };
    await saveManifest(manifest); // save after each article so a failure keeps prior progress
    totalChars += text.length;
  }

  if (!dryRun) await saveManifest(manifest);
  console.log(`\n${dryRun ? 'Would send' : 'Sent'} ${totalChars.toLocaleString()} characters to ElevenLabs.`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
