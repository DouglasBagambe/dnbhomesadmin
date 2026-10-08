"use client";
import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { api } from "../lib/api";
import { AdminUser } from "../lib/types";
const SessionContext = createContext<AdminUser | null>(null);
export const useSession = () => useContext(SessionContext);
export function SessionProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const pending = useRef<Promise<{ data: AdminUser }> | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    pending.current ??= api<{ data: AdminUser }>("/session");
    pending.current.then(({ data }) => { if (active) setAdmin(data); }).catch((e) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, []);
  if (error) return <div role="alert">{error} <button onClick={() => window.location.reload()}>Retry</button></div>;
  if (!admin) return <p>Checking your session…</p>;
  return <SessionContext.Provider value={admin}>{children}</SessionContext.Provider>;
}
