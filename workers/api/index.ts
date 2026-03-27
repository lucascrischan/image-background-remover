import remove from "./remove";
import auth from "./auth";

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Auth endpoints
    if (path.startsWith("/auth/") || path === "/api/me") {
      return auth.fetch(request, env);
    }

    // Image removal API
    if (path === "/api/remove" && request.method === "POST") {
      return remove.fetch(request, env);
    }

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    return new Response("Not found", { status: 404 });
  },
};