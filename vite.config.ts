
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3001,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      'e7991d75-5935-4129-a804-13e5d957325f-00-61mb5t03trec.pike.replit.dev',
      'mosaical.replit.app'
    ]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
