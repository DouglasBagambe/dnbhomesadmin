import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backend } from "../../../../lib/server-api";
type Context = { params: Promise<{ path: string[] }> };
type TokenResult = { accessToken: string; refreshToken: string };
async function rotate(refreshToken: string): Promise<TokenResult | null> { const response = await backend("/auth/admin/refresh", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken }) }); if (!response.ok) return null; const body = await response.json(); return { accessToken: body.data.accessToken, refreshToken: body.data.refreshToken }; }
async function proxy(request: Request, context: Context) {
  const store = await cookies(); let accessToken = store.get("homes_access")?.value; let refreshToken = store.get("homes_refresh")?.value; let rotated: TokenResult | null = null;
  if (!accessToken && refreshToken) { rotated = await rotate(refreshToken); accessToken = rotated?.accessToken; refreshToken = rotated?.refreshToken; }
  if (!accessToken) return NextResponse.json({ error: { message: "Authentication required" } }, { status: 401 });
  const { path } = await context.params; const incoming = new URL(request.url); const contentType = request.headers.get("content-type"); const requestBody = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();
  const call = (token: string) => backend(`/admin/${path.join("/")}${incoming.search}`, { method: request.method, headers: { Authorization: `Bearer ${token}`, ...(contentType ? { "Content-Type": contentType } : {}) }, body: requestBody });
  let backendResponse = await call(accessToken);
  if (backendResponse.status === 401 && refreshToken) { rotated = await rotate(refreshToken); if (rotated) { accessToken = rotated.accessToken; refreshToken = rotated.refreshToken; backendResponse = await call(accessToken); } }
  const response = new NextResponse(backendResponse.body, { status: backendResponse.status, headers: { "Content-Type": backendResponse.headers.get("content-type") || "application/json" } });
  if (rotated) { response.cookies.set("homes_access", rotated.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 15 * 60 }); response.cookies.set("homes_refresh", rotated.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 30 * 86400 }); }
  return response;
}
export const GET = proxy; export const POST = proxy; export const PATCH = proxy; export const DELETE = proxy;
