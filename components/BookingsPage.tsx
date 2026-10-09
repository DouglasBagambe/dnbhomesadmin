"use client";
import { useState } from "react";
import { Booking } from "../lib/types";
import { label, ugandaDate } from "../lib/presentation.mjs";
import { PageHeader, State, Badge, Pager } from "./PageState";
import { useQueue } from "./useQueue";
import { StatusUpdate } from "./StatusUpdate";
const statuses = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "rejected",
  "no_show",
];
export function BookingsPage() {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ q: "", status: "", page: 1 });
  const { result, loading, error, reload } = useQueue<Booking>(
    "/bookings",
    filters,
  );
  return (
    <>
      <PageHeader
        eyebrow="Viewing operations"
        title="Viewing requests"
        description="Review requests and explicitly confirm status changes. Times are Uganda time (EAT)."
      />
      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setFilters({ ...filters, q, page: 1 });
          reload();
        }}
      >
        <input
          aria-label="Search viewing requests"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Reference, guest, email or phone"
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
        <button>Search</button>
      </form>
      {error && (
        <State tone="error">
          {error} <button onClick={reload}>Retry</button>
        </State>
      )}
      {loading && <State>Loading viewing requests…</State>}
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
                  <th>Requested time · EAT</th>
                  <th>Guest / contact</th>
                  <th>Status</th>
                  <th>Manage</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong>{item.reference}</strong>
                      <span>
                        {item.property?.title || "Property unavailable"}
                      </span>
                    </td>
                    <td data-label="Requested time · EAT">
                      {ugandaDate(item.scheduledAt, true)}
                    </td>
                    <td data-label="Guest">
                      <strong>{item.guestName || "Guest"}</strong>
                      <span>{item.guestEmail}</span>
                      <span>{item.guestPhone}</span>
                    </td>
                    <td data-label="Status">
                      <Badge value={item.status} />
                    </td>
                    <td>
                      <StatusUpdate
                        key={`${item._id}-${item.status}`}
                        status={item.status}
                        options={statuses}
                        path={`/bookings/${item._id}/status`}
                        name={item.reference}
                        onSaved={reload}
                      />
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
