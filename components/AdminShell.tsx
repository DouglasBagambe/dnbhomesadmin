"use client";
import { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  CalendarDays,
  Inbox,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserCog,
  UsersRound,
  Menu,
} from "lucide-react";
import { FeedbackProvider, OperationFeedback } from "./Feedback";
import { useSession } from "./Session";
import { Brand, ThemeControl } from "./ThemeControl";
import { Modal } from "./Modal";
import { State } from "./PageState";
import { canAccess, label } from "../lib/presentation.mjs";
const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/agents", label: "Agents", icon: UsersRound },
  { href: "/agencies", label: "Agencies", icon: Building2 },
  { href: "/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/audit", label: "Audit", icon: ShieldCheck },
  { href: "/admins", label: "Administrators", icon: UserCog },
];
export function AdminShell({ children }: { children: ReactNode }) {
  const admin = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function logout() {
    setBusy(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      router.replace("/login");
      router.refresh();
    } catch {
      setError("Unable to sign out. Please try again.");
      setBusy(false);
    }
  }
  const navigation = (
    <>
      <Brand />
      <nav aria-label="Administration">
        {links
          .filter((item) => canAccess(admin?.role, item.href))
          .map(({ href, label: text, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname.startsWith(href) ? "page" : undefined}
              className={pathname.startsWith(href) ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              {text}
            </Link>
          ))}
      </nav>
      <div className="sidebar-bottom">
        <span className="subtle">dnb · Operations</span>
        <button className="signout" disabled={busy} onClick={logout}>
          <LogOut size={17} />
          {busy ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </>
  );
  return (
    <FeedbackProvider>
      <div className="admin-shell">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <aside className="admin-sidebar">{navigation}</aside>
        {open && (
          <Modal
            title="Navigation"
            className="nav-drawer"
            onClose={() => setOpen(false)}
          >
            {navigation}
          </Modal>
        )}
        <div className="workspace">
          <header className="workspace-header">
            <div className="workspace-context">
              <button
                className="menu-trigger"
                aria-label="Open navigation"
                aria-expanded={open}
                onClick={() => setOpen(true)}
              >
                <Menu size={20} />
              </button>
              <span>
                Homes /{" "}
                <strong>
                  {links.find((item) => pathname.startsWith(item.href))
                    ?.label || "Operations"}
                </strong>
              </span>
            </div>
            <div className="workspace-tools">
              <ThemeControl />
              <div className="identity">
                <strong>{admin?.name}</strong>
                <span>{label(admin?.role)}</span>
              </div>
            </div>
          </header>
          <main id="main-content" className="admin-main">
            <OperationFeedback />
            {error && <State tone="error">{error}</State>}
            {links.some(
              (item) =>
                pathname.startsWith(item.href) &&
                !canAccess(admin?.role, item.href),
            ) ? (
              <State tone="error">Your role cannot access this page.</State>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </FeedbackProvider>
  );
}
