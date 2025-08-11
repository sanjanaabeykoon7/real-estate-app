import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const hash = await bcrypt.hash('password', 10);

async function main() {
  await prisma.user.create({
    data: {
      email: 'agent@demo.com',
      password: hash,
      name: 'Demo Agent',
      role: 'AGENT',
      listings: {
        create: Array.from({ length: 5 }).map((_, i) => ({
          title: `Cozy Villa ${i + 1}`,
          description: 'Lovely home in a quiet neighborhood.',
          price: 300000 + i * 50000,
          beds: 3,
          baths: 2,
          sqft: 1800 + i * 100,
          address: { city: 'Austin', street: '123 Main St', lat: 30.26, lng: -97.74 },
          images: ['https://picsum.photos/seed/img1/800/600'],
          published: true,
        })),
      },
    },
  });
  console.log('✅ Seeded demo agent with 5 listings');
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());