"use client";
import { Modal } from "../../../components/Modal";
import { friendlyError } from "../../../lib/presentation.mjs";
import { FormEvent, useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { AdminUser } from "../../../lib/types";
import { PageHeader, State } from "../../../components/PageState";
export default function Admins() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const load = () =>
    api<{ data: AdminUser[] }>("/admins")
      .then((r) => {
        setItems(r.data);
        setLoaded(true);
      })
      .catch((e) => setError(friendlyError(e)));
  useEffect(() => {
    void load();
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const values = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api("/admins", { method: "POST", body: JSON.stringify(values) });
      setOpen(false);
      await load();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="Access control"
        title="Administrators"
        description="Super administrators can provision role-scoped accounts."
        actions={
          <button className="primary" onClick={() => setOpen(true)}>
            New administrator
          </button>
        }
      />
      {error && (
        <State tone="error">
          {error}
          <button onClick={() => window.location.reload()}>Retry</button>
        </State>
      )}
      {!loaded && !error && <State>Loading administrators…</State>}
      {loaded && !items.length && !error && (
        <State>No administrator records.</State>
      )}
      <div className="record-list">
        {items.map((item) => (
          <article key={item._id || item.id}>
            <div>
              <strong>{item.name}</strong>
              <span>{item.email}</span>
            </div>
            <span className={`badge ${item.status}`}>{item.status}</span>
            <span className="badge">{item.role.replaceAll("_", " ")}</span>
          </article>
        ))}
      </div>
      {open && (
        <Modal title="New administrator" onClose={() => setOpen(false)}>
          <form className="modal-form" onSubmit={submit}>
            {error && (
              <State tone="error">
                {error}
                <button onClick={() => window.location.reload()}>Retry</button>
              </State>
            )}
            <label>
              Name
              <input name="name" required />
            </label>
            <label>
              Email
              <input name="email" type="email" required />
            </label>
            <label>
              Role
              <select name="role">
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super administrator</option>
              </select>
            </label>
            <label>
              Temporary password
              <input name="password" type="password" minLength={12} required />
            </label>
            <div className="form-actions">
              <button type="button" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="primary" disabled={busy}>
                {busy ? "Creating…" : "Create"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
