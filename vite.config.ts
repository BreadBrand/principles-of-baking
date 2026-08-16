/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['bread_favicon.svg', 'logo_favicon.svg'],
        manifest: {
          name: 'The Bread Machine',
          short_name: 'Bread Machine',
          description: 'Convert dry-yeast bread recipes to sourdough, scale by baker\'s percentage, and manage bake-day scheduling.',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/icons/icon-512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
          // react-router client routes (e.g. /tab, /learn/step/2) are not real
          // files — without this, reloading one of those routes offline gets a
          // network error instead of falling back to the cached SPA shell.
          navigateFallback: '/index.html',
          // Never let the SPA-fallback rewrite an API call into index.html;
          // /api/* must fail through to UseFetchRecipes' own cache fallback.
          navigateFallbackDenylist: [/^\/api\//],
        },
      }),
    ],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL ?? 'http://localhost:8080',
          changeOrigin: true,
        },
        '/static': {
          target: 'https://bread-machine.dev',
          changeOrigin: true,
          secure: true,
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
    },
  }
})
