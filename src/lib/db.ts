import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // If no DATABASE_URL, return a client that will throw clear errors on use
  if (!process.env.DATABASE_URL) {
    console.warn('[db] DATABASE_URL not set — database operations will fail');
  }
  return new PrismaClient();
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export default db;