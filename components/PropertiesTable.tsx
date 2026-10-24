"use client";
import { BrandLoading } from "./BrandLoading";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Property, Agent, Agency } from "../lib/types";
import { api, ApiPage } from "../lib/api";
import { label, ugandaDate } from "../lib/presentation.mjs";
import { PageHeader, State, Badge, Pager } from "./PageState";
import { useQueue } from "./useQueue";
import { useSession } from "./Session";
import { useFeedback } from "./Feedback";
import { ConfirmDialog } from "./ConfirmDialog";
import { MediaPreview } from "./MediaPreview";
const defaults = {
  q: "",
  status: "",
  purpose: "",
  type: "",
  verificationStatus: "",
  availabilityStatus: "",
  featured: "",
  agent: "",
  agency: "",
  district: "",
  area: "",
  sort: "updated",
  page: 1,
};
const options: Record<string, string[]> = {
  availabilityStatus: [
    "available",
    "reserved",
    "rented",
    "sold",
    "unavailable",
  ],
  status: ["active", "draft", "pending_review", "published", "archived"],
  purpose: ["rent", "sale", "short_stay"],
  type: [
    "house",
    "apartment",
    "land",
    "commercial",
    "hotel",
    "guest_house",
    "serviced_apartment",
    "other",
  ],
  verificationStatus: ["unverified", "pending", "verified", "rejected"],
};
export function PropertiesTable() {
  const admin = useSession(),
    { notify } = useFeedback();
  const canManage = admin?.role !== "editor";
  const [filters, setFilters] = useState(defaults),
    [selected, setSelected] = useState<string[]>([]),
    [action, setAction] = useState(""),
    [confirm, setConfirm] = useState(false),
    [operationError, setOperationError] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]),
    [agencies, setAgencies] = useState<Agency[]>([]);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    queueMicrotask(() =>
      setFilters((current) => ({
        ...current,
        ...Object.fromEntries(
          Array.from(params.entries()).filter(([key]) => key in defaults),
        ),
        page: 1,
      })),
    );
    Promise.all([
      api<ApiPage<Agent>>("/agents?limit=100"),
      api<ApiPage<Agency>>("/agencies?limit=100"),
    ])
      .then(([a, g]) => {
        setAgents(a.data);
        setAgencies(g.data);
      })
      .catch(() => {});
  }, []);
  const { result, loading, error, reload } = useQueue<Property>(
    "/properties",
    filters,
  );
  const update = (key: keyof typeof defaults, value: string | number) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === "page" ? Number(value) : 1,
    }));
    setSelected([]);
  };
  function select(key: keyof typeof defaults, title: string, values: string[]) {
    return (
      <label>
        {title}
        <select
          aria-label={title}
          value={filters[key]}
          onChange={(e) => update(key, e.target.value)}
        >
          <option value="">All</option>
          {values.map((v) => (
            <option key={v} value={v}>
              {label(v)}
            </option>
          ))}
        </select>
      </label>
    );
  }
  return (
    <>
      <PageHeader
        eyebrow="Inventory"
        title="Properties"
        description="Review, assign and publish your property inventory."
        actions={
          <Link className="primary button" href="/properties/new">
            New property
          </Link>
        }
      />
      <form
        className="filter-panel"
        onSubmit={(e) => {
          e.preventDefault();
          reload();
        }}
      >
        <div className="filter-primary">
          <label className="search-field">
            Search
            <input
              aria-label="Search properties"
              placeholder="Title, area or district"
              value={filters.q}
              onChange={(e) => update("q", e.target.value)}
            />
          </label>
          {select("status", "Property status", options.status)}
          <label>
            Sort
            <select
              aria-label="Sort properties"
              value={filters.sort}
              onChange={(e) => update("sort", e.target.value)}
            >
              {[
                ["updated", "Last updated"],
                ["newest", "Newest"],
                ["oldest", "Oldest"],
                ["price_asc", "Price: low to high"],
                ["price_desc", "Price: high to low"],
              ].map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => {
              setFilters(defaults);
              setSelected([]);
            }}
          >
            Reset filters
          </button>
        </div>
        <details className="advanced-filters">
          <summary>
            More filters
            {Object.entries(filters).filter(
              ([k, v]) =>
                !["q", "status", "sort", "page"].includes(k) && v !== "",
            ).length
              ? " · Active"
              : ""}
          </summary>
          <div className="filter-grid">
            {select("purpose", "Purpose", options.purpose)}
            {select("type", "Property type", options.type)}
            {select(
              "availabilityStatus",
              "Availability",
              options.availabilityStatus,
            )}
            {select(
              "verificationStatus",
              "Verification",
              options.verificationStatus,
            )}
            <label>
              Featured
              <select
                value={filters.featured}
                onChange={(e) => update("featured", e.target.value)}
              >
                <option value="">All</option>
                <option value="true">Featured</option>
                <option value="false">Not featured</option>
              </select>
            </label>
            <label>
              Agent
              <select
                value={filters.agent}
                onChange={(e) => update("agent", e.target.value)}
              >
                <option value="">All agents</option>
                {agents.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Agency
              <select
                value={filters.agency}
                onChange={(e) => update("agency", e.target.value)}
              >
                <option value="">All agencies</option>
                {agencies.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            {(["district", "area"] as const).map((key) => (
              <label key={key}>
                {label(key)}
                <input
                  value={filters[key]}
                  onChange={(e) => update(key, e.target.value)}
                />
              </label>
            ))}
          </div>
        </details>
      </form>
      {canManage && (
        <div className="bulk-toolbar">
          <span>
            {selected.length
              ? `${selected.length} selected on this page`
              : "Select listings to manage together"}
          </span>
          <select
            aria-label="Bulk property action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          >
            <option value="">Choose action</option>
            {[
              "publish",
              "archive",
              "restore",
              "verify",
              "unverify",
              "feature",
              "unfeature",
            ].map((v) => (
              <option key={v} value={v}>
                {v === "restore" ? "Restore to draft" : label(v)}
              </option>
            ))}
          </select>
          <button
            disabled={!selected.length || !action || loading}
            onClick={() => setConfirm(true)}
          >
            Apply to selected
          </button>
        </div>
      )}
      {operationError && <State tone="error">{operationError}</State>}
      {error && (
        <State tone="error">
          {error}
          <button onClick={reload}>Retry</button>
        </State>
      )}
      {loading && <BrandLoading label="Loading properties…" />}
      {!loading && !error && !result?.data.length && (
        <State>
          No properties match these filters. Reset filters or create a listing.
        </State>
      )}
      {result && !error && (
        <>
          <div className="table-wrap" aria-busy={loading}>
            <table className="responsive-table inventory-table">
              <thead>
                <tr>
                  {canManage && (
                    <th className="selection-column">
                      <input
                        type="checkbox"
                        aria-label="Select all properties on this page"
                        disabled={loading || !result.data.length}
                        checked={
                          !!result.data.length &&
                          result.data.every((p) => selected.includes(p._id))
                        }
                        onChange={(e) =>
                          setSelected(
                            e.target.checked
                              ? result.data.map((p) => p._id)
                              : [],
                          )
                        }
                      />
                    </th>
                  )}
                  <th className="property-column">Property</th>
                  <th>Price / purpose</th>
                  <th>Assignment</th>
                  <th>Review / status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((item) => (
                  <tr key={item._id}>
                    {canManage && (
                      <td data-label="Select">
                        <input
                          type="checkbox"
                          disabled={loading}
                          aria-label={`Select ${item.title}`}
                          checked={selected.includes(item._id)}
                          onChange={(e) =>
                            setSelected((current) =>
                              e.target.checked
                                ? [...current, item._id]
                                : current.filter((id) => id !== item._id),
                            )
                          }
                        />
                      </td>
                    )}
                    <td>
                      <Link
                        className="property-cell"
                        href={`/properties/${item._id}`}
                      >
                        {item.cover?.url ||
                        item.media?.find((m) => m.type === "image")?.url ? (
                          <MediaPreview
                            compact
                            src={
                              item.cover?.url ||
                              item.media.find((m) => m.type === "image")!.url
                            }
                          />
                        ) : (
                          <span
                            className="thumbnail-placeholder"
                            aria-hidden="true"
                          >
                            —
                          </span>
                        )}
                        <div>
                          <strong>{item.title}</strong>
                          <span>
                            {[item.location.area, item.location.district]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                          <small>
                            {label(item.type)}
                            {item.featured ? " · Featured" : ""}
                          </small>
                        </div>
                      </Link>
                    </td>
                    <td data-label="Price / purpose" className="numeric">
                      {item.price.currency} {item.price.amount.toLocaleString()}
                      <span>
                        {label(item.purpose)} ·{" "}
                        {item.price.period === "total"
                          ? "Total"
                          : `per ${item.price.period}`}
                      </span>
                    </td>
                    <td data-label="Assignment">
                      <strong>{item.agent?.name || "Unassigned"}</strong>
                      <span>
                        {item.agency?.name || "Independent / no agency"}
                      </span>
                    </td>
                    <td data-label="Review / status">
                      <div className="badge-stack">
                        <Badge value={item.status} />
                        {item.availabilityStatus && (
                          <Badge value={item.availabilityStatus} />
                        )}
                        {item.availabilityVisibleUntil && (
                          <span className="muted">
                            {Date.parse(item.availabilityVisibleUntil) <=
                            Date.now()
                              ? "Hidden from public browsing"
                              : `Public until ${ugandaDate(item.availabilityVisibleUntil, true)}`}
                          </span>
                        )}
                        <Badge value={item.verificationStatus} />
                      </div>
                    </td>
                    <td data-label="Updated">{ugandaDate(item.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager
            {...result.pagination}
            onPage={(page) => update("page", page)}
          />
        </>
      )}
      {confirm && (
        <ConfirmDialog
          title={`${label(action)} ${selected.length} properties?`}
          action="Confirm bulk action"
          destructive={["archive", "restore", "unverify"].includes(action)}
          onClose={() => setConfirm(false)}
          onConfirm={async () => {
            setOperationError("");
            try {
              const { data } = await api<{
                data: {
                  succeeded: number;
                  failed: number;
                  results: { id: string; success: boolean; message?: string }[];
                };
              }>("/properties/bulk", {
                method: "POST",
                body: JSON.stringify({ ids: selected, action }),
              });
              notify(`${data.succeeded} properties updated.`);
              setSelected(
                data.results.filter((r) => !r.success).map((r) => r.id),
              );
              if (data.failed)
                setOperationError(
                  data.results
                    .filter((r) => !r.success)
                    .map((r) => r.message)
                    .join(" · "),
                );
              reload();
            } catch (e) {
              throw e;
            }
          }}
        >
          <p>
            This changes only the {selected.length} selected listings. Permanent
            bulk deletion is never available. Each successful change is recorded
            in the audit history.
          </p>
        </ConfirmDialog>
      )}
    </>
  );
}
