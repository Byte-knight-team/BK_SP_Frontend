import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
  },
  test: {
    globals: true,           
    environment: 'jsdom',    
    setupFiles: './src/setupTests.js', 
  },
})