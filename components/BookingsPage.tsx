/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect, useState } from "react";
import { api, ApiPage, queryString } from "../lib/api";
import { Booking } from "../lib/types";
import { PageHeader, State } from "./PageState";
const statuses = ["pending", "confirmed", "completed", "cancelled", "rejected", "no_show"];
export function BookingsPage() {
  const [result, setResult] = useState<ApiPage<Booking>>(); const [status, setStatus] = useState(""); const [q, setQ] = useState(""); const [error, setError] = useState("");
  const load = () => api<ApiPage<Booking>>(`/bookings${queryString({ status, q })}`).then(setResult).catch((e) => setError(e.message));
  useEffect(() => { void load(); }, [status]);
  async function change(item: Booking, next: string) { try { await api(`/bookings/${item._id}/status`, { method: "PATCH", body: JSON.stringify({ status: next }) }); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Update failed"); } }
  return <><PageHeader eyebrow="Viewing operations" title="Viewing requests" description="Requests remain pending until an administrator or agent confirms them."/><div className="toolbar"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Reference, guest, email or phone"/><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{statuses.map((v) => <option key={v}>{v}</option>)}</select><button onClick={() => void load()}>Search</button></div>{error && <State tone="error">{error}</State>}<div className="card-list">{result?.data.map((item) => <article key={item._id}><div><strong>{item.reference}</strong><span>{item.property?.title || "Unknown property"} · {new Date(item.scheduledAt).toLocaleString()}</span><span>{item.guestName} · {item.guestEmail} · {item.guestPhone}</span></div><select aria-label={`Status for ${item.reference}`} value={item.status} onChange={(e) => void change(item, e.target.value)}>{statuses.map((v) => <option key={v}>{v}</option>)}</select></article>)}</div>{result?.data.length === 0 && <State>No viewing requests match these filters.</State>}</>;
}
