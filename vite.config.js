import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 启用 gzip 压缩
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 Three.js 相关库分离到单独的 chunk
          'three': ['three'],
          'react-three': ['@react-three/fiber', '@react-three/drei'],
          // 将 React 相关库分离
          'react-vendor': ['react', 'react-dom']
        }
      }
    },
    // 启用源码映射用于调试
    sourcemap: false,
    // 压缩代码
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除 console
        drop_debugger: true
      }
    }
  },
  // 优化开发服务器
  server: {
    host: true,
    port: 5173
  },
  // 预构建优化
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei']
  }
})
