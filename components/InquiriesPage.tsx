"use client";
import { useState } from "react";
import { Inquiry } from "../lib/types";
import { label, ugandaDate } from "../lib/presentation.mjs";
import { PageHeader, State, Badge, Pager } from "./PageState";
import { useQueue } from "./useQueue";
import { StatusUpdate } from "./StatusUpdate";
const statuses = ["new", "in_progress", "resolved", "spam"];
export function InquiriesPage() {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({
    q: "",
    kind: "",
    status: "",
    page: 1,
  });
  const { result, error, loading, reload } = useQueue<Inquiry>(
    "/inquiries",
    filters,
  );
  return (
    <>
      <PageHeader
        eyebrow="Customer operations"
        title="Inquiries"
        description="Contact messages and existing listing inquiries, in one operational inbox."
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
          aria-label="Search inquiries"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name, email, phone or location"
        />
        <select
          aria-label="Inquiry type"
          value={filters.kind}
          onChange={(e) =>
            setFilters({ ...filters, kind: e.target.value, page: 1 })
          }
        >
          <option value="">All types</option>
          <option value="contact">Contact</option>
          <option value="listing">Listing</option>
        </select>
        <select
          aria-label="Inquiry status"
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
      {loading && <State>Loading inquiries…</State>}
      {!loading && !error && !result?.data.length && (
        <State>No inquiries match these filters.</State>
      )}
      <div className="inquiry-list">
        {!error &&
          result?.data.map((item) => (
            <article className="inquiry" key={item._id}>
              <header>
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {[item.email, item.phone].filter(Boolean).join(" · ")}
                  </span>
                </div>
                <div className="inquiry-meta">
                  <Badge value={item.status} />
                  <time dateTime={item.createdAt}>
                    {ugandaDate(item.createdAt, true)} EAT
                  </time>
                </div>
              </header>
              <div className="inquiry-context">
                <span className="eyebrow">
                  {item.kind === "listing" ? "Listing inquiry" : "Contact"}
                </span>
                <strong>
                  {item.kind === "listing"
                    ? [item.role, item.propertyType, item.location]
                        .filter(Boolean)
                        .join(" · ") || "Listing inquiry"
                    : item.subject || "Contact inquiry"}
                </strong>
              </div>
              <p className="inquiry-message">{item.message}</p>
              <footer>
                <StatusUpdate
                  key={`${item._id}-${item.status}`}
                  status={item.status}
                  options={statuses}
                  path={`/inquiries/${item._id}`}
                  name={`inquiry from ${item.name}`}
                  onSaved={reload}
                />
              </footer>
            </article>
          ))}
      </div>
      {result && !error && (
        <Pager
          {...result.pagination}
          onPage={(page) => setFilters({ ...filters, page })}
        />
      )}
    </>
  );
}
