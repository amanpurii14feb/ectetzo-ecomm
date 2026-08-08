import { PrismaClient } from "@prisma/client";
import { products } from "../data/products";

const prisma = new PrismaClient();

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { legacyId: product.id },
      update: {
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        category: product.category,
        description: product.description,
        price: product.price,
        mrp: product.mrp,
        stock: product.stock,
        rating: product.rating,
        reviews: product.reviews,
        badge: product.badge || null,
        color: product.color,
        specs: product.specs,
      },
      create: {
        legacyId: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        category: product.category,
        description: product.description,
        price: product.price,
        mrp: product.mrp,
        stock: product.stock,
        rating: product.rating,
        reviews: product.reviews,
        badge: product.badge || null,
        color: product.color,
        specs: product.specs,
      },
    });
  }
  console.log(`Seeded ${products.length} products.`);
}

main().finally(() => prisma.$disconnect());
