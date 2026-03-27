export interface Env {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  AUTH_SECRET: string;
  DB: any;
  APP_URL: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/auth/google") {
      return this.handleGoogleAuth(env);
    }

    if (url.pathname === "/auth/callback") {
      return this.handleCallback(request, env);
    }

    if (url.pathname === "/auth/logout") {
      return this.handleLogout(request, env);
    }

    if (url.pathname === "/api/me") {
      return this.handleMe(request, env);
    }

    return new Response("Not found", { status: 404 });
  }

  handleGoogleAuth(env: Env): Response {
    const state = crypto.randomUUID();
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: `${env.APP_URL}/auth/callback`,
      response_type: "code",
      scope: "openid email profile",
      state,
    });

    return Response.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
      302
    );
  }

  async handleCallback(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return Response.redirect(`${env.APP_URL}/?login_error=1`, 302);
    }

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${env.APP_URL}/auth/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return Response.redirect(`${env.APP_URL}/?login_error=1`, 302);
    }

    const tokens = await tokenRes.json();
    const accessToken = tokens.access_token;

    // Get user info from Google
    const userRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!userRes.ok) {
      return Response.redirect(`${env.APP_URL}/?login_error=1`, 302);
    }

    const googleUser = await userRes.json();

    // Upsert user in D1
    let isNew = false;
    try {
      const existingUser = await env.DB
        .prepare("SELECT * FROM users WHERE google_id = ?")
        .bind(googleUser.id)
        .first();

      if (!existingUser) {
        await env.DB
          .prepare(
            "INSERT INTO users (google_id, email, name, picture) VALUES (?, ?, ?, ?)"
          )
          .bind(googleUser.id, googleUser.email, googleUser.name, googleUser.picture || "")
          .run();
        isNew = true;
      } else {
        await env.DB
          .prepare(
            "UPDATE users SET email = ?, name = ?, picture = ? WHERE google_id = ?"
          )
          .bind(googleUser.email, googleUser.name, googleUser.picture || "", googleUser.id)
          .run();
      }
    } catch (e) {
      console.error("D1 error:", e);
    }

    // Return user data as JSON for frontend to store in localStorage
    const userData = {
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture || "",
      is_new: isNew,
    };

    // Return HTML that stores data in localStorage and redirects
    const html = `<!DOCTYPE html>
<html>
<head><title>Logging in...</title></head>
<body>
<script>
  localStorage.setItem('user', JSON.stringify(${JSON.stringify(userData)}));
  localStorage.setItem('session', '${state || crypto.randomUUID()}');
  window.location.href = '${env.APP_URL}/?login=success';
</script>
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  }

  async handleLogout(request: Request, env: Env): Promise<Response> {
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  async handleMe(request: Request, env: Env): Promise<Response> {
    return new Response(JSON.stringify({ authenticated: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }
};