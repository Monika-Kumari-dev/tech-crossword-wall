import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backend = env.NETLIFY_DEV_BACKEND || 'https://gorgeous-sunflower-331fdb.netlify.app'
  return {
  plugins: [react()],
  server: {
    proxy: {
      '/.netlify/functions': {
        target: backend,
        changeOrigin: true,
        headers: { origin: new URL(backend).origin },
        configure(proxy) {
          // The local HTTP frontend uses the live backend's HttpOnly session.
          // Production responses keep Secure; only the local proxy adjusts it.
          proxy.on('proxyRes', (response) => {
            const cookies = response.headers['set-cookie']
            if (cookies) response.headers['set-cookie'] = cookies.map((cookie) => cookie.replace(/;\s*Secure\b/gi, ''))
          })
        },
      },
    },
  },
  }
})
