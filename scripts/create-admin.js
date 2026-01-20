import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Admin kullanıcısı oluştur
  const admin = await prisma.user.upsert({
    where: { email: 'admin@habernexus.com' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@habernexus.com',
      name: 'Admin User',
      role: 'ADMIN',
      username: 'admin'
    }
  });
  
  console.log('Admin kullanıcısı oluşturuldu:', admin);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

export { main };
