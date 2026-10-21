export function mediaUploadUrl(apiBaseUrl) {
  const url = new URL(apiBaseUrl);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname.replace(/\/+$/, "") !== "/api/v1"
  )
    throw new Error("API_BASE_URL must end in /api/v1");
  url.pathname = "/api/v1/media/uploads";
  return url.toString();
}
