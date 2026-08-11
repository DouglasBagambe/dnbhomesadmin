const base = () => process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3000/api/v1";
export async function backend(path: string, init: RequestInit = {}) { return fetch(`${base()}${path}`, { ...init, cache: "no-store" }); }
