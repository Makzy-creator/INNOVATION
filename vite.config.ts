import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'react-hot-toast',
      '@heroicons/react/24/outline',
      '@dfinity/agent',
      '@dfinity/principal',
      'date-fns',
      'socket.io-client',
      'react-player',
      'react-webcam',
      'react-markdown',
      'remark-gfm'
    ]
  },
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})