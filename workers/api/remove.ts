export interface Env {
  REMOVE_BG_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const { image } = await request.json();

      if (!image) {
        return Response.json(
          { success: false, error: "INVALID_FORMAT" },
          { status: 400 }
        );
      }

      const apiKey = env.REMOVE_BG_API_KEY;
      if (!apiKey) {
        return Response.json(
          { success: false, error: "API_NOT_CONFIGURED" },
          { status: 500 }
        );
      }

      // Extract base64 data
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

      const formData = new FormData();
      formData.append("image_file", new Blob([imageBuffer]), "image.png");
      formData.append("size", "auto");
      formData.append("format", "png");

      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        let errorCode = "API_ERROR";
        try {
          const errorData = await response.json();
          errorCode = errorData.errors?.[0]?.code || "API_ERROR";
        } catch {
          // Non-JSON error
        }

        if (response.status === 402 || errorCode === "rate_limit_exceeded") {
          return Response.json(
            { success: false, error: "RATE_LIMITED" },
            { status: 402 }
          );
        }

        return Response.json(
          { success: false, error: errorCode },
          { status: response.status }
        );
      }

      const resultBuffer = await response.arrayBuffer();
      const resultBase64 = btoa(
        Array.from(new Uint8Array(resultBuffer))
          .map((b) => String.fromCharCode(b))
          .join("")
      );
      const resultDataUrl = `data:image/png;base64,${resultBase64}`;

      return Response.json({
        success: true,
        result: resultDataUrl,
      });
    } catch {
      return Response.json(
        { success: false, error: "UNKNOWN" },
        { status: 500 }
      );
    }
  },
};
