import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany({
    distinct: ["brand"],
    select: { brand: true },
  });
  for (const { brand: name } of products) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    await prisma.brand.upsert({
      where: { name },
      update: {},
      create: { name, slug },
    });
  }
  console.log(`Synchronized ${products.length} brands.`);
}
main().finally(() => prisma.$disconnect());
