/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { BrandLoading } from "./BrandLoading";
import { Modal } from "./Modal";
import { friendlyError } from "../lib/presentation.mjs";
import { FormEvent, useEffect, useState } from "react";
import { api, ApiPage } from "../lib/api";
import { Agency, Agent } from "../lib/types";
import { useSession } from "./Session";
import { useFeedback } from "./Feedback";
import { ConfirmDialog } from "./ConfirmDialog";
import { ContactLinks } from "./ContactLinks";
import { PageHeader, State, Badge, Pager } from "./PageState";
export function AgentsPage({ agencies = false }: { agencies?: boolean }) {
  const admin = useSession();
  const { notify } = useFeedback();
  const [filters, setFilters] = useState({
    q: "",
    status: "",
    verificationStatus: "",
    page: 1,
  });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [pending, setPending] = useState<Record<string, FormDataEntryValue>>();
  const noun = agencies ? "agency" : "agent";
  const [items, setItems] = useState<Array<Agent | Agency>>([]);
  const [agencyList, setAgencyList] = useState<Agency[]>([]);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Agent | Agency | null | undefined>(
    undefined,
  );
  const load = () =>
    api<ApiPage<Agent | Agency>>(
      `${agencies ? "/agencies" : "/agents"}?${new URLSearchParams(Object.entries(filters).map(([key, value]) => [key, String(value)]))}`,
    )
      .then((r) => {
        setItems(r.data);
        setPagination(r.pagination);
        setLoaded(true);
      })
      .catch((e) => setError(friendlyError(e)));
  useEffect(() => {
    load();
    if (!agencies)
      api<ApiPage<Agency>>("/agencies?limit=100")
        .then((r) => setAgencyList(r.data))
        .catch((e) => setError(friendlyError(e)));
  }, [agencies, filters]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (editing?.status === "active" && values.status === "inactive") {
      setPending(values);
      return;
    }
    await save(values);
  }
  async function save(values: Record<string, FormDataEntryValue>) {
    setBusy(true);
    setError("");
    try {
      await api(
        `${agencies ? "/agencies" : "/agents"}${editing?._id ? `/${editing._id}` : ""}`,
        {
          method: editing?._id ? "PATCH" : "POST",
          body: JSON.stringify({
            ...values,
            ...(!agencies ? { agency: values.agency || null } : {}),
          }),
        },
      );
      setEditing(undefined);
      setPending(undefined);
      notify(`${agencies ? "Agency" : "Agent"} saved.`);
      load();
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }
  if (admin?.role === "editor")
    return <State tone="error">Administrator access required.</State>;
  return (
    <>
      <PageHeader
        eyebrow="People and partners"
        title={agencies ? "Agencies" : "Agents"}
        description={`Manage ${noun} contact details, activity and verification status.`}
        actions={
          <button className="primary" onClick={() => setEditing(null)}>
            New {noun}
          </button>
        }
      />
      {error && (
        <State tone="error">
          {error}
          <button onClick={() => window.location.reload()}>Retry</button>
        </State>
      )}
      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          void load();
        }}
      >
        <input
          aria-label={`Search ${noun} records`}
          placeholder="Search by name"
          value={filters.q}
          onChange={(e) =>
            setFilters({ ...filters, q: e.target.value, page: 1 })
          }
        />
        <select
          aria-label="Profile status"
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value, page: 1 })
          }
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          aria-label="Profile verification"
          value={filters.verificationStatus}
          onChange={(e) =>
            setFilters({
              ...filters,
              verificationStatus: e.target.value,
              page: 1,
            })
          }
        >
          <option value="">All verification</option>
          {["unverified", "pending", "verified", "rejected"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() =>
            setFilters({ q: "", status: "", verificationStatus: "", page: 1 })
          }
        >
          Reset
        </button>
      </form>
      <div className="table-wrap">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>{agencies ? "Agency" : "Agent"}</th>
              {!agencies && <th>Agency</th>}
              <th>Contact</th>
              <th>Activity</th>
              <th>Status / verification</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>
                  <strong>{item.name}</strong>
                  <code>{item.slug}</code>
                </td>
                {!agencies && (
                  <td data-label="Agency">
                    {(item as Agent).agency?.name || "Independent"}
                  </td>
                )}
                <td data-label="Contact">
                  <ContactLinks email={item.email} phone={item.phone} />
                </td>
                <td data-label="Activity">
                  <strong>{item.listingCount ?? 0} properties</strong>
                  {agencies && (
                    <span>{(item as Agency).agentCount ?? 0} agents</span>
                  )}
                </td>
                <td data-label="Status / verification">
                  <div className="badge-stack">
                    <Badge value={item.status} />
                    <Badge value={item.verificationStatus} />
                  </div>
                </td>
                <td>
                  <button onClick={() => setEditing(item)}>Edit {noun}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager
        {...pagination}
        onPage={(page) => setFilters({ ...filters, page })}
      />
      {!loaded && !error && <BrandLoading label="Loading records…" />}
      {loaded && !items.length && !error && (
        <State>No {noun} records yet.</State>
      )}
      {pending && (
        <ConfirmDialog
          title={`Deactivate ${noun}?`}
          action="Deactivate"
          destructive
          onClose={() => setPending(undefined)}
          onConfirm={() => save(pending)}
        >
          <p>
            Existing property assignments and history remain. Inactive profiles
            cannot receive new assignments. Review any active listings before
            proceeding.
          </p>
        </ConfirmDialog>
      )}
      {editing !== undefined && (
        <Modal
          title={`${editing ? "Edit" : "New"} ${noun}`}
          onClose={() => setEditing(undefined)}
        >
          <form className="modal-form" onSubmit={submit}>
            {error && (
              <State tone="error">
                {error}
                <button onClick={() => window.location.reload()}>Retry</button>
              </State>
            )}
            <label>
              Name
              <input name="name" required defaultValue={editing?.name} />
            </label>
            <label>
              Email
              <input name="email" type="email" defaultValue={editing?.email} />
            </label>
            <label>
              Phone
              <input name="phone" defaultValue={editing?.phone} />
            </label>
            {!agencies && (
              <>
                <label>
                  WhatsApp
                  <input
                    name="whatsapp"
                    defaultValue={(editing as Agent | null)?.whatsapp}
                  />
                </label>
                <label>
                  Agency
                  <select
                    name="agency"
                    defaultValue={(editing as Agent | null)?.agency?._id || ""}
                  >
                    <option value="">Unassigned</option>
                    {agencyList
                      .filter(
                        (a) =>
                          a.status === "active" ||
                          a._id === (editing as Agent | null)?.agency?._id,
                      )
                      .map((a) => (
                        <option key={a._id} value={a._id}>
                          {a.name}
                        </option>
                      ))}
                  </select>
                </label>
              </>
            )}
            {agencies && (
              <>
                <label>
                  Website
                  <input
                    name="website"
                    type="url"
                    defaultValue={(editing as Agency | null)?.website}
                  />
                </label>
                <label>
                  Description
                  <textarea
                    name="description"
                    defaultValue={(editing as Agency | null)?.description}
                  />
                </label>
              </>
            )}
            <label>
              Verification
              <select
                name="verificationStatus"
                defaultValue={editing?.verificationStatus || "unverified"}
              >
                {["unverified", "pending", "verified", "rejected"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select name="status" defaultValue={editing?.status || "active"}>
                <option>active</option>
                <option>inactive</option>
              </select>
            </label>
            <div className="form-actions">
              <button type="button" onClick={() => setEditing(undefined)}>
                Cancel
              </button>
              <button className="primary" disabled={busy}>
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
