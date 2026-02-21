// Cloudflare Worker - EukExpress Router
// Routes: /api/* -> Render Backend
// Routes: /* -> Frontend Hosting

const FRONTEND_ORIGIN = 'http://69.57.162.187'; // Your hosting server
const BACKEND_ORIGIN = 'https://eukexpress.onrender.com'; // Your Render backend

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // API requests go to Render
    if (path.startsWith('/api/')) {
      return fetch(BACKEND_ORIGIN + path + url.search, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
    }

    // Everything else goes to frontend hosting
    return fetch(FRONTEND_ORIGIN + path + url.search, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
  }
};
