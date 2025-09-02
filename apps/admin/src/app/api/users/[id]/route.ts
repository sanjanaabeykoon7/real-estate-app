import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || 
        ((session.user as any).role !== 'SUPER_ADMIN' && 
         (session.user as any).role !== 'MODERATOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
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
            saved: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || 
        ((session.user as any).role !== 'SUPER_ADMIN' && 
         (session.user as any).role !== 'MODERATOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, name, role, password } = body;

    // Build update data object
    const updateData: any = {};
    
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    
    // Only allow role changes if not changing own role
    if (role && params.id !== (session.user as any).id) {
      updateData.role = role;
    }
    
    // Hash new password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Error updating user:', error);
    
    // Check for unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || 
        ((session.user as any).role !== 'SUPER_ADMIN' && 
         (session.user as any).role !== 'MODERATOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Prevent deleting own account
    if (params.id === (session.user as any).id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if user has listings
    const userWithListings = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { listings: true }
        }
      }
    });

    if (!userWithListings) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // You might want to handle listings before deletion
    // For now, we'll just warn if there are listings
    if (userWithListings._count.listings > 0) {
      // Option 1: Prevent deletion
      // return NextResponse.json(
      //   { error: 'Cannot delete user with existing listings' },
      //   { status: 400 }
      // );
      
      // Option 2: Delete user and cascade delete listings (if cascade is set in schema)
      // Continuing with deletion...
    }

    // Delete user
    await prisma.user.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    
    // Check for foreign key constraint
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete user with existing related data' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}