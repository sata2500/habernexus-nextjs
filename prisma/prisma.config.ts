/**
 * Prisma v7 Konfigürasyonu
 * 
 * Prisma v7'de datasource URL'si schema.prisma'dan kaldırıldı.
 * Bunun yerine PrismaClient başlatılırken URL geçilir.
 * 
 * @see https://pris.ly/d/prisma7-client-config
 */

export const prismaConfig = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./prisma/data.db',
    },
  },
}
