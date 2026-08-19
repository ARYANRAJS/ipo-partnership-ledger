import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-v3-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-v3-${Date.now()}.js`,
        assetFileNames: `assets/[name]-v3-[hash].[ext]`
      }
    }
  },
  server: {
    port: 3000,
    open: false
  }
})
