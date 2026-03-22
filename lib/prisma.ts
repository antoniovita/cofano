import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const log: Prisma.LogLevel[] =
    process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];

  const databaseUrl = process.env.DATABASE_URL ?? "";
  const prisma =
    databaseUrl.startsWith("prisma+")
      ? new PrismaClient({ log, accelerateUrl: databaseUrl })
      : new PrismaClient({ log });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  return prisma;
}
