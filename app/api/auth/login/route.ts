import { NextResponse } from "next/server";
import { backend } from "../../../../lib/server-api";
import { sameOrigin } from "../../../../lib/environment.mjs";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: { message: "Origin not allowed" } }, { status: 403 });
  try {
    const response = await backend("/auth/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: await request.text() });
    const body = await response.json();
    const output = NextResponse.json(response.ok ? { data: { admin: body.data.admin } } : body, { status: response.status });
    const retryAfter = response.headers.get("retry-after");
    if (retryAfter) output.headers.set("Retry-After", retryAfter);
    if (response.ok) {
      output.cookies.set("homes_access", body.data.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 15 * 60 });
      output.cookies.set("homes_refresh", body.data.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 30 * 86400 });
    }
    return output;
  } catch { return NextResponse.json({ error: { message: "The API is unavailable. Try again shortly." } }, { status: 503 }); }
}
