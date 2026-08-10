import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const email = process.argv[2]?.trim().toLowerCase();

async function main() {
  if (!email || !email.includes("@")) {
    throw new Error("Usage: npm run admin:promote -- you@example.com");
  }
  const user = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
    select: { email: true, role: true },
  });
  console.log(`${user.email} is now an ${user.role}.`);
}

main()
  .catch((error) => {
    console.error(error.code === "P2025" ? "No registered user exists with that email." : error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

