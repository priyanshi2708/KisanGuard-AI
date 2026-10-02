import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import app from './server.js';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'kisanguard-backend-middleware',
      configureServer(server) {
        server.middlewares.use(app);
      }
    }
  ],
  server: {
    port: 5173
  }
});
