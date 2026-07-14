import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Toujours réutiliser l'instance existante (y compris en production serverless)
// pour éviter d'épuiser le pool de connexions Neon (max 10 sur le plan gratuit).
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

globalForPrisma.prisma = prisma;
