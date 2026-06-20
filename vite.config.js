import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_BACKEND_URL?.replace(/\/$/, '')

  if (!backendUrl) {
    throw new Error(
      'VITE_BACKEND_URL is required. Copy .env.example to .env and set your backend URL.'
    )
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/media': {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
  }
})
