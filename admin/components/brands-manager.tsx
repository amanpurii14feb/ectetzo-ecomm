"use client";
import { useState } from "react";
import { Edit3, Plus, Trash2, X } from "lucide-react";
import { PageHeader, StatusBadge } from "./ui";
import { Switch } from "@/components/ui/radix";
type R = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  products: number;
};
const empty = { name: "", slug: "", active: true };
export function BrandsManager({ initial }: { initial: R[] }) {
  const [rows, setRows] = useState(initial),
    [editing, setEditing] = useState<R | "new" | null>(null),
    [form, setForm] = useState(empty),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  function open(row?: R) {
    setEditing(row ?? "new");
    setForm(
      row ? { name: row.name, slug: row.slug, active: row.active } : empty,
    );
    setError("");
  }
  async function save() {
    setBusy(true);
    setError("");
    const old = editing !== "new" ? editing : null,
      r = await fetch(
        old ? `/api/admin/brands/${old.id}` : "/api/admin/brands",
        {
          method: old ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      ),
      b = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) {
      setError(b.error ?? "Could not save brand.");
      return;
    }
    const brand = b.brand as Omit<R, "products">;
    setRows((x) =>
      old
        ? x.map((i) =>
            i.id === old.id ? { ...brand, products: i.products } : i,
          )
        : [...x, { ...brand, products: 0 }].sort((a, z) =>
            a.name.localeCompare(z.name),
          ),
    );
    setEditing(null);
  }
  async function remove(row: R) {
    if (!confirm(`Delete “${row.name}”?`)) return;
    const r = await fetch(`/api/admin/brands/${row.id}`, { method: "DELETE" }),
      b = await r.json().catch(() => ({}));
    if (!r.ok) {
      alert(b.error ?? "Could not delete brand.");
      return;
    }
    setRows((x) => x.filter((i) => i.id !== row.id));
  }
  return (
    <>
      <PageHeader
        title="Brands"
        description="Manage the brands available while adding products."
        actions={
          <button className="adm-btn primary" onClick={() => open()}>
            <Plus />
            Add brand
          </button>
        }
      />
      <section className="adm-panel adm-list-panel">
        <div className="adm-table-scroll">
          <table className="adm-data">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Storefront URL</th>
                <th>Products</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <b>{row.name}</b>
                  </td>
                  <td>/brand/{row.slug}</td>
                  <td>{row.products}</td>
                  <td>
                    <StatusBadge tone={row.active ? "success" : "neutral"}>
                      {row.active ? "Active" : "Inactive"}
                    </StatusBadge>
                  </td>
                  <td>
                    <div className="adm-row-actions">
                      <button onClick={() => open(row)}>
                        <Edit3 />
                      </button>
                      <button className="danger" onClick={() => remove(row)}>
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {editing && (
        <div
          className="adm-dialog-shade"
          onMouseDown={(e) => e.target === e.currentTarget && setEditing(null)}
        >
          <div className="adm-dialog">
            <button className="adm-dialog-x" onClick={() => setEditing(null)}>
              <X />
            </button>
            <h2>{editing === "new" ? "Add brand" : "Edit brand"}</h2>
            {error && <div className="adm-form-alert">{error}</div>}
            <label className="adm-field">
              <b>Name</b>
              <input
                autoFocus
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((v) => ({
                    ...v,
                    name,
                    ...(editing === "new"
                      ? {
                          slug: name
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, ""),
                        }
                      : {}),
                  }));
                }}
              />
            </label>
            <label className="adm-field">
              <b>URL slug</b>
              <input
                value={form.slug}
                onChange={(e) =>
                  setForm((v) => ({
                    ...v,
                    slug: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, ""),
                  }))
                }
              />
            </label>
            <label className="adm-check">
              <Switch
                checked={form.active}
                onCheckedChange={(active) => setForm((v) => ({ ...v, active }))}
              />{" "}
              Active
            </label>
            <footer>
              <button className="adm-btn" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button
                className="adm-btn primary"
                disabled={busy}
                onClick={save}
              >
                {busy ? "Saving..." : "Save brand"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
