"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { PageHeader, StatusBadge } from "./ui";
import { Checkbox } from "@/components/ui/radix";
export type AP = {
  id: string;
  legacyId: number;
  name: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  mrp: number;
  stock: number;
  active: boolean;
  color: string | null;
  images: string[];
  updatedAt: string;
};
export function ProductsTable({ initial }: { initial: AP[] }) {
  const [rows, setRows] = useState(initial),
    [q, setQ] = useState(""),
    [tab, setTab] = useState("all"),
    [selected, setSelected] = useState<string[]>([]),
    [page, setPage] = useState(1),
    [confirm, setConfirm] = useState<AP | null>(null),
    [toast, setToast] = useState("");
  const size = 10;
  const filtered = useMemo(
    () =>
      rows.filter(
        (p) =>
          (tab === "all" || (tab === "active" ? p.active : !p.active)) &&
          `${p.name} ${p.brand} ${p.category} VZ-${p.legacyId}`
            .toLowerCase()
            .includes(q.toLowerCase()),
      ),
    [rows, q, tab],
  );
  const visible = filtered.slice((page - 1) * size, page * size);
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  async function remove() {
    if (!confirm) return;
    const r = await fetch(`/api/admin/products/${confirm.id}`, {
      method: "DELETE",
    });
    const b = await r.json();
    if (r.ok) {
      setRows((x) =>
        b.archived
          ? x.map((p) => (p.id === confirm.id ? { ...p, active: false } : p))
          : x.filter((p) => p.id !== confirm.id),
      );
      setToast(b.message ?? "Product deleted");
    }
    setConfirm(null);
  }
  function exportCsv() {
    const csv = [
      "SKU,Product,Status,Inventory,Category,Brand,Price",
      ...filtered.map(
        (p) =>
          `VZ-${p.legacyId},"${p.name.replaceAll('"', '""')}",${p.active ? "Active" : "Archived"},${p.stock},"${p.category}","${p.brand}",${p.price}`,
      ),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "electzo-products.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  return (
    <>
      <PageHeader
        title="Products"
        description="Manage catalogue, pricing and inventory."
        actions={
          <>
            <button className="adm-btn">
              <Upload />
              Import
            </button>
            <button className="adm-btn" onClick={exportCsv}>
              <Download />
              Export
            </button>
            <Link className="adm-btn primary" href="/admin/products/new">
              <Plus />
              Add product
            </Link>
          </>
        }
      />
      {toast && (
        <div className="adm-toast">
          {toast}
          <button onClick={() => setToast("")}>×</button>
        </div>
      )}
      <section className="adm-panel adm-list-panel">
        <div className="adm-tabs">
          {[
            ["all", "All"],
            ["active", "Active"],
            ["archived", "Archived"],
          ].map(([v, l]) => (
            <button
              key={v}
              className={tab === v ? "active" : ""}
              onClick={() => {
                setTab(v);
                setPage(1);
              }}
            >
              {l}
              <span>
                {v === "all"
                  ? rows.length
                  : rows.filter((p) => p.active === (v === "active")).length}
              </span>
            </button>
          ))}
        </div>
        <div className="adm-filterbar">
          <label>
            <Search />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, SKU or brand"
            />
          </label>
          <select>
            <option>All categories</option>
            {[...new Set(rows.map((p) => p.category))].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select>
            <option>All inventory</option>
            <option>In stock</option>
            <option>Low stock</option>
            <option>Out of stock</option>
          </select>
        </div>
        {selected.length > 0 && (
          <div className="adm-bulk">
            <b>{selected.length} selected</b>
            <button>
              <Archive /> Archive
            </button>
            <button>
              <Download /> Export
            </button>
            <button className="danger">
              <Trash2 /> Delete
            </button>
          </div>
        )}
        <div className="adm-table-scroll">
          <table className="adm-data products">
            <thead>
              <tr>
                <th>
                  <Checkbox
                    checked={
                      visible.length > 0 &&
                      visible.every((p) => selected.includes(p.id))
                    }
                    onCheckedChange={(checked) =>
                      setSelected(
                        checked
                          ? [
                              ...new Set([
                                ...selected,
                                ...visible.map((p) => p.id),
                              ]),
                            ]
                          : selected.filter(
                              (id) => !visible.some((p) => p.id === id),
                            ),
                      )
                    }
                  />
                </th>
                <th>Product</th>
                <th>Status</th>
                <th>Inventory</th>
                <th>Category</th>
                <th>Vendor</th>
                <th>Price</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Checkbox
                      checked={selected.includes(p.id)}
                      onCheckedChange={() =>
                        setSelected((s) =>
                          s.includes(p.id)
                            ? s.filter((x) => x !== p.id)
                            : [...s, p.id],
                        )
                      }
                    />
                  </td>
                  <td>
                    <div className="adm-product">
                      <span style={{ background: p.color ?? "#eee" }}>
                        {p.images?.[0] ? <img src={p.images[0]} alt="" /> : "E"}
                      </span>
                      <p>
                        <Link href={`/admin/products/${p.id}/edit`}>
                          {p.name}
                        </Link>
                        <small>
                          SKU VZ-{String(p.legacyId).padStart(5, "0")}
                        </small>
                      </p>
                    </div>
                  </td>
                  <td>
                    <StatusBadge tone={p.active ? "success" : "neutral"}>
                      {p.active ? "Active" : "Archived"}
                    </StatusBadge>
                  </td>
                  <td>
                    <b className={p.stock <= 5 ? "low" : ""}>{p.stock}</b>{" "}
                    available
                  </td>
                  <td>{p.category}</td>
                  <td>{p.brand}</td>
                  <td>₹{p.price.toLocaleString("en-IN")}</td>
                  <td>{new Date(p.updatedAt).toLocaleDateString("en-IN")}</td>
                  <td>
                    <div className="adm-row-actions">
                      <Link href={`/admin/products/${p.id}/edit`}>
                        <MoreHorizontal />
                      </Link>
                      <button title="Duplicate">
                        <Copy />
                      </button>
                      <button className="danger" onClick={() => setConfirm(p)}>
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length && (
            <div className="adm-empty-state">
              <div>◇</div>
              <h3>No products found</h3>
              <p>Try changing your search or filters.</p>
            </div>
          )}
        </div>
        <footer className="adm-pagination">
          <span>
            Showing {filtered.length ? (page - 1) * size + 1 : 0}–
            {Math.min(page * size, filtered.length)} of {filtered.length}
          </span>
          <div>
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft />
            </button>
            <b>
              Page {page} of {pages}
            </b>
            <button
              disabled={page === pages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight />
            </button>
          </div>
        </footer>
      </section>
      {confirm && (
        <div
          className="adm-dialog-shade"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setConfirm(null);
          }}
        >
          <div className="adm-dialog" role="dialog" aria-modal="true">
            <span className="danger">
              <Trash2 />
            </span>
            <h2>Remove product?</h2>
            <p>
              “{confirm.name}” will be permanently deleted unless it has order
              history, in which case it will be archived.
            </p>
            <footer>
              <button className="adm-btn" onClick={() => setConfirm(null)}>
                Cancel
              </button>
              <button className="adm-btn danger" onClick={remove}>
                Remove product
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
