import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Validate DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'production'
      ? ['error']
      : ['error', 'warn'],
  });

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Health check utility
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // For MongoDB, we can't use $queryRaw. Use $connect instead.
    await prisma.$connect();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}
