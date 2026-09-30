import { statSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: {
    rollupOptions: {
      // The app, and the landing page new visitors see first (src/welcome/).
      input: { app: resolve('index.html'), welcome: resolve('welcome/index.html') },
    },
  },
  define: {
    // The Echo lab shows the speech engine's size before it downloads it (src/echo/store.ts).
    __ECHO_ENGINE_BYTES__: statSync('node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.wasm').size,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // The app registers the service worker itself (src/main.tsx), so the landing page doesn't start precaching the
      // app and every Clip for someone who is only looking.
      injectRegister: false,
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Lingo Lite',
        short_name: 'Lingo Lite',
        description: 'The few hundred Korean expressions a traveller actually needs.',
        theme_color: '#5b3f8c',
        background_color: '#f6f5f9',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache everything, including every Clip, so the app works fully offline after the first load.
        globPatterns: ['**/*.{js,css,html,svg,png,mp3,webmanifest}'],
        // Echo's model and engine are downloaded only when the learner turns Echo on (ADR 0004).
        globIgnores: ['models/**', '**/*.wasm', '**/*.onnx'],
        navigateFallbackDenylist: [/^\/welcome/],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
  },
})
