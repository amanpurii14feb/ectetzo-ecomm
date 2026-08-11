import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function databaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (!url.searchParams.has("sslmode"))
      url.searchParams.set("sslmode", "require");
    if (!url.searchParams.has("connect_timeout"))
      url.searchParams.set("connect_timeout", "15");
    if (!url.searchParams.has("pool_timeout"))
      url.searchParams.set("pool_timeout", "30");
    if (!url.searchParams.has("connection_limit"))
      url.searchParams.set("connection_limit", "1");
    if (url.hostname.includes("-pooler."))
      url.searchParams.set("pgbouncer", "true");
    return url.toString();
  } catch {
    return value;
  }
}

const cachedPrisma = globalForPrisma.prisma;
const schemaCurrent =
  cachedPrisma &&
  "category" in cachedPrisma &&
  "brand" in cachedPrisma &&
  "adminRecord" in cachedPrisma &&
  "storeSetting" in cachedPrisma;

export const prisma =
  (schemaCurrent ? cachedPrisma : undefined) ??
  new PrismaClient({
    datasourceUrl: databaseUrl(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
