// @ts-check
import { defineConfig, fontProviders } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://yurikonrails.github.io',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Manrope',
      cssVariable: '--font-heading',
      weights: [300, 400, 500, 600, 700, 800],
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
      name: 'IBM Plex Mono',
      cssVariable: '--font-mono',
      weights: [400],
      subsets: ['latin', 'cyrillic'],
      display: 'swap',
    },
  ],
})
