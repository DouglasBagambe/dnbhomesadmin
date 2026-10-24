"use client";
import { BrandLoading } from "./BrandLoading";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Booking } from "../lib/types";
import { label, ugandaDate } from "../lib/presentation.mjs";
import { PageHeader, State, Badge, Pager } from "./PageState";
import { useQueue } from "./useQueue";
import { StatusNotesDialog } from "./StatusNotesDialog";
import { ContactLinks } from "./ContactLinks";
const statuses = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "rejected",
  "no_show",
];
export function BookingsPage() {
  const [filters, setFilters] = useState({ q: "", status: "", page: 1 }),
    [selected, setSelected] = useState<Booking>();
  useEffect(() => {
    const status = new URLSearchParams(location.search).get("status");
    if (status && statuses.includes(status))
      queueMicrotask(() => setFilters((current) => ({ ...current, status })));
  }, []);
  const { result, loading, error, reload } = useQueue<Booking>(
    "/bookings",
    filters,
  );
  return (
    <>
      <PageHeader
        eyebrow="Viewing operations"
        title="Viewing requests"
        description="Review schedules, contact requesters and maintain a clear operational history. All times are EAT."
      />
      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          reload();
        }}
      >
        <input
          aria-label="Search viewing requests"
          value={filters.q}
          onChange={(e) =>
            setFilters({ ...filters, q: e.target.value, page: 1 })
          }
          placeholder="Reference, requester, email or phone"
        />
        <select
          aria-label="Viewing status"
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value, page: 1 })
          }
        >
          <option value="">All statuses</option>
          {statuses.map((v) => (
            <option key={v} value={v}>
              {label(v)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setFilters({ q: "", status: "", page: 1 })}
        >
          Reset
        </button>
      </form>
      {error && (
        <State tone="error">
          {error}
          <button onClick={reload}>Retry</button>
        </State>
      )}
      {loading && <BrandLoading label="Loading viewing requests…" />}
      {!loading && !error && !result?.data.length && (
        <State>No viewing requests match these filters.</State>
      )}
      {result && !error && (
        <>
          <div className="table-wrap">
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Request / property</th>
                  <th>Requester</th>
                  <th>Requested · EAT</th>
                  <th>Agent / received</th>
                  <th>Status / action</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong>{item.reference}</strong>
                      {item.property ? (
                        <Link href={`/properties/${item.property._id}`}>
                          {item.property.title}
                        </Link>
                      ) : (
                        <span>
                          {item.propertySnapshot?.title ||
                            "Property unavailable"}
                          {item.propertySnapshot?.deleted ? " · Deleted" : ""}
                        </span>
                      )}
                    </td>
                    <td data-label="Requester">
                      <strong>{item.guestName || "Guest"}</strong>
                      <ContactLinks
                        email={item.guestEmail}
                        phone={item.guestPhone}
                      />
                    </td>
                    <td data-label="Requested · EAT">
                      {ugandaDate(item.scheduledAt, true)}
                    </td>
                    <td data-label="Agent / received">
                      <strong>{item.agent?.name || "Unassigned"}</strong>
                      <span>{ugandaDate(item.createdAt, true)}</span>
                    </td>
                    <td data-label="Status / action">
                      <div className="badge-stack">
                        <Badge value={item.status} />
                        <button onClick={() => setSelected(item)}>
                          Open request
                        </button>
                      </div>
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
      {selected && (
        <StatusNotesDialog
          key={selected._id}
          title={`Viewing ${selected.reference}`}
          status={selected.status}
          notes={selected.adminNotes}
          options={statuses}
          path={`/bookings/${selected._id}/status`}
          viewing
          onClose={() => setSelected(undefined)}
          onSaved={reload}
        >
          <dl className="record-details">
            <dt>Property</dt>
            <dd>
              {selected.property ? (
                <Link href={`/properties/${selected.property._id}`}>
                  {selected.property.title}
                </Link>
              ) : (
                selected.propertySnapshot?.title || "Unavailable"
              )}
            </dd>
            <dt>Requested time · EAT</dt>
            <dd>{ugandaDate(selected.scheduledAt, true)}</dd>
            <dt>Received · EAT</dt>
            <dd>{ugandaDate(selected.createdAt, true)}</dd>
            <dt>Assigned agent</dt>
            <dd>{selected.agent?.name || "Unassigned"}</dd>
            <dt>Requester</dt>
            <dd>
              {selected.guestName}
              <ContactLinks
                email={selected.guestEmail}
                phone={selected.guestPhone}
              />
            </dd>
            <dt>Requester notes</dt>
            <dd className="preserve-lines">
              {selected.notes || "No additional notes"}
            </dd>
          </dl>
        </StatusNotesDialog>
      )}
    </>
  );
}
