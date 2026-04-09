let prisma;

const getPrisma = () => {
  if (prisma) return prisma;

  try {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();

    if (process.env.NODE_ENV !== 'production') {
      global.prisma = prisma;
    }

    return prisma;
  } catch (error) {
    console.error('[v0] Failed to initialize Prisma:', error.message);
    throw new Error('Database connection failed. Please ensure Prisma is properly configured.');
  }
};

module.exports = { getPrisma };
