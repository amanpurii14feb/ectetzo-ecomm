"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export function MarkDeliveredButton({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function markDelivered() {
    setBusy(true);
    setError("");
    const response = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark-delivered" }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) setError(result.error || "Could not update the order.");
    else router.refresh();
    setBusy(false);
  }

  return (
    <div>
      <button disabled={busy} onClick={markDelivered} className="btn btn-dark mt-5">
        <CheckCircle2 size={17} />
        {busy ? "Updating…" : "Mark as delivered"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
