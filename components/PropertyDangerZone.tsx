"use client";
import { BrandLoading } from "./BrandLoading";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import { Modal } from "./Modal";
import { State } from "./PageState";
import { ConfirmDialog } from "./ConfirmDialog";
import { useFeedback } from "./Feedback";
import { useSession } from "./Session";
import { friendlyError } from "../lib/presentation.mjs";
type Dependencies = {
  title: string;
  viewings: number;
  media: number;
  historyPolicy: string;
};
export function PropertyDangerZone({
  id,
  title,
  status,
  dirty,
  onStatus,
  onDeleted,
}: {
  id: string;
  title: string;
  status: string;
  dirty: boolean;
  onStatus: (status: string) => void;
  onDeleted: () => void;
}) {
  const admin = useSession(),
    router = useRouter(),
    { notify } = useFeedback();
  const [mode, setMode] = useState<"archive" | "restore" | "delete" | null>(
    null,
  );
  const [dependencies, setDependencies] = useState<Dependencies>();
  const [typed, setTyped] = useState(""),
    [second, setSecond] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  if (!admin || admin.role === "editor") return null;
  async function prepareDelete() {
    setMode("delete");
    setTyped("");
    setSecond(false);
    setDependencies(undefined);
    setError("");
    try {
      setDependencies(
        (await api<{ data: Dependencies }>(`/properties/${id}/dependencies`))
          .data,
      );
    } catch (e) {
      setError(friendlyError(e));
    }
  }
  return (
    <section className="danger-zone">
      <header>
        <h2>Danger zone</h2>
        <p>
          Archive to hide this listing while keeping it available for future
          work.
        </p>
      </header>
      {dirty && (
        <p className="muted">
          Save or discard your changes before using these actions.
        </p>
      )}
      <div className="action-row">
        <button
          type="button"
          disabled={dirty}
          onClick={() => setMode(status === "archived" ? "restore" : "archive")}
        >
          {status === "archived" ? "Restore to draft" : "Archive property"}
        </button>
        {admin.role === "super_admin" && (
          <button
            type="button"
            disabled={dirty}
            className="danger-text"
            onClick={() => void prepareDelete()}
          >
            Permanently delete property
          </button>
        )}
      </div>
      {(mode === "archive" || mode === "restore") && (
        <ConfirmDialog
          title={mode === "archive" ? "Archive property?" : "Restore property?"}
          action={mode === "archive" ? "Archive property" : "Restore to draft"}
          destructive={mode === "archive"}
          onClose={() => setMode(null)}
          onConfirm={async () => {
            const next = mode === "archive" ? "archived" : "draft";
            await api(`/properties/${id}`, {
              method: "PATCH",
              body: JSON.stringify({ status: next }),
            });
            onStatus(next);
            notify(
              next === "draft"
                ? "Property restored to draft."
                : "Property archived.",
            );
          }}
        >
          <p>
            <strong>{title}</strong>{" "}
            {mode === "archive"
              ? "will be removed from public discovery. History is retained."
              : "will return to draft. Review it before publishing."}
          </p>
        </ConfirmDialog>
      )}
      {mode === "delete" && (
        <Modal
          title={second ? "Final confirmation" : "Permanently delete property"}
          onClose={() => {
            if (!busy) setMode(null);
          }}
        >
          <div className="modal-form">
            <p className="danger-copy">
              <strong>{title}</strong>
            </p>
            <p>
              This is irreversible. The listing disappears permanently.
              Historical viewing requests and audit events remain.
            </p>
            {dependencies ? (
              <>
                <div className="dependency-summary">
                  <strong>
                    {dependencies.viewings} viewing records retained
                  </strong>
                  <span>
                    {dependencies.media} media items checked for shared use
                  </span>
                </div>
                <p className="muted">{dependencies.historyPolicy}</p>
              </>
            ) : (
              !error && <BrandLoading label="Checking dependencies…" />
            )}
            {error && (
              <State tone="error">
                {error}
                <button type="button" onClick={() => void prepareDelete()}>
                  Retry dependency check
                </button>
              </State>
            )}
            {!second ? (
              <label>
                Type the property title or DELETE
                <input
                  autoComplete="off"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                />
              </label>
            ) : (
              <p role="alert">
                You have confirmed the property identity. Choose “Delete
                permanently” to complete this action.
              </p>
            )}
            <div className="form-actions">
              <button
                type="button"
                disabled={busy}
                onClick={() => setMode(null)}
              >
                Cancel
              </button>
              {!second ? (
                <button
                  type="button"
                  className="danger"
                  disabled={!dependencies || ![title, "DELETE"].includes(typed)}
                  onClick={() => setSecond(true)}
                >
                  Review permanent deletion
                </button>
              ) : (
                <button
                  type="button"
                  className="danger"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    setError("");
                    try {
                      const r = await api<{ data: { cleanupPending: number } }>(
                        `/properties/${id}`,
                        {
                          method: "DELETE",
                          body: JSON.stringify({
                            confirmation: typed,
                            confirmed: true,
                          }),
                        },
                      );
                      onDeleted();
                      notify(
                        r.data.cleanupPending
                          ? `Property deleted. ${r.data.cleanupPending} storage items await cleanup; see the deletion recovery guide.`
                          : "Property permanently deleted. Viewing history retained.",
                      );
                      router.replace("/properties");
                    } catch (e) {
                      setError(friendlyError(e));
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {busy ? "Deleting…" : "Delete permanently"}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
