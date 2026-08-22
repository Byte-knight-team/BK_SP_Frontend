import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  define: {
    global: 'globalThis',
  },
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react'
            }
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts'
            }
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'vendor-pdf'
            }
            if (id.includes('@stripe')) {
              return 'vendor-stripe'
            }
            if (id.includes('lucide-react') || id.includes('@remixicon') || id.includes('react-toastify')) {
              return 'vendor-icons-ui'
            }
            if (id.includes('@tanstack') || id.includes('axios')) {
              return 'vendor-data'
            }
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  }
})
