// packages/database/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Use environment variables for credentials
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@realestate.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';

  // Create admin user
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin',
        role: 'SUPER_ADMIN',
      },
    });

    console.log('✅ Admin user created:', adminEmail);
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // Create demo agent (only in non-production)
  if (process.env.NODE_ENV !== 'production') {
    const agentEmail = 'agent@realestate.com';
    const existingAgent = await prisma.user.findUnique({
      where: { email: agentEmail }
    });

    if (!existingAgent) {
      const hash = await bcrypt.hash(process.env.DEMO_AGENT_PASSWORD || 'agentre321', 12);
      
      const agent = await prisma.user.create({
        data: {
          email: agentEmail,
          password: hash,
          name: 'Demo Agent',
          role: 'AGENT',
        },
      });

      // Create listings with ownerId
      await prisma.listing.createMany({
        data: Array.from({ length: 5 }).map((_, i) => ({
          title: `Villa ${i + 1}`,
          description: 'Lovely home in a quiet neighborhood.',
          price: 300000 + i * 50000,
          beds: 3,
          baths: 2,
          sqft: 1800 + i * 100,
          address: { city: 'Austin', street: '123 Main St', lat: 30.26, lng: -97.74 },
          images: ['https://res.cloudinary.com/duqbjbqvb/image/upload/v1755758720/real-estate/flmione5dlb5jvier3kg.jpg'],
          published: true,
          ownerId: agent.id, // Fixed: added ownerId
        })),
      });

      console.log('✅ Seeded demo agent with 5 listings');
    }
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