const prismaClientSingleton = () => {
  // Use dynamic require to avoid initialization issues
  try {
    return require('@prisma/client').PrismaClient;
  } catch (e) {
    console.error('[v0] Prisma not initialized:', e.message);
    throw e;
  }
};

const PrismaClient = prismaClientSingleton();
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

module.exports = prisma;
