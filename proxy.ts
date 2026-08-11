import { NextRequest, NextResponse } from "next/server";
export function proxy(request: NextRequest) { const authenticated = Boolean(request.cookies.get("homes_access") || request.cookies.get("homes_refresh")); if (!authenticated) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(request.nextUrl.pathname)}`, request.url)); return NextResponse.next(); }
export const config = { matcher: ["/dashboard/:path*", "/properties/:path*", "/agents/:path*", "/agencies/:path*", "/bookings/:path*", "/audit/:path*", "/admins/:path*", "/settings/:path*"] };
