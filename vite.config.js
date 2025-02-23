import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        chat: './src/chat.js'
      },
      output: {
        entryFileNames: '[name].[hash].js',
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        format: 'es',
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['react-hot-toast', 'react-colorful', '@heroicons/react'],
          supabase: ['@supabase/supabase-js'],
          ai: ['@google/generative-ai']
        }
      }
    },
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true
      }
    },
    sourcemap: process.env.NODE_ENV !== 'production',
    cssMinify: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true
  }
});