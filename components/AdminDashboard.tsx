"use client";

import {
  Building2,
  CalendarDays,
  Eye,
  Heart,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  createProperty,
  deleteProperty,
  getAppointmentsForProperty,
  getProperties,
  toggleFeatured,
  updateProperty
} from "../lib/api";
import type {
  Appointment,
  Property,
  PropertyPayload,
  PropertyPurpose,
  ToastState
} from "../lib/types";
import { PropertyForm } from "./PropertyForm";

type ActiveView = "properties" | "appointments";

type EditingState = {
  mode: "create" | "edit";
  property: Property | null;
} | null;

type AppointmentGroup = {
  property: Property;
  appointments: Appointment[];
};

const currencyFormatter = new Intl.NumberFormat("en-UG", {
  style: "currency",
  currency: "UGX",
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat("en-UG", {
  dateStyle: "medium",
  timeStyle: "short"
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function formatPurpose(purpose: PropertyPurpose): string {
  if (purpose === "shortStay") return "short stay";
  return purpose;
}

function propertyImage(property: Property): string {
  return property.images[0] || "/brand/logo-light.svg";
}

function matchesFilter(property: Property, query: string, type: string, purpose: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  const searchable = [
    property.title,
    property.location,
    property.region,
    property.district ?? "",
    property.area ?? "",
    property.agent.name
  ].join(" ").toLowerCase();

  return (
    (normalizedQuery.length === 0 || searchable.includes(normalizedQuery)) &&
    (type === "all" || property.type === type) &&
    (purpose === "all" || property.purpose === purpose)
  );
}

export function AdminDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [appointmentGroups, setAppointmentGroups] = useState<AppointmentGroup[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>("properties");
  const [editingState, setEditingState] = useState<EditingState>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [purposeFilter, setPurposeFilter] = useState("all");
  const [toast, setToast] = useState<ToastState>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAppointmentsLoading, setIsAppointmentsLoading] = useState(false);

  const filteredProperties = useMemo(
    () =>
      properties.filter((property: Property) =>
        matchesFilter(property, query, typeFilter, purposeFilter)
      ),
    [properties, purposeFilter, query, typeFilter]
  );

  const totalValue = useMemo(
    () => properties.reduce((total: number, property: Property) => total + property.price, 0),
    [properties]
  );

  const featuredCount = properties.filter((property: Property) => property.isFeatured).length;
  const viewCount = properties.reduce((total: number, property: Property) => total + property.views, 0);
  const favoriteCount = properties.reduce((total: number, property: Property) => total + property.favorites, 0);

  useEffect(() => {
    void loadProperties();
  }, []);

  useEffect(() => {
    if (toast === null) return;
    const timeout = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function loadProperties() {
    setIsLoading(true);
    try {
      const response = await getProperties();
      setProperties(response.properties);
      setToast({ type: "success", message: "Portfolio synced" });
    } catch (error) {
      setToast({ type: "error", message: error instanceof Error ? error.message : "Failed to load properties" });
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAppointments() {
    setActiveView("appointments");
    setIsAppointmentsLoading(true);
    try {
      const groups = await Promise.all(
        properties.map(async (property: Property) => ({
          property,
          appointments: await getAppointmentsForProperty(property._id)
        }))
      );
      setAppointmentGroups(groups);
    } catch (error) {
      setToast({ type: "error", message: error instanceof Error ? error.message : "Failed to load appointments" });
    } finally {
      setIsAppointmentsLoading(false);
    }
  }

  async function saveProperty(payload: PropertyPayload) {
    try {
      if (editingState?.mode === "edit" && editingState.property) {
        await updateProperty(editingState.property._id, payload);
        setToast({ type: "success", message: "Property updated" });
      } else {
        await createProperty(payload);
        setToast({ type: "success", message: "Property created" });
      }
      setEditingState(null);
      await loadProperties();
    } catch (error) {
      setToast({ type: "error", message: error instanceof Error ? error.message : "Save failed" });
      throw error;
    }
  }

  async function removeProperty(property: Property) {
    const confirmed = window.confirm(`Delete "${property.title}" permanently?`);
    if (!confirmed) return;

    try {
      await deleteProperty(property._id);
      setProperties((current: Property[]) =>
        current.filter((item: Property) => item._id !== property._id)
      );
      setToast({ type: "success", message: "Property deleted" });
    } catch (error) {
      setToast({ type: "error", message: error instanceof Error ? error.message : "Delete failed" });
    }
  }

  async function changeFeatured(property: Property) {
    try {
      const updatedProperty = await toggleFeatured(property._id);
      setProperties((current: Property[]) =>
        current.map((item: Property) =>
          item._id === updatedProperty._id ? updatedProperty : item
        )
      );
      setToast({ type: "success", message: "Featured status updated" });
    } catch (error) {
      setToast({ type: "error", message: error instanceof Error ? error.message : "Update failed" });
    }
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <Image src="/brand/logo-dark.svg" alt="dnb Homes" width={46} height={46} />
          <div>
            <div className="brand-title">dnb Homes</div>
            <div className="brand-subtitle">Command Center</div>
          </div>
        </div>
        <nav className="nav" aria-label="Admin sections">
          <button
            className={`nav-button ${activeView === "properties" ? "active" : ""}`}
            type="button"
            onClick={() => setActiveView("properties")}
          >
            <Building2 size={18} /> Properties
          </button>
          <button
            className={`nav-button ${activeView === "appointments" ? "active" : ""}`}
            type="button"
            onClick={() => void loadAppointments()}
          >
            <CalendarDays size={18} /> Appointments
          </button>
        </nav>
        <div className="sidebar-note">
          Admin controls are now isolated from the customer app and point directly to the backend API.
        </div>
      </aside>

      <main className="main">
        <section className="topbar">
          <div>
            <p className="eyebrow">Secure operations</p>
            <h1>dnb Homes Command Center</h1>
            <p className="topbar-copy">
              Manage listings, featured inventory, pricing, media, agents, and viewing requests from one focused workspace.
            </p>
          </div>
          <div className="actions">
            <button className="button" type="button" onClick={() => void loadProperties()}>
              <RefreshCcw size={16} /> Refresh
            </button>
            <button className="button primary" type="button" onClick={() => setEditingState({ mode: "create", property: null })}>
              <Plus size={16} /> Add Property
            </button>
          </div>
        </section>

        <section className="stats" aria-label="Portfolio metrics">
          <div className="stat">
            <div className="stat-label"><Building2 size={16} /> Listings</div>
            <div className="stat-value">{properties.length}</div>
          </div>
          <div className="stat">
            <div className="stat-label"><Sparkles size={16} /> Featured</div>
            <div className="stat-value">{featuredCount}</div>
          </div>
          <div className="stat">
            <div className="stat-label"><Eye size={16} /> Views</div>
            <div className="stat-value">{viewCount}</div>
          </div>
          <div className="stat">
            <div className="stat-label"><Heart size={16} /> Saved</div>
            <div className="stat-value">{favoriteCount}</div>
          </div>
        </section>

        {activeView === "properties" ? (
          <section>
            <div className="toolbar">
              <label>
                <span className="label">Search</span>
                <div className="search-wrap">
                  <Search size={16} />
                  <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title, location, region, agent" />
                </div>
              </label>
              <label>
                <span className="label">Type</span>
                <select className="select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                  <option value="all">All types</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="commercial">Commercial</option>
                  <option value="land">Land</option>
                  <option value="studio">Studio</option>
                </select>
              </label>
              <label>
                <span className="label">Purpose</span>
                <select className="select" value={purposeFilter} onChange={(event) => setPurposeFilter(event.target.value)}>
                  <option value="all">All purposes</option>
                  <option value="rent">Rent</option>
                  <option value="sale">Sale</option>
                  <option value="shortStay">Short stay</option>
                </select>
              </label>
            </div>
            <div className="content-grid">
              <PropertyTable
                isLoading={isLoading}
                properties={filteredProperties}
                onEdit={(property: Property) => setEditingState({ mode: "edit", property })}
                onDelete={removeProperty}
                onToggleFeatured={changeFeatured}
              />
              <PortfolioPanel totalValue={totalValue} properties={properties} />
            </div>
          </section>
        ) : (
          <AppointmentsPanel
            groups={appointmentGroups}
            isLoading={isAppointmentsLoading}
            onRefresh={loadAppointments}
          />
        )}
      </main>

      {editingState ? (
        <PropertyForm
          property={editingState.property}
          onCancel={() => setEditingState(null)}
          onSubmit={saveProperty}
        />
      ) : null}

      {toast ? <div className={`toast ${toast.type === "error" ? "error" : ""}`}>{toast.message}</div> : null}
    </div>
  );
}

function PropertyTable({
  isLoading,
  properties,
  onEdit,
  onDelete,
  onToggleFeatured
}: {
  isLoading: boolean;
  properties: Property[];
  onEdit: (property: Property) => void;
  onDelete: (property: Property) => void;
  onToggleFeatured: (property: Property) => void;
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Listings</h2>
        <span className="badge">{properties.length} visible</span>
      </div>
      <div className="property-list">
        {isLoading ? <div className="empty">Loading property portfolio...</div> : null}
        {!isLoading && properties.length === 0 ? <div className="empty">No matching properties found.</div> : null}
        {properties.map((property: Property) => (
          <div className="property-row" key={property._id}>
            <div
              className="property-image"
              style={{ backgroundImage: `url("${propertyImage(property)}")` }}
              aria-hidden="true"
            />
            <div>
              <div className="property-title">{property.title}</div>
              <div className="property-meta">{property.location} · {property.region} · {property.type}</div>
            </div>
            <div>
              <div className="badge gold">{formatPurpose(property.purpose)}</div>
              <div className="property-meta">{formatCurrency(property.price)}</div>
            </div>
            <div>
              <div className="property-meta">{property.agent.name}</div>
              <div className="property-meta">{property.views} views · {property.favorites} saves</div>
            </div>
            <div className="row-actions">
              <button className="icon-button" type="button" onClick={() => onToggleFeatured(property)} aria-label="Toggle featured">
                <Star size={17} fill={property.isFeatured ? "currentColor" : "none"} />
              </button>
              <button className="icon-button" type="button" onClick={() => onEdit(property)} aria-label="Edit property">
                <Pencil size={17} />
              </button>
              <button className="icon-button danger" type="button" onClick={() => onDelete(property)} aria-label="Delete property">
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PortfolioPanel({
  totalValue,
  properties
}: {
  totalValue: number;
  properties: Property[];
}) {
  const latestProperty = properties[0];

  return (
    <aside className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Portfolio Health</h2>
        <ShieldCheck size={18} />
      </div>
      <div className="appointment-list">
        <div className="appointment">
          <div className="appointment-title">Listed inventory value</div>
          <div className="stat-value">{formatCurrency(totalValue)}</div>
        </div>
        <div className="appointment">
          <div className="appointment-title">Latest listing</div>
          <div className="appointment-meta">
            {latestProperty ? `${latestProperty.title} in ${latestProperty.location}` : "No listings yet"}
          </div>
        </div>
        <div className="appointment">
          <div className="appointment-title">Operational note</div>
          <div className="appointment-meta">
            Keep high-value media, agent contacts, location fields, and appointment fees updated before pushing listings live.
          </div>
        </div>
      </div>
    </aside>
  );
}

function AppointmentsPanel({
  groups,
  isLoading,
  onRefresh
}: {
  groups: AppointmentGroup[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}) {
  const appointments = groups.flatMap((group: AppointmentGroup) =>
    group.appointments.map((appointment: Appointment) => ({
      appointment,
      property: group.property
    }))
  );

  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Viewing Appointments</h2>
        <button className="button" type="button" onClick={() => void onRefresh()}>
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>
      <div className="appointment-list">
        {isLoading ? <div className="empty">Loading appointments...</div> : null}
        {!isLoading && appointments.length === 0 ? <div className="empty">No appointments scheduled yet.</div> : null}
        {appointments.map(({ appointment, property }) => (
          <article className="appointment" key={appointment._id}>
            <div className="appointment-title">{appointment.name}</div>
            <div className="appointment-meta">
              {property.title} · {appointment.purpose} · {dateFormatter.format(new Date(appointment.appointmentTime))}
            </div>
            <div className="appointment-meta">
              {appointment.phone} · {appointment.email} · {appointment.duration}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
