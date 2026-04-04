import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { ApiError, errorResponse } from '@/lib/api/errors';
import { deleteUser, getUserById, updateUser } from '@/server/users/service';
import { validateUpdateUserInput } from '@/server/users/validators';

function assertAdminOrModerator(session: any) {
  if (!session || ((session.user as any).role !== 'SUPER_ADMIN' && (session.user as any).role !== 'MODERATOR')) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Unauthorized');
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    assertAdminOrModerator(session);

    const user = await getUserById(params.id);

    return NextResponse.json(user);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    assertAdminOrModerator(session);

    const input = validateUpdateUserInput(await request.json());
    const user = await updateUser(params.id, (session.user as any).id, input);

    return NextResponse.json(user);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    assertAdminOrModerator(session);
    await deleteUser(params.id, (session.user as any).id);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return errorResponse(error);
  }
}