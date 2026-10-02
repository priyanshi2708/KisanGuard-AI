import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'kisanguard-backend-middleware',
      async configureServer(server) {
        const { default: app } = await import('./server.js');
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

