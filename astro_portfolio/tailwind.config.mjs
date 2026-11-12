/** @type {import('tailwindcss').Config} */
// Colours and fonts mirror the Glaze tokens in src/styles/global.css.
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        page: '#0c0c0c',
        shell: '#161616',
        paper: '#1f1f1f',
        field: '#2a2a2a',
        'text-1': '#f4f4f3',
        'text-2': 'rgb(244 244 243 / 0.6)',
        'text-3': 'rgb(244 244 243 / 0.45)',
        'line-faint': 'rgb(244 244 243 / 0.06)',
        line: 'rgb(244 244 243 / 0.10)',
        'line-strong': 'rgb(244 244 243 / 0.45)',
        ok: '#3fbf75',
        warn: '#f0a531',
        fail: '#ec6f5a',
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      fontSize: {
        hero: ['78px', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'page-h1': ['54px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        pill: '999px',
        shell: '14px',
        panel: '11px',
        overlay: '10px',
        tag: '6px',
      },
      maxWidth: {
        site: '1120px',
      },
      backgroundSize: {
        grid: '64px 64px',
      },
    },
  },
  plugins: [],
};
