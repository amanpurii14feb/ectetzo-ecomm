"use client";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
let cache: Product[] | null = null,
  pending: Promise<Product[]> | null = null;
export function useProducts() {
  const [products, setProducts] = useState<Product[]>(cache ?? []),
    [loading, setLoading] = useState(!cache);
  useEffect(() => {
    if (cache) {
      setProducts(cache);
      setLoading(false);
      return;
    }
    pending ??= fetch("/api/products")
      .then((r) => {
        if (!r.ok) throw new Error("Could not load products");
        return r.json();
      })
      .then((b) => b.products as Product[]);
    pending
      .then((rows) => {
        cache = rows;
        setProducts(rows);
      })
      .finally(() => setLoading(false));
  }, []);
  return { products, loading };
}
