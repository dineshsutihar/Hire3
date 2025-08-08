import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const initPrismaShutdownHooks = () => {
  const shutdown = async () => {
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};
