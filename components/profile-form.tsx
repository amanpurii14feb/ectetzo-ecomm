"use client";
import { useState } from "react";

export function ProfileForm({ initial }: { initial: { name: string; email: string; phone: string } }) {
  const [form, setForm] = useState(initial), [message, setMessage] = useState(""), [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    const r = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const body = await r.json().catch(() => ({}));
    setMessage(r.ok ? "Profile updated successfully." : body.error ?? "Could not update profile."); setBusy(false);
  }
  return <form onSubmit={submit} className="card mt-7 grid gap-4 p-6 md:grid-cols-2">
    <label><span className="label">Full name</span><input className="field" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
    <label><span className="label">Mobile</span><input className="field" inputMode="numeric" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value.replace(/\D/g,"").slice(0,10)})}/></label>
    <label><span className="label">Email</span><input className="field" value={form.email} disabled/><small className="muted">Email cannot be changed here.</small></label>
    <button disabled={busy} className="btn btn-dark self-end">{busy?"Saving...":"Save changes"}</button>
    {message&&<p className="md:col-span-2 text-sm" role="status">{message}</p>}
  </form>;
}
