import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'lucide-react', 'firebase/app', 'firebase/auth'],
    },
    server: {
      allowedHosts: ['crm.makprojetosmake.com.br', '.makprojetosmake.com.br', 'localhost'],
      host: '0.0.0.0',
      port: 3000,
      hmr: false,
      watch: null,
    },
  };
});
