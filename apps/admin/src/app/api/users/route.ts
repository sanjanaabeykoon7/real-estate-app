import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api/errors';
import { requireAdminUser } from '@/lib/api/auth';
import { createUser, listUsers } from '@/server/users/service';
import { validateCreateUserInput } from '@/server/users/validators';

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser();

    const users = await listUsers();

    return NextResponse.json(users);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminUser();

    const input = validateCreateUserInput(await request.json());
    const user = await createUser(input);

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}