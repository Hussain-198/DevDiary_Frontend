import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://dd-backend-m1ic.onrender.com/', // your backend server
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
