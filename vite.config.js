import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // 빌드 결과물이 dist 폴더로 명확히 뽑히도록 지정
    outDir: 'dist',
  },
  server: {
    proxy: {
      '/aladin' : {
        target: 'https://www.aladin.co.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/aladin/, '')
      },
      'auth':{
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