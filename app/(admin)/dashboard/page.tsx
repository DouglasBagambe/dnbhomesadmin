/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { friendlyError } from "../../../lib/presentation.mjs";
import { useSession } from "../../../components/Session";
import { api } from "../../../lib/api";
import { PageHeader, State } from "../../../components/PageState";
type Summary = {
  properties: number;
  published: number;
  pendingBookings: number;
  agents: number;
  newInquiries: number;
};
export default function Dashboard() {
  const admin = useSession();
  const [data, setData] = useState<Summary>();
  const [error, setError] = useState("");
  const load = () => {
    setError("");
    api<{ data: Summary }>("/dashboard")
      .then((v) => setData(v.data))
      .catch((e) => setError(friendlyError(e)));
  };
  useEffect(load, []);
  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Dashboard"
        description="A focused view of current inventory, viewing requests and inquiry workload."
      />
      {error && (
        <State tone="error">
          {error} <button onClick={load}>Retry</button>
        </State>
      )}
      <section className="metric-grid">
        {[
          ["Listings", data?.properties],
          ["Published", data?.published],
          ["Pending viewings", data?.pendingBookings],
          ["Active agents", data?.agents],
          ["New inquiries", data?.newInquiries],
        ].map(([label, value]) => (
          <article className="metric" key={String(label)}>
            <span>{label}</span>
            <strong>{value ?? "—"}</strong>
          </article>
        ))}
      </section>
      {!data && !error && <State>Loading current operations…</State>}
      {data && (
        <section className="operation-panel">
          <div>
            <h2>Work queues</h2>
            <p>Current workload, without historical estimates.</p>
          </div>
          <div className="queue-links">
            <Link href="/properties">
              <span>Unpublished inventory</span>
              <strong>{data.properties - data.published}</strong>
              <small>Draft and review listings</small>
            </Link>
            {admin?.role !== "editor" && (
              <>
                <Link href="/bookings">
                  <span>Pending viewings</span>
                  <strong>{data.pendingBookings}</strong>
                  <small>Review requests awaiting confirmation</small>
                </Link>
                <Link href="/inquiries">
                  <span>New inquiries</span>
                  <strong>{data.newInquiries}</strong>
                  <small>Review incoming messages</small>
                </Link>
              </>
            )}
          </div>
        </section>
      )}
    </>
  );
}
