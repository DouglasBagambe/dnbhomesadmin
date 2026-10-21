"use client";
import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
export function UnsavedChanges({ dirty }: { dirty: boolean }) {
  const [leave, setLeave] = useState<(() => void) | null>(null);
  const allowed = useRef(false);
  const dirtyRef = useRef(dirty);
  const guarded = useRef(false);
  useEffect(() => {
    dirtyRef.current = dirty;
    if (!dirty || guarded.current) return;
    guarded.current = true;
    history.pushState(
      { ...history.state, homesEditorGuard: true },
      "",
      location.href,
    );
  }, [dirty]);
  useEffect(() => {
    const href = location.href;
    const unload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current && !allowed.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const click = (e: MouseEvent) => {
      if (
        !dirtyRef.current ||
        allowed.current ||
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const link = (e.target as Element).closest<HTMLAnchorElement>("a[href]");
      if (
        !link ||
        link.target === "_blank" ||
        link.hasAttribute("download") ||
        link.href === location.href ||
        link.getAttribute("href")?.startsWith("#")
      )
        return;
      e.preventDefault();
      e.stopPropagation();
      setLeave(() => () => {
        allowed.current = true;
        location.assign(link.href);
      });
    };
    const back = () => {
      if (allowed.current || !guarded.current) return;
      if (!dirtyRef.current) {
        allowed.current = true;
        history.back();
        return;
      }
      history.pushState({ ...history.state, homesEditorGuard: true }, "", href);
      setLeave(() => () => {
        allowed.current = true;
        history.go(-2);
      });
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", click, true);
    window.addEventListener("popstate", back);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", click, true);
      window.removeEventListener("popstate", back);
    };
  }, []);
  return leave && dirty ? (
    <ConfirmDialog
      title="Discard unsaved changes?"
      action="Discard and leave"
      destructive
      onClose={() => setLeave(null)}
      onConfirm={() => leave()}
    >
      <p>
        Your property changes have not been saved. Stay here to keep working, or
        discard them before leaving.
      </p>
    </ConfirmDialog>
  ) : null;
}
