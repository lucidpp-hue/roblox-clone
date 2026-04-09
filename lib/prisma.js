// Lazy-load Prisma to avoid initialization issues
let prismaInstance = null;

async function getPrisma() {
  if (prismaInstance) {
    return prismaInstance;
  }

  try {
    const { PrismaClient } = await import('@prisma/client');
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

    // Test connection
    await prismaInstance.$connect();
    console.log('[v0] Prisma connected successfully');

    return prismaInstance;
  } catch (error) {
    console.error('[v0] Prisma connection error:', error.message);
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

export { getPrisma };
