import { validateEnvironment } from "./environment.mjs";
const base = () => { validateEnvironment(process.env); return (process.env.API_BASE_URL || (process.env.NODE_ENV === "production" ? "" : "http://127.0.0.1:3000/api/v1")).replace(/\/+$/, ""); };
export async function backend(path: string, init: RequestInit = {}) { return fetch(`${base()}${path}`, { ...init, signal: init.signal ?? AbortSignal.timeout(15_000), cache: "no-store" }); }
