import { PrismaClient } from '@prisma/client'
import { env, hasDatabaseUrl } from '../config/env.js'

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient
}

function createPrismaClient() {
  if (env.databaseUrl) {
    return new PrismaClient({
      datasources: {
        db: {
          url: env.databaseUrl
        }
      }
    })
  }

  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (env.nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma
}

export function ensureDatabaseConfigured() {
  if (!hasDatabaseUrl()) {
    throw new Error('DATABASE_URL 未配置，无法连接 PostgreSQL。')
  }
}

export async function checkDatabaseHealth() {
  ensureDatabaseConfigured()
  await prisma.$queryRaw`SELECT 1`
  return { ok: true }
}
