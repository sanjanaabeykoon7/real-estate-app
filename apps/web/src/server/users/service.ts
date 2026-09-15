import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api/errors';
import bcrypt from 'bcryptjs';

export async function createUserAccount(input: {
  email: string;
  password: string;
  name: string;
  role: 'USER' | 'AGENT' | 'MODERATOR' | 'SUPER_ADMIN';
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existingUser) {
    throw new ApiError(400, 'CONFLICT', 'User already exists');
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      name: input.name,
      role: input.role,
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function getUserProfileForSelf(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      phone: true,
      address: true,
      bio: true,
    },
  });

  if (!user) {
    throw new ApiError(404, 'NOT_FOUND', 'User not found');
  }

  return user;
}

export async function updateUserProfileForSelf(
  userId: string,
  input: { name: string; phone: string | null; address: string | null; bio: string | null }
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      phone: input.phone,
      address: input.address,
      bio: input.bio,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      phone: true,
      address: true,
      bio: true,
    },
  });
}
