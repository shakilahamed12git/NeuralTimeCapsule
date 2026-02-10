import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/neural-analysis': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true
      },
      '/flask-api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/flask-api/, '/api')
      },
      '/api': 'http://localhost:5174',
      '/uploads': 'http://localhost:5174'
    }
  }
})
