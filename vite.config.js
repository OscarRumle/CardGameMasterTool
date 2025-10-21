import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for assets (allows opening index.html directly)
  server: {
    host: '0.0.0.0', // Expose to all network interfaces
    port: 5173,
    strictPort: true
  }
})
