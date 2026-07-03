/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        bg: '#060606',
        accent: '#5afcfe',
        'accent-dim': 'rgba(90,252,254,0.12)',
        'accent-glow': 'rgba(90,252,254,0.25)',
        'text-primary': '#e7e7e7',
        'text-secondary': 'rgba(231,231,231,0.55)',
        border: 'rgba(255,255,255,0.08)',
        'border-hover': 'rgba(255,255,255,0.14)',
        'card-fill': 'rgba(255,255,255,0.015)',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'monospace'],
      },
      fontSize: {
        'hero': ['78px', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'page-h1': ['54px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
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
