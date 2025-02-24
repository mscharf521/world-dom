import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { pwaConfig } from './vite-pwa-config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pwaConfig],
  define: {
    // This enables global variables if needed
    global: {},
  },
  envPrefix: 'VITE_'
})
