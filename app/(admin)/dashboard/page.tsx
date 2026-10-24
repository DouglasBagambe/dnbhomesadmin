"use client";
import { BrandLoading } from "../../../components/BrandLoading";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../../lib/api";
import { friendlyError } from "../../../lib/presentation.mjs";
import { useSession } from "../../../components/Session";
import { PageHeader, State } from "../../../components/PageState";
type Summary = {
  properties: number;
  published: number;
  drafts: number;
  pendingReview: number;
  archived: number;
  verified: number;
  unverified: number;
  agents: number;
  pendingBookings?: number;
  todayBookings?: number;
  upcomingBookings?: number;
  newInquiries?: number;
};
export default function Dashboard() {
  const admin = useSession();
  const [data, setData] = useState<Summary>(),
    [error, setError] = useState("");
  const load = () => {
    setError("");
    api<{ data: Summary }>("/dashboard")
      .then((r) => setData(r.data))
      .catch((e) => setError(friendlyError(e)));
  };
  useEffect(() => {
    queueMicrotask(load);
  }, []);
  const metrics: [
    [string, number | undefined],
    ...[string, number | undefined][],
  ] = [
    ["Active inventory", data?.properties],
    ["Published", data?.published],
    ["Drafts", data?.drafts],
    ["In review", data?.pendingReview],
    ["Archived", data?.archived],
    ["Verified active", data?.verified],
    ["Active agents", data?.agents],
  ];
  if (admin?.role !== "editor")
    metrics.push(
      ["Pending viewings", data?.pendingBookings],
      ["Viewings today · EAT", data?.todayBookings],
      ["Upcoming viewings", data?.upcomingBookings],
      ["New inquiries", data?.newInquiries],
    );
  return (
    <>
      <PageHeader
        eyebrow="Operations overview"
        title="Dashboard"
        description="Current inventory and the work that needs your attention. Counts reflect recorded operations."
        actions={
          <Link className="primary button" href="/properties/new">
            New property
          </Link>
        }
      />
      {error && (
        <State tone="error">
          {error}
          <button onClick={load}>Retry</button>
        </State>
      )}
      <section className="metric-grid">
        {metrics.map(([text, value]) => (
          <article className="metric" key={text}>
            <span>{text}</span>
            <strong>{value ?? "—"}</strong>
          </article>
        ))}
      </section>
      {!data && !error && <BrandLoading label="Loading operations…" />}
      {data && (
        <section className="operation-panel">
          <div>
            <p className="eyebrow">Next actions</p>
            <h2>Work queues</h2>
            <p>Open a filtered queue to resolve the next item.</p>
          </div>
          <div className="queue-links">
            <Link href="/properties?status=pending_review">
              <span>Listings awaiting review</span>
              <strong>{data.pendingReview}</strong>
              <small>Review content and publishing readiness →</small>
            </Link>
            <Link href="/properties?verificationStatus=unverified&status=active">
              <span>Unverified listings</span>
              <strong>{data.unverified}</strong>
              <small>Review active and draft inventory →</small>
            </Link>
            {admin?.role !== "editor" && (
              <>
                <Link href="/bookings?status=pending">
                  <span>Pending viewing requests</span>
                  <strong>{data.pendingBookings}</strong>
                  <small>Confirm schedules and record notes →</small>
                </Link>
                <Link href="/inquiries?status=new">
                  <span>New inquiries</span>
                  <strong>{data.newInquiries}</strong>
                  <small>Review messages and next steps →</small>
                </Link>
              </>
            )}
          </div>
        </section>
      )}
    </>
  );
}
