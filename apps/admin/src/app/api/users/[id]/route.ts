import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api/errors';
import { requireAdminUser } from '@/lib/api/auth';
import { parseJsonBody, resolveParams } from '@/lib/api/request';
import { deleteUser, getUserById, updateUser } from '@/server/users/service';
import { validateUpdateUserInput } from '@/server/users/validators';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminUser();

    const { id } = await resolveParams(params);
    const user = await getUserById(id);

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

    const { id } = await resolveParams(params);
    const body = await parseJsonBody<unknown>(request);
    const input = validateUpdateUserInput(body);
    const updatedUser = await updateUser(id, user.id, input);

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
    const { id } = await resolveParams(params);
    await deleteUser(id, user.id);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return errorResponse(error);
  }
}