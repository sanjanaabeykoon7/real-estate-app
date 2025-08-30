// packages/database/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminEmail = 'admin@realestate.com';
  const adminPassword = 'admin123'; // Change this to a secure password

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin User',
        role: 'SUPER_ADMIN',
      },
    });

    console.log('✅ Admin user created:', admin.email);
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // Create demo agent if doesn't exist
  const agentEmail = 'agent@demo.com';
  const existingAgent = await prisma.user.findUnique({
    where: { email: agentEmail }
  });

  if (!existingAgent) {
    const hash = await bcrypt.hash('password', 10);
    
    await prisma.user.create({
      data: {
        email: agentEmail,
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
  } else {
    console.log('ℹ️  Demo agent already exists');
  }

  console.log('Database seed completed!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });