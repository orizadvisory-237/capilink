// @ts-nocheck
import { createRequire } from 'module';

const globalForPrisma = globalThis as unknown as { prisma: any }

let prismaInstance: any = globalForPrisma.prisma

if (!prismaInstance) {
  try {
    const require = createRequire(import.meta.url || "file://");
    const { PrismaClient } = require('@prisma/client');
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  } catch (e) {
    // Pendant le build statique, la DB peut ne pas être accessible.
    // On crée un proxy qui échouera gracieusement à l'exécution.
    console.warn('[Prisma] Impossible d\'initialiser le client:', (e as Error).message)
    prismaInstance = new Proxy({}, {
      get: () => () => {
        throw new Error('Prisma client non initialisé — vérifiez DATABASE_URL')
      }
    })
  }
}

export const prisma = prismaInstance

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
