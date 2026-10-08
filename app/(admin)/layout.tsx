import { SessionProvider } from "../../components/Session";
import { AdminShell } from "../../components/AdminShell"; export default function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <SessionProvider><AdminShell>{children}</AdminShell></SessionProvider>; }
