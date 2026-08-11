"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/radix";
const statuses = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];
export function OrderStatus({ id, status }: { id: string; status: string }) {
  const router = useRouter(),
    [busy, setBusy] = useState(false);
  async function change(value: string) {
    setBusy(true);
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value }),
    });
    setBusy(false);
    router.refresh();
  }
  return (
    <Select
      className="adm-select"
      disabled={busy}
      value={status}
      onValueChange={change}
      options={statuses.map((value) => ({ value, label: value }))}
    />
  );
}
