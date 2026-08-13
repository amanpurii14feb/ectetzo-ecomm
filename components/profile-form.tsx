"use client";
import { useState } from "react";
import { Mail, Phone, UserRound } from "lucide-react";

export function ProfileForm({ initial }: { initial: { name: string; email: string; phone: string } }) {
  const [form, setForm] = useState(initial), [message, setMessage] = useState(""), [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    const r = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const body = await r.json().catch(() => ({}));
    setMessage(r.ok ? "Profile updated successfully." : body.error ?? "Could not update profile."); setBusy(false);
  }
  return <form onSubmit={submit} className="profile-form card">
    <label><span className="label">Full name</span><span className="profile-field"><UserRound/><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></span></label>
    <label><span className="label">Mobile</span><span className="profile-field"><Phone/><input inputMode="numeric" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value.replace(/\D/g,"").slice(0,10)})}/></span></label>
    <label><span className="label">Email</span><span className="profile-field disabled"><Mail/><input value={form.email} disabled/></span><small className="muted">Email cannot be changed here.</small></label>
    <button disabled={busy} className="btn btn-dark self-end">{busy?"Saving...":"Save changes"}</button>
    {message&&<p className="md:col-span-2 text-sm" role="status">{message}</p>}
  </form>;
}
