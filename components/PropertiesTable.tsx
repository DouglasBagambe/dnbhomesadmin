"use client";
import { MediaPreview } from "./MediaPreview";
import Link from "next/link";
import { useState } from "react";
import { Property } from "../lib/types";
import { label, ugandaDate } from "../lib/presentation.mjs";
import { PageHeader, State, Badge, Pager } from "./PageState";
import { useQueue } from "./useQueue";
export function PropertiesTable() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ q: "", status: "", page: 1 });
  const { result, loading, error, reload } = useQueue<Property>(
    "/properties",
    filters,
  );
  return (
    <>
      <PageHeader
        eyebrow="Inventory"
        title="Properties"
        description="Manage listing details, review status and published inventory."
        actions={
          <Link className="primary button" href="/properties/new">
            New property
          </Link>
        }
      />
      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setFilters({ ...filters, q: query, page: 1 });
          reload();
        }}
      >
        <input
          aria-label="Search properties"
          placeholder="Search listings"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="Property status"
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value, page: 1 })
          }
        >
          <option value="">All statuses</option>
          {["draft", "pending_review", "published", "archived"].map((v) => (
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
      {loading && <State>Loading properties…</State>}
      {!loading && !error && result?.data.length === 0 && (
        <State>No properties match these filters.</State>
      )}
      {result && !error && (
        <>
          <div className="table-wrap" aria-busy={loading}>
            <table className="responsive-table inventory-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Purpose</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((item) => {
                  const image =
                    item.cover?.url ||
                    item.media?.find((m) => m.type === "image")?.url;
                  return (
                    <tr key={item._id}>
                      <td>
                        <Link
                          className="property-cell"
                          href={`/properties/${item._id}`}
                        >
                          {image ? (
                            <MediaPreview key={image} compact src={image} />
                          ) : (
                            <span
                              className="thumbnail-placeholder"
                              aria-hidden="true"
                            >
                              H.
                            </span>
                          )}
                          <div>
                            <strong>{item.title}</strong>
                            <span>
                              {[item.location.area, item.location.district]
                                .filter(Boolean)
                                .join(" · ") || item.location.country}
                            </span>
                          </div>
                        </Link>
                      </td>
                      <td data-label="Purpose">{label(item.purpose)}</td>
                      <td data-label="Price" className="numeric">
                        {item.price.currency}{" "}
                        {item.price.amount.toLocaleString()}
                        <span>
                          {item.price.period === "total"
                            ? "Total"
                            : `per ${item.price.period}`}
                        </span>
                      </td>
                      <td data-label="Status">
                        <Badge value={item.status} />
                      </td>
                      <td data-label="Updated">{ugandaDate(item.updatedAt)}</td>
                    </tr>
                  );
                })}
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
