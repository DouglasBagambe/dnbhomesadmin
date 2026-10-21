export class ApiError extends Error {
  readonly safeMessage = true;
}
export type ApiPage<T> = {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
};
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/admin${path}`, {
    ...init,
    headers: {
      ...(init.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...init.headers,
    },
    cache: "no-store",
  });
  if (response.status === 401 && typeof window !== "undefined") {
    window.location.assign(new URL("/login", window.location.origin).href);
    throw new Error("Session expired");
  }
  const body =
    response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok)
    throw response.status < 500
      ? new ApiError(
          [
            body?.error?.message,
            ...(Array.isArray(body?.error?.details)
              ? body.error.details.filter((v: unknown) => typeof v === "string")
              : []),
          ]
            .filter(Boolean)
            .join(" · ") || `Request failed (${response.status})`,
        )
      : new Error("The API is unavailable");
  return body as T;
}
export const queryString = (
  values: Record<string, string | number | undefined>,
) => {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const text = params.toString();
  return text ? `?${text}` : "";
};
