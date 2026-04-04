import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ApiError, errorResponse } from '@/lib/api/errors';
import { getUserProfileForSelf, updateUserProfileForSelf } from '@/server/users/service';
import { validateProfileUpdateInput } from '@/server/users/validators';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Unauthorized');
    }

    // Await params first
    const { id } = await params;

    // Users can only access their own profile
    if (session.user.id !== id) {
      throw new ApiError(403, 'FORBIDDEN', 'Forbidden');
    }

    const user = await getUserProfileForSelf(id);

    return NextResponse.json(user);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Unauthorized');
    }

    const { id } = await params;

    // Users can only update their own profile
    if (session.user.id !== id) {
      throw new ApiError(403, 'FORBIDDEN', 'Forbidden');
    }

    const input = validateProfileUpdateInput(await request.json());
    const updatedUser = await updateUserProfileForSelf(id, input);

    return NextResponse.json(updatedUser);
  } catch (error) {
    return errorResponse(error);
  }
}