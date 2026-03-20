import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { success: false, error: "INVALID_FORMAT" },
        { status: 400 }
      );
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API_NOT_CONFIGURED" },
        { status: 500 }
      );
    }

    // Extract base64 data (remove data:image/...;base64, prefix)
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

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
        // Non-JSON error response
      }

      // Check for rate limit
      if (response.status === 402 || errorCode === "rate_limit_exceeded") {
        return NextResponse.json(
          { success: false, error: "RATE_LIMITED" },
          { status: 402 }
        );
      }

      return NextResponse.json(
        { success: false, error: errorCode },
        { status: response.status }
      );
    }

    const resultBuffer = await response.arrayBuffer();
    const resultBase64 = Buffer.from(resultBuffer).toString("base64");
    const resultDataUrl = `data:image/png;base64,${resultBase64}`;

    return NextResponse.json({
      success: true,
      result: resultDataUrl,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "UNKNOWN" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
