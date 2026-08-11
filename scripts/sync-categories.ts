import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    distinct: ["category"],
    select: { category: true },
  });
  for (const { category: name } of products) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, slug },
    });
  }
  console.log(`Synchronized ${products.length} categories.`);
}

main().finally(() => prisma.$disconnect());
