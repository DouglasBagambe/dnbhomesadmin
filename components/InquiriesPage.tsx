"use client";
import { BrandLoading } from "./BrandLoading";
import { useState, useEffect } from "react";
import { Inquiry } from "../lib/types";
import { label, ugandaDate } from "../lib/presentation.mjs";
import { PageHeader, State, Badge, Pager } from "./PageState";
import { useQueue } from "./useQueue";
import { StatusNotesDialog } from "./StatusNotesDialog";
import { ContactLinks } from "./ContactLinks";
const statuses = ["new", "in_progress", "resolved", "spam"];
export function InquiriesPage() {
  const [selected, setSelected] = useState<Inquiry>();
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({
    q: "",
    kind: "",
    status: "",
    page: 1,
  });
  useEffect(() => {
    const status = new URLSearchParams(location.search).get("status");
    if (status && statuses.includes(status))
      queueMicrotask(() => setFilters((current) => ({ ...current, status })));
  }, []);
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
      {loading && <BrandLoading label="Loading inquiries…" />}
      {!loading && !error && !result?.data.length && (
        <State>No inquiries match these filters.</State>
      )}
      {selected && (
        <StatusNotesDialog
          title={`Inquiry from ${selected.name}`}
          status={selected.status}
          notes={selected.adminNotes}
          options={statuses}
          path={`/inquiries/${selected._id}`}
          onClose={() => setSelected(undefined)}
          onSaved={reload}
        >
          <div className="inquiry-context">
            <strong>
              {selected.subject ||
                [selected.role, selected.propertyType, selected.location]
                  .filter(Boolean)
                  .join(" · ")}
            </strong>
            <ContactLinks email={selected.email} phone={selected.phone} />
            <p className="preserve-lines">{selected.message}</p>
          </div>
        </StatusNotesDialog>
      )}
      <div className="inquiry-list">
        {!error &&
          result?.data.map((item) => (
            <article className="inquiry" key={item._id}>
              <header>
                <div>
                  <strong>{item.name}</strong>
                  <ContactLinks email={item.email} phone={item.phone} />
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
                <button onClick={() => setSelected(item)}>
                  Open inquiry & notes
                </button>
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
