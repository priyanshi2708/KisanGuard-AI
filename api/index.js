import app from '../server.js';

export default function handler(req, res) {
  const original = req.headers['x-matched-path'] || req.headers['x-now-route-matches'] || req.headers['x-forwarded-uri'];
  if (original && original.startsWith('/api') && (req.url === '/api' || req.url === '/')) {
    req.url = original;
  }
  return app(req, res);
}
