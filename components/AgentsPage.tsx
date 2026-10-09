/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Modal } from "./Modal";
import { friendlyError } from "../lib/presentation.mjs";
import { FormEvent, useEffect, useState } from "react";
import { api, ApiPage } from "../lib/api";
import { Agency, Agent } from "../lib/types";
import { PageHeader, State } from "./PageState";
export function AgentsPage({ agencies = false }: { agencies?: boolean }) {
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
      agencies ? "/agencies?limit=100" : "/agents?limit=100",
    )
      .then((r) => {
        setItems(r.data);
        setLoaded(true);
      })
      .catch((e) => setError(friendlyError(e)));
  useEffect(() => {
    load();
    if (!agencies)
      api<ApiPage<Agency>>("/agencies?limit=100")
        .then((r) => setAgencyList(r.data))
        .catch((e) => setError(friendlyError(e)));
  }, [agencies]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
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
      load();
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }
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
      <div className="record-list">
        {items.map((item) => (
          <article key={item._id}>
            <div>
              <strong>{item.name}</strong>
              <span>{item.email || "No email"}</span>
            </div>
            <span className={`badge ${item.status}`}>{item.status}</span>
            <span className={`badge ${item.verificationStatus}`}>
              {item.verificationStatus}
            </span>
            <button onClick={() => setEditing(item)}>Edit</button>
          </article>
        ))}
      </div>
      {!loaded && !error && <State>Loading records…</State>}
      {loaded && !items.length && !error && (
        <State>No {noun} records yet.</State>
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
                    {agencyList.map((a) => (
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
