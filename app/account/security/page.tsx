import { AccountShell } from "@/components/account-shell";
import { SecurityPanel } from "@/components/security-panel";

export default function Page() {
  return <AccountShell><div><div className="account-section-heading"><div><h1>Account &amp; Security</h1><p>Manage your account security and preferences.</p></div></div><SecurityPanel/></div></AccountShell>;
}
