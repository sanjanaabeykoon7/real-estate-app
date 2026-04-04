import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { ApiError, errorResponse } from '@/lib/api/errors';
import { createUser, listUsers } from '@/server/users/service';
import { validateCreateUserInput } from '@/server/users/validators';

function assertAdminOrModerator(session: any) {
  if (!session || ((session.user as any).role !== 'SUPER_ADMIN' && (session.user as any).role !== 'MODERATOR')) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Unauthorized');
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    assertAdminOrModerator(session);

    const users = await listUsers();

    return NextResponse.json(users);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    assertAdminOrModerator(session);

    const input = validateCreateUserInput(await request.json());
    const user = await createUser(input);

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}