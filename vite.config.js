import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for assets (allows opening index.html directly)
  server: {
    host: '0.0.0.0', // Expose to all network interfaces
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173,
      host: 'localhost'
    },
    watch: {
      usePolling: true // Enable polling for file changes (useful in some environments)
    }
  }
})
