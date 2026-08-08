import { AccountShell } from "@/components/account-shell";
export default function Page() {
  return (
    <AccountShell>
      <div>
        <h1 className="section-title">Addresses</h1>
        <div className="card mt-7 p-6">
          <span className="rounded bg-paper px-2 py-1 text-xs font-bold">
            HOME
          </span>
          <b className="mt-4 block">Aman Puri</b>
          <p className="mt-2 max-w-md text-sm leading-6 muted">
            12, Rajiv Chawk, New Delhi, 110044
            <br />
            Mobile: 9876543210
          </p>
          <div className="mt-4 flex gap-4 text-sm font-bold">
            <button>Edit</button>
            <button className="text-red-600">Delete</button>
          </div>
        </div>
        <button className="btn btn-outline mt-4">+ Add new address</button>
      </div>
    </AccountShell>
  );
}
