// @ts-check
import { defineConfig, fontProviders } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'

import react from '@astrojs/react';

export default defineConfig({
  site: 'https://yurikonrails.github.io',
  integrations: [sitemap(), react()],
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Prata',
      cssVariable: '--font-heading',
      weights: [400],
      subsets: ['latin', 'cyrillic'],
      display: 'swap',
    },
    {
      provider: fontProviders.google(),
      name: 'Onest',
      cssVariable: '--font-ui',
      weights: [400, 500, 600],
      subsets: ['latin', 'cyrillic'],
      display: 'swap',
    },
    {
      provider: fontProviders.google(),
      name: 'Spectral',
      cssVariable: '--font-body',
      weights: [400, 600],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'cyrillic'],
      display: 'swap',
    },
    {
      provider: fontProviders.google(),
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      weights: [400],
      subsets: ['latin', 'cyrillic'],
      display: 'swap',
    },
  ],
})