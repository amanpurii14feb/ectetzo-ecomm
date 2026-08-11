import { PrismaClient } from "@prisma/client";
import { products } from "../data/products";
import { hash } from "bcryptjs";

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
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    if (adminPassword.length < 12) {
      throw new Error("ADMIN_PASSWORD must contain at least 12 characters.");
    }
    const passwordHash = await hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { name: "Electzo Administrator", passwordHash, role: "ADMIN" },
      create: {
        name: "Electzo Administrator",
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log(`Seeded admin account: ${adminEmail}`);
  } else {
    console.log("Skipped admin account: ADMIN_EMAIL or ADMIN_PASSWORD is missing.");
  }
  console.log(`Seeded ${products.length} products.`);
}

main().finally(() => prisma.$disconnect());
