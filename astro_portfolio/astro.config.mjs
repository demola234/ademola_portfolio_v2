// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/static';

export default defineConfig({
  site: 'https://demola.dev',
  output: 'static',
  adapter: vercel(),
  integrations: [react(), tailwind()],
});
