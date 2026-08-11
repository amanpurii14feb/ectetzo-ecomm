"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Eye,
  ImagePlus,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { PageHeader } from "./ui";
import { Checkbox, Select } from "@/components/ui/radix";
type P = {
  id?: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  mrp: number;
  stock: number;
  lowStockThreshold: number;
  costPrice: number | null;
  barcode: string | null;
  weightKg: number | null;
  dimensions: string | null;
  tags: string[];
  rating: number;
  reviews: number;
  badge: string | null;
  color: string | null;
  images: string[];
  active: boolean;
  specs: Record<string, string>;
};
const blank: P = {
  name: "",
  slug: "",
  brand: "",
  category: "",
  description: "",
  price: 0,
  mrp: 0,
  stock: 0,
  lowStockThreshold: 5,
  costPrice: null,
  barcode: null,
  weightKg: null,
  dimensions: null,
  tags: [],
  rating: 0,
  reviews: 0,
  badge: "",
  color: "#e9c74c",
  images: [],
  active: false,
  specs: { Warranty: "1 Year", Country: "India" },
};
export function ProductEditor({
  product,
  categories = [],
  brands = [],
}: {
  product?: P;
  categories?: string[];
  brands?: string[];
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [p, setP] = useState<P>(() =>
      product ? { ...product, images: product.images ?? [] } : blank,
    ),
    [specs, setSpecs] = useState(
      Object.entries(product?.specs ?? blank.specs)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n"),
    ),
    [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false),
    [error, setError] = useState(""),
    [dirty, setDirty] = useState(false);
  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    addEventListener("beforeunload", fn);
    return () => removeEventListener("beforeunload", fn);
  }, [dirty]);
  function set<K extends keyof P>(k: K, v: P[K]) {
    setP((x) => ({ ...x, [k]: v }));
    setDirty(true);
  }
  async function responseBody(response: Response) {
    const text = await response.text();
    if (!text) return {} as { error?: string; urls?: string[] };
    try {
      return JSON.parse(text) as { error?: string; urls?: string[] };
    } catch {
      return { error: text };
    }
  }
  async function upload(files: FileList | File[]) {
    const selected = Array.from(files);
    if (!selected.length) return;
    if ((p.images?.length ?? 0) + selected.length > 10) {
      setError("A product can have up to 10 images.");
      return;
    }
    setUploading(true);
    setError("");
    const form = new FormData();
    selected.forEach((file) => form.append("files", file));
    try {
      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: form,
      });
      const body = await responseBody(response);
      if (!response.ok) {
        setError(body.error ?? "Could not upload images");
        return;
      }
      set("images", [...(p.images ?? []), ...(body.urls ?? [])]);
    } catch {
      setError("Could not upload images. Please try again.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }
  async function save(active = p.active) {
    setBusy(true);
    setError("");
    try {
      const parsed = Object.fromEntries(
        specs
          .split("\n")
          .filter(Boolean)
          .map((l) => {
            const i = l.indexOf(":");
            return i > 0
              ? [l.slice(0, i).trim(), l.slice(i + 1).trim()]
              : [l.trim(), ""];
          }),
      );
      const response = await fetch(
        product?.id
          ? `/api/admin/products/${product.id}`
          : "/api/admin/products",
        {
          method: product?.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...p,
            images: p.images ?? [],
            active,
            specs: parsed,
          }),
        },
      );
      const body = await responseBody(response);
      if (!response.ok) {
        setError(
          body.error ??
            `Could not save product (HTTP ${response.status}). Restart the development server and try again.`,
        );
        return;
      }
      setDirty(false);
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError(
        "Could not reach the product API. Restart the development server and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Link href="/admin/products" className="adm-back">
        <ChevronLeft />
        Products
      </Link>
      <PageHeader
        title={product ? "Edit product" : "Add product"}
        description={
          product
            ? `Update ${product.name}`
            : "Create a new item for your catalogue."
        }
        actions={
          <>
            <button className="adm-btn">
              <Eye />
              Preview
            </button>
            <button className="adm-btn" onClick={() => save(false)}>
              Save as draft
            </button>
            <button
              className="adm-btn primary"
              disabled={busy}
              onClick={() => save(true)}
            >
              <Save />
              {busy ? "Saving..." : "Save"}
            </button>
          </>
        }
      />
      {dirty && <div className="adm-unsaved">You have unsaved changes.</div>}
      {error && <div className="adm-form-alert">{error}</div>}
      <div className="adm-editor-layout">
        <main>
          <FormSection title="Product information">
            <Field label="Title">
              <input
                value={p.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!product)
                    set(
                      "slug",
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, ""),
                    );
                }}
              />
            </Field>
            <Field label="Description">
              <textarea
                rows={7}
                value={p.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
          </FormSection>
          <FormSection title="Media" subtitle="Upload product images">
            <div
              className="adm-uploader"
              onClick={() => fileInput.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                upload(e.dataTransfer.files);
              }}
            >
              <input
                ref={fileInput}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                hidden
                onChange={(e) => e.target.files && upload(e.target.files)}
              />
              <UploadCloud />
              <b>Drop images here or click to upload</b>
              <p>PNG, JPG or WEBP up to 10 MB. Maximum 10 images.</p>
              <button
                className="adm-btn"
                type="button"
                disabled={uploading}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInput.current?.click();
                }}
              >
                <ImagePlus />
                {uploading ? "Uploading..." : "Add media"}
              </button>
            </div>
            {(p.images?.length ?? 0) > 0 && (
              <div className="adm-media-grid">
                {(p.images ?? []).map((image, index) => (
                  <figure key={image}>
                    <img
                      src={image}
                      alt={`${p.name || "Product"} ${index + 1}`}
                    />
                    {index === 0 && <span>Primary</span>}
                    <button
                      type="button"
                      title="Remove image"
                      onClick={() =>
                        set(
                          "images",
                          (p.images ?? []).filter((item) => item !== image),
                        )
                      }
                    >
                      <Trash2 />
                    </button>
                  </figure>
                ))}
              </div>
            )}
          </FormSection>
          <FormSection title="Pricing">
            <div className="adm-form-cols">
              <Field label="Price">
                <div className="adm-prefix">
                  <span>₹</span>
                  <input
                    type="number"
                    min="0"
                    value={p.price}
                    onChange={(e) => set("price", +e.target.value)}
                  />
                </div>
              </Field>
              <Field label="Compare-at price">
                <div className="adm-prefix">
                  <span>₹</span>
                  <input
                    type="number"
                    min="0"
                    value={p.mrp}
                    onChange={(e) => set("mrp", +e.target.value)}
                  />
                </div>
              </Field>
              <Field label="Cost per item">
                <div className="adm-prefix">
                  <span>₹</span>
                  <input
                    type="number"
                    min="0"
                    value={p.costPrice ?? ""}
                    onChange={(e) =>
                      set(
                        "costPrice",
                        e.target.value === "" ? null : +e.target.value,
                      )
                    }
                  />
                </div>
              </Field>
              <div className="adm-calc">
                <span>Margin</span>
                <b>
                  {p.price && p.mrp
                    ? Math.round(((p.mrp - p.price) / p.mrp) * 100)
                    : 0}
                  %
                </b>
              </div>
            </div>
          </FormSection>
          <FormSection title="Inventory">
            <div className="adm-form-cols">
              <Field label="SKU">
                <input
                  value={
                    product?.id
                      ? `VZ-${product.id.slice(-5).toUpperCase()}`
                      : "Auto generated"
                  }
                  disabled
                />
              </Field>
              <Field label="Barcode">
                <input
                  placeholder="ISBN, UPC, GTIN"
                  value={p.barcode ?? ""}
                  onChange={(e) => set("barcode", e.target.value || null)}
                />
              </Field>
              <Field label="Quantity">
                <input
                  type="number"
                  min="0"
                  value={p.stock}
                  onChange={(e) => set("stock", +e.target.value)}
                />
              </Field>
              <Field label="Low stock threshold">
                <input
                  type="number"
                  min="0"
                  value={p.lowStockThreshold}
                  onChange={(e) => set("lowStockThreshold", +e.target.value)}
                />
              </Field>
            </div>
            <label className="adm-check">
              <Checkbox defaultChecked /> Track quantity
            </label>
            <label className="adm-check">
              <Checkbox /> Continue selling when out of stock
            </label>
          </FormSection>
          <FormSection title="Shipping">
            <label className="adm-check">
              <Checkbox defaultChecked /> This is a physical product
            </label>
            <div className="adm-form-cols">
              <Field label="Weight (kg)">
                <input
                  type="number"
                  min="0"
                  step=".01"
                  value={p.weightKg ?? ""}
                  onChange={(e) =>
                    set(
                      "weightKg",
                      e.target.value === "" ? null : +e.target.value,
                    )
                  }
                />
              </Field>
              <Field label="Dimensions (cm)">
                <input
                  placeholder="L × W × H"
                  value={p.dimensions ?? ""}
                  onChange={(e) => set("dimensions", e.target.value || null)}
                />
              </Field>
            </div>
          </FormSection>
          <FormSection title="Specifications">
            <Field label="One per line (Name: Value)">
              <textarea
                rows={5}
                value={specs}
                onChange={(e) => {
                  setSpecs(e.target.value);
                  setDirty(true);
                }}
              />
            </Field>
          </FormSection>
          <FormSection title="Search engine listing">
            <div className="adm-seo-preview">
              <b>{p.name || "Product title"} – Electzo</b>
              <span>electzo.com/product/{p.slug || "product-url"}</span>
              <p>
                {p.description.slice(0, 155) ||
                  "Product meta description will appear here."}
              </p>
            </div>
            <Field label="URL slug">
              <input
                value={p.slug}
                onChange={(e) => set("slug", e.target.value)}
              />
            </Field>
          </FormSection>
        </main>
        <aside className="adm-editor-side">
          <FormSection title="Status">
            <Select
              value={p.active ? "active" : "draft"}
              onValueChange={(value) => set("active", value === "active")}
              options={[
                { value: "active", label: "Active" },
                { value: "draft", label: "Draft" },
              ]}
            />
          </FormSection>
          <FormSection title="Organization">
            <Field label="Category">
              <Select
                value={p.category}
                onValueChange={(value) => set("category", value)}
                placeholder="Choose a category"
                options={[
                  ...(p.category && !categories.includes(p.category)
                    ? [{ value: p.category, label: `${p.category} (inactive)` }]
                    : []),
                  ...categories.map((category) => ({
                    value: category,
                    label: category,
                  })),
                ]}
              />
              <small>
                Select an existing category to place the product on that
                storefront category page.
              </small>
            </Field>
            <Field label="Brand / Vendor">
              <Select
                value={p.brand}
                onValueChange={(value) => set("brand", value)}
                placeholder="Choose a brand"
                options={[
                  ...(p.brand && !brands.includes(p.brand)
                    ? [{ value: p.brand, label: `${p.brand} (inactive)` }]
                    : []),
                  ...brands.map((brand) => ({ value: brand, label: brand })),
                ]}
              />
            </Field>
            <Field label="Badge">
              <input
                value={p.badge ?? ""}
                onChange={(e) => set("badge", e.target.value)}
              />
            </Field>
            <Field label="Tags">
              <input
                placeholder="Add tags separated by commas"
                value={p.tags.join(", ")}
                onChange={(e) =>
                  set(
                    "tags",
                    e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  )
                }
              />
            </Field>
          </FormSection>
          <FormSection title="Appearance">
            <Field label="Product colour">
              <input
                className="adm-color"
                type="color"
                value={p.color ?? "#e9c74c"}
                onChange={(e) => set("color", e.target.value)}
              />
            </Field>
          </FormSection>
        </aside>
      </div>
    </>
  );
}
function FormSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="adm-form-section">
      <header>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </header>
      <div>{children}</div>
    </section>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="adm-field">
      <b>{label}</b>
      {children}
    </label>
  );
}
