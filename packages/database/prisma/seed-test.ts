import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('test-admin-password', 12);
  const agentPassword = await bcrypt.hash('test-agent-password', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.example' },
    update: { password: adminPassword, role: 'SUPER_ADMIN' },
    create: {
      email: 'admin@test.example',
      password: adminPassword,
      name: 'Test Admin',
      role: 'SUPER_ADMIN',
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: 'agent@test.example' },
    update: { password: agentPassword, role: 'AGENT' },
    create: {
      email: 'agent@test.example',
      password: agentPassword,
      name: 'Test Agent',
      role: 'AGENT',
    },
  });

  await prisma.listing.upsert({
    where: { id: 'test-listing-villa-1' },
    update: { ownerId: agent.id },
    create: {
      id: 'test-listing-villa-1',
      title: 'Test Villa 1',
      description: 'Deterministic test listing',
      price: 500000,
      beds: 3,
      baths: 2,
      sqft: 1800,
      address: { street: 'Test Street', city: 'Test City', country: 'Test Country' },
      location: 'Test City',
      images: ['https://example.com/test-villa.jpg'],
      published: true,
      ownerId: agent.id,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
