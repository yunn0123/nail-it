import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), // 使用 @ 作為 src 目錄的別名
    }
  },
  build: {
    assetsInlineLimit: 4096, // 小於 4kb 的圖片會被轉為 base64 內嵌
    chunkSizeWarningLimit: 1000, // 提高塊大小警告限制
    sourcemap: false, // 生產環境不需要 sourcemap
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'], // 將第三方庫打包到單獨的塊中
        },
        assetFileNames: 'assets/[name]-[hash][extname]', // 資源文件命名方式
      }
    }
  },
  server: {
    port: 3000, // 開發服務器端口
    host: true,  // 監聽所有網路介面
  },
  define: {
    'process.env.BACKEND_API_URL': JSON.stringify(process.env.VITE_BACKEND_API_URL || process.env.BACKEND_API_URL),
    'process.env.VERSION_TAG': JSON.stringify(process.env.VITE_VERSION_TAG || process.env.VERSION_TAG)
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  }
  
})
