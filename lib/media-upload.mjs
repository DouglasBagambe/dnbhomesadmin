export class MediaUploadError extends Error {
  safeMessage = true;
}
const safeCodes = new Set([
  "STORAGE_UNAVAILABLE",
  "STORAGE_NOT_DURABLE",
  "IMAGE_TOO_LARGE",
  "MEDIA_TOO_LARGE",
  "INVALID_MEDIA_TYPE",
  "INVALID_MEDIA_CONTENT",
  "BATCH_TOO_LARGE",
  "FILE_REQUIRED",
  "CORS_DENIED",
  "UPLOAD_AUTH_EXPIRED",
  "UPLOAD_AUTH_UNAVAILABLE",
  "UPLOAD_ORIGIN_DENIED",
]);
export async function uploadMediaBatch(
  files,
  { issueTicket, fetcher = fetch, timeoutMs = 120000 },
) {
  let ticket;
  try {
    ticket = await issueTicket();
  } catch (e) {
    throw new MediaUploadError(
      e?.safeMessage
        ? e.message
        : "Upload authorization could not be obtained. Please retry.",
    );
  }
  const body = new FormData();
  files.forEach((file) => body.append("files", file));
  let response;
  try {
    response = await fetcher(ticket.uploadUrl, {
      method: "POST",
      headers: { "X-Media-Upload-Token": ticket.token },
      body,
      credentials: "omit",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    throw new MediaUploadError(
      e?.name === "TimeoutError" || e?.name === "AbortError"
        ? "Upload timed out. Please retry the remaining files."
        : "Cannot reach the media upload server. Check your network or DNS connection, then retry.",
    );
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (
      safeCodes.has(payload?.error?.code) &&
      typeof payload.error.message === "string"
    )
      throw new MediaUploadError(payload.error.message);
    if (response.status === 401)
      throw new MediaUploadError(
        "Upload authorization expired or is unavailable. Please retry.",
      );
    if (response.status === 403)
      throw new MediaUploadError(
        "Upload origin is not allowed. Ask an administrator to check the exact Admin origin.",
      );
    if (response.status === 503)
      throw new MediaUploadError(
        "Media storage is temporarily unavailable. Please retry.",
      );
    throw new MediaUploadError(
      `Upload failed (${response.status}). Retry the remaining files.`,
    );
  }
  if (!Array.isArray(payload?.data) || payload.data.length !== files.length)
    throw new MediaUploadError(
      "The upload returned an incomplete batch. Check the media before retrying.",
    );
  return payload.data;
}
