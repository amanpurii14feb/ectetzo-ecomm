import { AccountShell } from "@/components/account-shell";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AccountShell>
      <div>
        <div className="eyebrow">Order #{id}</div>
        <h1 className="section-title mt-2">Order details</h1>
        <div className="card mt-7 p-6">
          <div className="grid grid-cols-4 text-center text-xs font-bold">
            <span className="text-green-700">Confirmed</span>
            <span className="text-green-700">Packed</span>
            <span className="text-green-700">Shipped</span>
            <span className="muted">Delivered</span>
          </div>
          <div className="mt-3 h-2 rounded bg-gradient-to-r from-green-600 from-0% via-green-600 via-70% to-gray-200 to-70%" />
          <p className="mt-7">
            <b>Expected delivery:</b> 12 August 2026
          </p>
          <p className="mt-2 muted">
            Shipping to 12, Residency Road, Bengaluru 560025
          </p>
        </div>
      </div>
    </AccountShell>
  );
}
