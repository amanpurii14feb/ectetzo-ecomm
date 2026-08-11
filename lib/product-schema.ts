import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens."),
  brand: z.string().trim().min(1).max(80),
  category: z.string().trim().min(1).max(80),
  description: z.string().trim().min(10).max(4000),
  price: z.coerce.number().int().min(0).max(100000000),
  mrp: z.coerce.number().int().min(0).max(100000000),
  stock: z.coerce.number().int().min(0).max(10000000),
  rating: z.coerce.number().min(0).max(5),
  reviews: z.coerce.number().int().min(0),
  badge: z.string().trim().max(40).nullable().optional(),
  color: z.string().trim().min(1).max(120),
  images: z.array(z.string().trim().startsWith("/api/uploads/")).max(10).default([]),
  active: z.boolean(),
  specs: z.record(z.string(), z.string()),
}).refine((data) => data.mrp >= data.price, {
  message: "MRP cannot be lower than selling price.",
  path: ["mrp"],
});
