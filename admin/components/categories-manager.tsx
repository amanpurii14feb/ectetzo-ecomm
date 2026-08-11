"use client";
import { useState } from "react";
import { Edit3, Plus, Trash2, X } from "lucide-react";
import { PageHeader, StatusBadge } from "./ui";
import { Switch } from "@/components/ui/radix";
type Row = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  products: number;
};
const blank = { name: "", slug: "", active: true };
export function CategoriesManager({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial),
    [editing, setEditing] = useState<Row | "new" | null>(null),
    [form, setForm] = useState(blank),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  function open(row?: Row) {
    setEditing(row ?? "new");
    setForm(
      row ? { name: row.name, slug: row.slug, active: row.active } : blank,
    );
    setError("");
  }
  async function save() {
    setBusy(true);
    setError("");
    const old = editing !== "new" ? editing : null;
    const r = await fetch(
      old ? `/api/admin/categories/${old.id}` : "/api/admin/categories",
      {
        method: old ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      },
    );
    const b = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) {
      setError(b.error ?? "Could not save category.");
      return;
    }
    const c = b.category as Omit<Row, "products">;
    setRows((x) =>
      old
        ? x.map((i) => (i.id === old.id ? { ...c, products: i.products } : i))
        : [...x, { ...c, products: 0 }].sort((a, z) =>
            a.name.localeCompare(z.name),
          ),
    );
    setEditing(null);
  }
  async function remove(row: Row) {
    if (!confirm(`Delete “${row.name}”?`)) return;
    const r = await fetch(`/api/admin/categories/${row.id}`, {
      method: "DELETE",
    });
    const b = await r.json().catch(() => ({}));
    if (!r.ok) {
      alert(b.error ?? "Could not delete category.");
      return;
    }
    setRows((x) => x.filter((i) => i.id !== row.id));
  }
  return (
    <>
      <PageHeader
        title="Categories"
        description="Manage the categories available while adding products."
        actions={
          <button className="adm-btn primary" onClick={() => open()}>
            <Plus />
            Add category
          </button>
        }
      />
      <section className="adm-panel adm-list-panel">
        <div className="adm-table-scroll">
          <table className="adm-data">
            <thead>
              <tr>
                <th>Category</th>
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
                  <td>/category/{row.slug}</td>
                  <td>{row.products}</td>
                  <td>
                    <StatusBadge tone={row.active ? "success" : "neutral"}>
                      {row.active ? "Active" : "Inactive"}
                    </StatusBadge>
                  </td>
                  <td>
                    <div className="adm-row-actions">
                      <button title="Edit" onClick={() => open(row)}>
                        <Edit3 />
                      </button>
                      <button
                        className="danger"
                        title="Delete"
                        onClick={() => remove(row)}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <div className="adm-empty-state">
              <div>◇</div>
              <h3>No categories yet</h3>
              <p>Add your first category to use it in the product form.</p>
            </div>
          )}
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
            <h2>{editing === "new" ? "Add category" : "Edit category"}</h2>
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
                {busy ? "Saving..." : "Save category"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
