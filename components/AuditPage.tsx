"use client";
import { useState } from "react";
import { AuditEvent } from "../lib/types";
import { ugandaDate } from "../lib/presentation.mjs";
import { PageHeader, State, Pager } from "./PageState";
import { useQueue } from "./useQueue";
export function AuditPage() {
  const [page, setPage] = useState(1);
  const { result, error, loading, reload } = useQueue<AuditEvent>("/audit", {
    page,
  });
  return (
    <>
      <PageHeader
        eyebrow="Governance"
        title="Audit history"
        description="Privileged changes recorded by the administration API. Times shown in EAT."
      />
      {error && (
        <State tone="error">
          {error} <button onClick={reload}>Retry</button>
        </State>
      )}
      {loading && <State>Loading audit history…</State>}
      {!loading && !error && !result?.data.length && (
        <State>No audit events recorded.</State>
      )}
      {result && !error && (
        <>
          <div className="table-wrap">
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>Entity</th>
                  <th>Timestamp · EAT</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong>{item.action}</strong>
                    </td>
                    <td data-label="Actor">{item.actor?.name || "System"}</td>
                    <td data-label="Entity">
                      {item.entityType}
                      {item.entityId && <code>{item.entityId}</code>}
                    </td>
                    <td data-label="Timestamp · EAT">
                      {ugandaDate(item.createdAt, true)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager {...result.pagination} onPage={setPage} />
        </>
      )}
    </>
  );
}
