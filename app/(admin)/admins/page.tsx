"use client";
import { FormEvent, useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { friendlyError, label } from "../../../lib/presentation.mjs";
import { AdminUser } from "../../../lib/types";
import { PageHeader, State, Badge } from "../../../components/PageState";
import { Modal } from "../../../components/Modal";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { useSession } from "../../../components/Session";
import { useFeedback } from "../../../components/Feedback";
export default function Admins() {
  const admin = useSession(),
    { notify } = useFeedback();
  const [items, setItems] = useState<AdminUser[]>([]),
    [editing, setEditing] = useState<AdminUser | null | undefined>(),
    [busy, setBusy] = useState(false),
    [loaded, setLoaded] = useState(false),
    [error, setError] = useState(""),
    [pending, setPending] = useState<Record<string, FormDataEntryValue>>();
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
  async function save(values: Record<string, FormDataEntryValue>) {
    setBusy(true);
    setError("");
    try {
      const payload = { ...values };
      if (!payload.password) delete payload.password;
      await api(editing ? `/admins/${editing._id || editing.id}` : "/admins", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      setEditing(undefined);
      setPending(undefined);
      notify(
        "Administrator saved. Role, status and password changes revoke existing sessions.",
      );
      await load();
    } catch (e) {
      setError(friendlyError(e));
      throw e;
    } finally {
      setBusy(false);
    }
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    if (
      editing &&
      values.status === "suspended" &&
      editing.status !== "suspended"
    ) {
      setPending(values);
      return;
    }
    void save(values).catch(() => {});
  }
  if (admin?.role !== "super_admin")
    return <State tone="error">Super administrator access required.</State>;
  return (
    <>
      <PageHeader
        eyebrow="Access control"
        title="Administrators"
        description="Manage role-scoped access. The last active super administrator is protected by the API."
        actions={
          <button
            className="primary"
            onClick={() => {
              setError("");
              setEditing(null);
            }}
          >
            New administrator
          </button>
        }
      />
      {error && editing === undefined && (
        <State tone="error">
          {error}
          <button onClick={() => void load()}>Retry</button>
        </State>
      )}
      {!loaded && !error && <State>Loading administrators…</State>}
      <div className="table-wrap">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Administrator</th>
              <th>Role</th>
              <th>Status</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id || item.id}>
                <td>
                  <strong>
                    {item.name}
                    {(item._id || item.id) === (admin._id || admin.id)
                      ? " · You"
                      : ""}
                  </strong>
                  <span>{item.email}</span>
                </td>
                <td data-label="Role">{label(item.role)}</td>
                <td data-label="Status">
                  <Badge value={item.status} />
                </td>
                <td>
                  <button
                    onClick={() => {
                      setError("");
                      setEditing(item);
                    }}
                  >
                    Manage access
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing !== undefined && (
        <Modal
          title={editing ? `Manage ${editing.name}` : "New administrator"}
          onClose={() => {
            if (!busy) setEditing(undefined);
          }}
        >
          <form className="modal-form" onSubmit={submit}>
            {error && <State tone="error">{error}</State>}
            <label>
              Name
              <input name="name" required defaultValue={editing?.name} />
            </label>
            {!editing && (
              <label>
                Email
                <input name="email" type="email" required />
              </label>
            )}
            <label>
              Role
              <select name="role" defaultValue={editing?.role || "editor"}>
                {["editor", "admin", "super_admin"].map((v) => (
                  <option key={v} value={v}>
                    {label(v)}
                  </option>
                ))}
              </select>
            </label>
            {editing && (
              <label>
                Status
                <select name="status" defaultValue={editing.status}>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </label>
            )}
            <label>
              {editing
                ? "New temporary password (optional)"
                : "Temporary password"}
              <input
                name="password"
                type="password"
                minLength={12}
                required={!editing}
                autoComplete="new-password"
              />
              <small>
                At least 12 characters. Share securely with the intended
                administrator.
              </small>
            </label>
            {editing && (
              <p className="warning-panel">
                Suspension, role changes and password changes revoke sessions
                immediately. Reactivation does not restore old sessions.
              </p>
            )}
            <div className="form-actions">
              <button
                type="button"
                disabled={busy}
                onClick={() => setEditing(undefined)}
              >
                Cancel
              </button>
              <button className="primary" disabled={busy}>
                {busy ? "Saving…" : "Save administrator"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {pending && (
        <ConfirmDialog
          title="Suspend administrator?"
          action="Suspend and revoke sessions"
          destructive
          onClose={() => setPending(undefined)}
          onConfirm={() => save(pending)}
        >
          <p>
            <strong>{editing?.name}</strong> will lose access immediately and
            must sign in again after reactivation.
          </p>
        </ConfirmDialog>
      )}
    </>
  );
}
