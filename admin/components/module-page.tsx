"use client";
import { useState } from "react";
import { Edit3, Plus, Trash2, X } from "lucide-react";
import type { AdminModule } from "../services/modules";
import { EmptyState, PageHeader, StatusBadge } from "./ui";
import { Select } from "@/components/ui/radix";
type Item = {
  id: string;
  name: string;
  status: string;
  data: Record<string, unknown>;
  updatedAt: string;
};
export function ModulePage({
  module,
  moduleKey,
  initial,
}: {
  module: AdminModule;
  moduleKey: string;
  initial: Item[];
}) {
  const [rows, setRows] = useState(initial),
    [editing, setEditing] = useState<Item | "new" | null>(null),
    [name, setName] = useState(""),
    [status, setStatus] = useState("Active"),
    [error, setError] = useState("");
  function open(item?: Item) {
    setEditing(item ?? "new");
    setName(item?.name ?? "");
    setStatus(item?.status ?? "Active");
    setError("");
  }
  async function save() {
    const old = editing !== "new" ? editing : null,
      r = await fetch(`/api/admin/modules/${moduleKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: old?.id,
          name,
          status,
          data: old?.data ?? {},
        }),
      }),
      b = await r.json().catch(() => ({}));
    if (!r.ok) {
      setError(b.error ?? "Could not save.");
      return;
    }
    const item = {
      ...b.item,
      updatedAt: new Date(b.item.updatedAt).toISOString(),
    };
    setRows((x) =>
      old ? x.map((i) => (i.id === old.id ? item : i)) : [item, ...x],
    );
    setEditing(null);
  }
  async function remove(item: Item) {
    if (!confirm(`Delete “${item.name}”?`)) return;
    const r = await fetch(`/api/admin/modules/${moduleKey}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id }),
    });
    if (r.ok) setRows((x) => x.filter((i) => i.id !== item.id));
  }
  return (
    <>
      <PageHeader
        title={module.title}
        description={module.description}
        actions={
          <button className="adm-btn primary" onClick={() => open()}>
            <Plus />
            {module.primary}
          </button>
        }
      />
      <section className="adm-panel adm-list-panel">
        {rows.length ? (
          <div className="adm-table-scroll">
            <table className="adm-data">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <b>{item.name}</b>
                    </td>
                    <td>
                      <StatusBadge
                        tone={
                          item.status === "Active" ||
                          item.status === "Published" ||
                          item.status === "Enabled"
                            ? "success"
                            : "neutral"
                        }
                      >
                        {item.status}
                      </StatusBadge>
                    </td>
                    <td>
                      {new Date(item.updatedAt).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      <div className="adm-row-actions">
                        <button onClick={() => open(item)}>
                          <Edit3 />
                        </button>
                        <button className="danger" onClick={() => remove(item)}>
                          <Trash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title={`No ${module.title.toLowerCase()} yet`}
            description={`Create your first ${module.title.toLowerCase()} item.`}
          />
        )}
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
            <h2>{module.primary}</h2>
            {error && <div className="adm-form-alert">{error}</div>}
            <label className="adm-field">
              <b>Name</b>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="adm-field">
              <b>Status</b>
              <Select
                value={status}
                onValueChange={setStatus}
                options={[
                  "Active",
                  "Draft",
                  "Inactive",
                  "Published",
                  "Enabled",
                ].map((value) => ({ value, label: value }))}
              />
            </label>
            <footer>
              <button className="adm-btn" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="adm-btn primary" onClick={save}>
                Save
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
