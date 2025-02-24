import { VitePWA } from 'vite-plugin-pwa'

export const pwaConfig = VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['icons/icon-128x128.png', 'icons/icon-192x192.png', 'icons/icon-300x300.png'],
  manifest: {
    name: 'World Domination',
    short_name: 'World Dom',
    description: 'A multiplayer strategy game of world conquest',
    theme_color: '#4471b4',
    icons: [
      {
        src: 'icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png'
      },
      {
        src: 'icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'icons/icon-300x300.png',
        sizes: '300x300',
        type: 'image/png'
      },

    ]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      }
    ]
  }
}) 