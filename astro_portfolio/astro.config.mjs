// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/static';

// Glaze: colour means status, so code is set in ink at its steps (no hues).
const glazeInk = {
  name: 'glaze-ink',
  type: 'dark',
  colors: { 'editor.background': '#161616', 'editor.foreground': '#e9e9e8' },
  tokenColors: [
    { settings: { foreground: '#e9e9e8' } },
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#7f7f7e', fontStyle: 'italic' } },
    { scope: ['keyword', 'storage', 'storage.type', 'storage.modifier'], settings: { foreground: '#ffffff' } },
    { scope: ['string', 'string.quoted', 'string.template'], settings: { foreground: '#b3b3b2' } },
    { scope: ['constant', 'constant.numeric', 'constant.language', 'support.constant'], settings: { foreground: '#d2d2d1' } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call'], settings: { foreground: '#ffffff' } },
    { scope: ['entity.name.type', 'entity.name.class', 'support.type', 'support.class'], settings: { foreground: '#dcdcdb' } },
    { scope: ['variable', 'variable.parameter', 'variable.other'], settings: { foreground: '#e9e9e8' } },
    { scope: ['punctuation', 'meta.brace', 'keyword.operator'], settings: { foreground: '#9a9a99' } },
  ],
};

export default defineConfig({
  site: 'https://demola.dev',
  output: 'static',
  adapter: vercel(),
  integrations: [react(), tailwind()],
  markdown: {
    shikiConfig: { theme: glazeInk },
  },
});
