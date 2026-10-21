"use client";
import { ReactNode, useState } from "react";
import { Modal } from "./Modal";
import { State } from "./PageState";
import { friendlyError } from "../lib/presentation.mjs";
export function ConfirmDialog({
  title,
  children,
  action = "Confirm",
  destructive = false,
  onConfirm,
  onClose,
}: {
  title: string;
  children: ReactNode;
  action?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <Modal
      title={title}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <div className="modal-form">
        {children}
        {error && <State tone="error">{error}</State>}
        <div className="form-actions">
          <button type="button" disabled={busy} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={destructive ? "danger" : "primary"}
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                await onConfirm();
                onClose();
              } catch (e) {
                setError(friendlyError(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Working…" : action}
          </button>
        </div>
      </div>
    </Modal>
  );
}
