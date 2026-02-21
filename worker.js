export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Configuration
    const FRONTEND_ORIGIN = 'http://69.57.162.187'; // Your hosting server
    const BACKEND_ORIGIN = 'https://eukexpress.onrender.com'; // Your Render backend

    // BACKEND ROUTES - All API, docs, and health endpoints
    if (path.startsWith('/api/') || 
        path === '/docs' || 
        path === '/openapi.json' || 
        path === '/health') {
      
      const backendUrl = BACKEND_ORIGIN + path + url.search;
      console.log(`🔄 Backend Request: ${path}`);
      
      return fetch(backendUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
    }

    // FRONTEND ROUTES - Everything else
    try {
      const frontendUrl = FRONTEND_ORIGIN + path + url.search;
      console.log(`🌐 Frontend Request: ${path}`);
      
      const response = await fetch(frontendUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      // Handle 403 from frontend server
      if (response.status === 403) {
        return new Response(JSON.stringify({
          error: "Frontend server is blocking requests",
          message: "Please check your hosting server configuration",
          server: FRONTEND_ORIGIN,
          path: path
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return response;
    } catch (error) {
      return new Response(JSON.stringify({
        error: "Cannot connect to frontend server",
        message: error.message,
        server: FRONTEND_ORIGIN
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};