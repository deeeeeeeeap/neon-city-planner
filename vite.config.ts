import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { cloudflare } from '@cloudflare/vite-plugin';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    watch: {
      // 排除 .wrangler 目录，避免 D1 SQLite WAL 文件变动触发页面热重载
      ignored: ['**/.wrangler/**'],
    },
  },
  plugins: [react(), tailwindcss(), cloudflare()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
