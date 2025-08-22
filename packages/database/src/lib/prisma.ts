import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient();

if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;