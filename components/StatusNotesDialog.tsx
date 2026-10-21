"use client";
import { ReactNode, useState } from "react";
import { api } from "../lib/api";
import { label, friendlyError } from "../lib/presentation.mjs";
import { unusualTransition } from "../lib/operations.mjs";
import { Modal } from "./Modal";
import { State } from "./PageState";
import { useFeedback } from "./Feedback";
export function StatusNotesDialog({
  title,
  status,
  notes = "",
  options,
  path,
  children,
  viewing = false,
  onClose,
  onSaved,
}: {
  title: string;
  status: string;
  notes?: string;
  options: string[];
  path: string;
  children: ReactNode;
  viewing?: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [next, setNext] = useState(status),
    [adminNotes, setNotes] = useState(notes),
    [ack, setAck] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const { notify } = useFeedback();
  const unusual = viewing && unusualTransition(status, next);
  return (
    <Modal
      title={title}
      onClose={() => {
        if (!busy) onClose();
      }}
      className="detail-modal"
    >
      <form
        className="modal-form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (unusual && !ack) return;
          setBusy(true);
          setError("");
          try {
            await api(path, {
              method: "PATCH",
              body: JSON.stringify({ status: next, adminNotes }),
            });
            notify("Status and internal notes saved.");
            onSaved();
            onClose();
          } catch (err) {
            setError(friendlyError(err));
          } finally {
            setBusy(false);
          }
        }}
      >
        {children}
        <label>
          Status
          <select
            value={next}
            onChange={(e) => {
              setNext(e.target.value);
              setAck(false);
            }}
          >
            {options.map((v) => (
              <option key={v} value={v}>
                {label(v)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Admin notes
          <textarea
            rows={4}
            maxLength={viewing ? 2000 : 5000}
            value={adminNotes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <small>Internal operations notes. Never shown to customers.</small>
        </label>
        {unusual && (
          <div className="warning-panel">
            <p>
              This reopens or changes a terminal viewing outcome. Review the
              history and explain the override in admin notes.
            </p>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
              />
              I confirm this unusual status transition
            </label>
          </div>
        )}
        {error && <State tone="error">{error}</State>}
        <div className="form-actions">
          <button type="button" disabled={busy} onClick={onClose}>
            Cancel
          </button>
          <button
            className="primary"
            disabled={busy || (unusual && (!ack || !adminNotes.trim()))}
          >
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
