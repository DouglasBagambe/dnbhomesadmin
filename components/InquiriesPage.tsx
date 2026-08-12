/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
"use client";
import { useEffect, useState } from "react";
import { api, ApiPage, queryString } from "../lib/api";
import { Inquiry } from "../lib/types";
import { PageHeader, State } from "./PageState";
const statuses = ["new", "in_progress", "resolved", "spam"];
export function InquiriesPage() {
  const [result, setResult] = useState<ApiPage<Inquiry>>(); const [kind, setKind] = useState(""); const [status, setStatus] = useState(""); const [q, setQ] = useState(""); const [error, setError] = useState("");
  const load = () => { setError(""); return api<ApiPage<Inquiry>>(`/inquiries${queryString({ kind, status, q })}`).then(setResult).catch((e) => setError(e.message)); };
  useEffect(() => { void load(); }, [kind, status]);
  async function change(item: Inquiry, next: string) { try { await api(`/inquiries/${item._id}`, { method: "PATCH", body: JSON.stringify({ status: next }) }); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Update failed"); } }
  return <><PageHeader eyebrow="Customer operations" title="Inquiries" description="Contact messages and property onboarding leads submitted through the public website."/><div className="toolbar"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email, phone or location"/><select value={kind} onChange={(e) => setKind(e.target.value)}><option value="">All types</option><option value="contact">Contact</option><option value="listing">Property onboarding</option></select><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{statuses.map((value) => <option key={value}>{value}</option>)}</select><button onClick={() => void load()}>Search</button></div>{error && <State tone="error">{error}</State>}<div className="card-list inquiry-list">{result?.data.map((item) => <article key={item._id}><div><strong>{item.name}</strong><span>{item.kind === "listing" ? `${item.role || "Property lead"} · ${item.propertyType || "Property"} · ${item.location || "Location not provided"}` : item.subject}</span><span>{[item.email, item.phone].filter(Boolean).join(" · ")}</span><p>{item.message}</p><small>{new Date(item.createdAt).toLocaleString()}</small></div><select aria-label={`Status for inquiry from ${item.name}`} value={item.status} onChange={(e) => void change(item, e.target.value)}>{statuses.map((value) => <option key={value}>{value}</option>)}</select></article>)}</div>{result?.data.length === 0 && <State>No inquiries match these filters.</State>}</>;
}
