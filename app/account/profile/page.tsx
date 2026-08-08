import { AccountShell } from "@/components/account-shell";
export default function Page() {
  return (
    <AccountShell>
      <div>
        <h1 className="section-title">Profile</h1>
        <form className="card mt-7 grid gap-4 p-6 md:grid-cols-2">
          <label>
            <span className="label">Full name</span>
            <input className="field" defaultValue="Aman Sharma" />
          </label>
          <label>
            <span className="label">Mobile</span>
            <input className="field" defaultValue="9876543210" />
          </label>
          <label>
            <span className="label">Email</span>
            <input className="field" defaultValue="aman@example.com" />
          </label>
          <button className="btn btn-dark self-end">Save changes</button>
        </form>
      </div>
    </AccountShell>
  );
}
