// Lazy-load Prisma to avoid initialization issues
let prismaInstance = null;

async function getPrisma() {
  if (prismaInstance) {
    return prismaInstance;
  }

  try {
    const { PrismaClient } = await import('@prisma/client');
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
    });

    return prismaInstance;
  } catch (error) {
    console.error('[v0] Prisma init failed:', error.message);
    throw new Error('Failed to initialize database connection');
  }
}

export { getPrisma };
