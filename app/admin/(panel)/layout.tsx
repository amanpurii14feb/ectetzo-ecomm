import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/admin/components/admin-shell";
import "../admin.css";
export default async function Layout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return <AdminShell admin={{ name: admin.name ?? "Administrator", email: admin.email ?? "" }}>{children}</AdminShell>;
}
