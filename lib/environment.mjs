export function validateEnvironment(values) {
  if (values.HOMES_BUILD_PROFILE && !["local", "production"].includes(values.HOMES_BUILD_PROFILE)) throw new Error("Invalid HOMES_BUILD_PROFILE");
  if (values.NODE_ENV !== "production") return;
  let url;
  try { url = new URL(values.API_BASE_URL || ""); } catch { throw new Error("API_BASE_URL is required in production"); }
  const local = values.HOMES_BUILD_PROFILE === "local";
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  const reserved = !url.hostname.includes(".") || /\.(local|localhost|invalid|test|example)$/.test(url.hostname) || /(^|\.)example\.(com|net|org)$/.test(url.hostname) || /^[\d.]+$/.test(url.hostname) || url.hostname.includes(":");
  if ((local ? !loopback || !["http:", "https:"].includes(url.protocol) : url.protocol !== "https:" || reserved) || url.username || url.password || url.search || url.hash) throw new Error("API_BASE_URL must be public HTTPS (or loopback with explicit HOMES_BUILD_PROFILE=local)");
}
export function sameOrigin(request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}
