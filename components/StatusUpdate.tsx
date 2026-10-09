"use client";
import { useState } from "react";
import { api } from "../lib/api";
import { friendlyError, label } from "../lib/presentation.mjs";
export function StatusUpdate({
  status,
  options,
  path,
  name,
  onSaved,
}: {
  status: string;
  options: string[];
  path: string;
  name: string;
  onSaved: () => void;
}) {
  const [next, setNext] = useState(status);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function save() {
    setBusy(true);
    setMessage("");
    try {
      await api(path, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      setMessage("Status updated.");
      onSaved();
    } catch (e) {
      setMessage(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="status-update">
      <div>
        <select
          aria-label={`Status for ${name}`}
          disabled={busy}
          value={next}
          onChange={(e) => setNext(e.target.value)}
        >
          {options.map((value) => (
            <option key={value} value={value}>
              {label(value)}
            </option>
          ))}
        </select>
        <button disabled={busy || next === status} onClick={save}>
          {busy ? "Saving…" : "Update"}
        </button>
      </div>
      {message && <small role="status">{message}</small>}
    </div>
  );
}
