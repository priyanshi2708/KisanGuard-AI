import app from '../server.js';

export default function handler(req, res) {
  if (req.query && req.query.__path) {
    const subpath = req.query.__path;
    delete req.query.__path;
    const searchParams = new URLSearchParams();
    for (const [key, val] of Object.entries(req.query || {})) {
      if (Array.isArray(val)) {
        val.forEach(v => searchParams.append(key, v));
      } else if (val !== undefined && val !== null) {
        searchParams.append(key, val);
      }
    }
    const queryStr = searchParams.toString();
    const cleanPath = subpath.startsWith('/') ? subpath : `/${subpath}`;
    const apiPath = cleanPath.startsWith('/api') ? cleanPath : `/api${cleanPath}`;
    req.url = queryStr ? `${apiPath}?${queryStr}` : apiPath;
  } else if (!req.url || req.url === '/' || req.url === '/api' || req.url === '/api/') {
    const original = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'];
    if (original && original.startsWith('/api')) {
      req.url = original;
    }
  }
  return app(req, res);
}

