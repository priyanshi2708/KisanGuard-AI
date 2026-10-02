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
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/api')) {
            return app(req, res, next);
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 5173
  }
});
