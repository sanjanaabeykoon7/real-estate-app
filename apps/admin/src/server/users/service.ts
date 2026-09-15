import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api/errors';

export async function listUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          listings: true,
          saved: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          listings: true,
          saved: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, 'NOT_FOUND', 'User not found');
  }

  return user;
}

export async function createUser(input: {
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
    throw new ApiError(400, 'CONFLICT', 'User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);
  return prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      name: input.name,
      role: input.role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateUser(
  userId: string,
  actorId: string,
  input: { email?: string; name?: string; role?: 'USER' | 'AGENT' | 'MODERATOR' | 'SUPER_ADMIN'; password?: string }
) {
  const updateData: Record<string, unknown> = {};

  if (input.email) updateData.email = input.email;
  if (input.name) updateData.name = input.name;
  if (input.role && userId !== actorId) updateData.role = input.role;
  if (input.password) updateData.password = await bcrypt.hash(input.password, 10);

  try {
    return await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      throw new ApiError(400, 'CONFLICT', 'Email already exists');
    }
    throw error;
  }
}

export async function deleteUser(userId: string, actorId: string) {
  if (userId === actorId) {
    throw new ApiError(400, 'INVALID_OPERATION', 'Cannot delete your own account');
  }

  const userWithListings = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: { listings: true },
      },
    },
  });

  if (!userWithListings) {
    throw new ApiError(404, 'NOT_FOUND', 'User not found');
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
  } catch (error: any) {
    if (error?.code === 'P2003') {
      throw new ApiError(400, 'FK_CONSTRAINT', 'Cannot delete user with existing related data');
    }
    throw error;
  }
}
