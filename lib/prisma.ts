import { PrismaClient } from "@prisma/client";

// Standard Next.js dev pattern: reuse one PrismaClient across hot reloads
// instead of opening a new pool on every module reload.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
