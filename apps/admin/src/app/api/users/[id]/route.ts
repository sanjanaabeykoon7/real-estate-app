import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api/errors';
import { requireAdminUser } from '@/lib/api/auth';
import { deleteUser, getUserById, updateUser } from '@/server/users/service';
import { validateUpdateUserInput } from '@/server/users/validators';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminUser();

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
    const user = await requireAdminUser();

    const input = validateUpdateUserInput(await request.json());
    const updatedUser = await updateUser(params.id, user.id, input);

    return NextResponse.json(updatedUser);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdminUser();
    await deleteUser(params.id, user.id);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return errorResponse(error);
  }
}