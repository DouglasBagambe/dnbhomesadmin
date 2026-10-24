"use client";
import { BrandLoading } from "./BrandLoading";
import { useState } from "react";
import { AuditEvent } from "../lib/types";
import { ugandaDate } from "../lib/presentation.mjs";
import { PageHeader, State, Pager } from "./PageState";
import { useQueue } from "./useQueue";
export function AuditPage() {
  const [filters, setFilters] = useState({
    actor: "",
    action: "",
    entityType: "",
    from: "",
    to: "",
    page: 1,
  });
  const { result, error, loading, reload } = useQueue<AuditEvent>("/audit", {
    ...filters,
    from: filters.from ? `${filters.from}T00:00:00+03:00` : "",
    to: filters.to ? `${filters.to}T23:59:59.999+03:00` : "",
  });
  return (
    <>
      <PageHeader
        eyebrow="Governance"
        title="Audit history"
        description="Who changed what, and when. Dates and times are shown in EAT."
      />
      <form
        className="filter-panel"
        onSubmit={(e) => {
          e.preventDefault();
          reload();
        }}
      >
        <div className="filter-grid">
          <label>
            Actor ID
            <input
              placeholder="Administrator ID"
              value={filters.actor}
              onChange={(e) =>
                setFilters({ ...filters, actor: e.target.value, page: 1 })
              }
            />
          </label>
          <label>
            Action
            <input
              placeholder="e.g. property.delete"
              value={filters.action}
              onChange={(e) =>
                setFilters({ ...filters, action: e.target.value, page: 1 })
              }
            />
          </label>
          <label>
            Entity type
            <select
              value={filters.entityType}
              onChange={(e) =>
                setFilters({ ...filters, entityType: e.target.value, page: 1 })
              }
            >
              <option value="">All entities</option>
              {[
                "Property",
                "Booking",
                "Inquiry",
                "Agent",
                "Agency",
                "Admin",
                "MediaAsset",
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            From date
            <input
              type="date"
              value={filters.from}
              onChange={(e) =>
                setFilters({ ...filters, from: e.target.value, page: 1 })
              }
            />
          </label>
          <label>
            To date
            <input
              type="date"
              min={filters.from}
              value={filters.to}
              onChange={(e) =>
                setFilters({ ...filters, to: e.target.value, page: 1 })
              }
            />
          </label>
          <button
            type="button"
            onClick={() =>
              setFilters({
                actor: "",
                action: "",
                entityType: "",
                from: "",
                to: "",
                page: 1,
              })
            }
          >
            Reset filters
          </button>
        </div>
      </form>
      {error && (
        <State tone="error">
          {error}
          <button onClick={reload}>Retry</button>
        </State>
      )}
      {loading && <BrandLoading label="Loading audit history…" />}
      {!loading && !error && !result?.data.length && (
        <State>No audit events match these filters.</State>
      )}
      {result && !error && (
        <>
          <div className="table-wrap">
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Event / details</th>
                  <th>Actor</th>
                  <th>Entity</th>
                  <th>Timestamp · EAT</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <details className="audit-details">
                        <summary>{item.action}</summary>
                        <dl>
                          <dt>Action</dt>
                          <dd>{item.action}</dd>
                          <dt>Actor ID</dt>
                          <dd>
                            <code>
                              {item.actor?._id ||
                                item.actor?.id ||
                                "Unavailable"}
                            </code>
                          </dd>
                          <dt>Entity ID</dt>
                          <dd>
                            <code>{item.entityId || "—"}</code>
                          </dd>
                        </dl>
                        <pre aria-label="Event metadata">
                          {JSON.stringify(item.metadata || {}, null, 2)}
                        </pre>
                      </details>
                    </td>
                    <td data-label="Actor">
                      <strong>{item.actor?.name || "Unavailable actor"}</strong>
                      <span>{item.actor?.email}</span>
                    </td>
                    <td data-label="Entity">{item.entityType}</td>
                    <td data-label="Timestamp · EAT">
                      {ugandaDate(item.createdAt, true)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager
            {...result.pagination}
            onPage={(page) => setFilters({ ...filters, page })}
          />
        </>
      )}
    </>
  );
}
