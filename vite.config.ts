import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:3000')
  },
  plugins: [inspectAttr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
