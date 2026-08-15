import { z } from "zod";

export const productSchema = z
  .object({
    name: z.string().trim().min(2).max(160),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(180)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Use lowercase letters, numbers and hyphens.",
      ),
    brand: z.string().trim().min(2).max(80),
    category: z.string().trim().min(2).max(80),
    description: z.string().trim().min(10).max(4000),
    price: z.coerce.number().int().min(0).max(100000000),
    mrp: z.coerce.number().int().min(0).max(100000000),
    stock: z.coerce.number().int().min(0).max(10000000),
    lowStockThreshold: z.coerce.number().int().min(0).max(100000).default(5),
    costPrice: z.coerce
      .number()
      .int()
      .min(0)
      .max(100000000)
      .nullable()
      .optional(),
    barcode: z.string().trim().regex(/^[A-Za-z0-9_-]{4,80}$/, "Use 4–80 letters, numbers, hyphens or underscores.").nullable().optional(),
    weightKg: z.coerce.number().positive().max(100000).nullable().optional(),
    dimensions: z.string().trim().max(100).nullable().optional(),
    tags: z.array(z.string().trim().min(1).max(40)).max(30).default([]).transform((tags) => [...new Set(tags)]),
    rating: z.coerce.number().min(0).max(5),
    reviews: z.coerce.number().int().min(0).max(100000000),
    badge: z.string().trim().max(40).nullable().optional(),
    color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Enter a valid 6-digit hex colour."),
    images: z
      .array(z.string().trim().startsWith("/api/uploads/"))
      .max(10)
      .default([]),
    active: z.boolean(),
    specs: z.record(z.string().trim().min(1).max(60), z.string().trim().max(300))
      .refine((value) => Object.keys(value).length <= 50, "Up to 50 specifications are allowed."),
  })
  .strict()
  .refine((data) => data.mrp >= data.price, {
    message: "MRP cannot be lower than selling price.",
    path: ["mrp"],
  })
  .refine((data) => data.costPrice == null || data.costPrice <= data.mrp, {
    message: "Cost price cannot exceed MRP.",
    path: ["costPrice"],
  });
