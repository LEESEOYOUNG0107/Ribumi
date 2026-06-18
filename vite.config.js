import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
  build: {
    outDir: 'dist',
    // 빌드 시 정적 자산들이 올바르게 맵핑되도록 설정
    assetsDir: 'assets',
  },
  server: {
    proxy: {
      '/aladin': {
        target: 'https://www.aladin.co.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/aladin/, '')
      },
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/kopis': { 
        target: 'https://kopis.or.kr',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/kopis/, '')
      }
    }
  }
})