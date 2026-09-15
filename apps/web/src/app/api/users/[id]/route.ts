import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api/errors';
import { requireSelfAccess } from '@/lib/api/auth';
import { parseJsonBody, resolveParams } from '@/lib/api/request';
import { getUserProfileForSelf, updateUserProfileForSelf } from '@/server/users/service';
import { validateProfileUpdateInput } from '@/server/users/validators';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params first
    const { id } = await resolveParams(params);
    await requireSelfAccess(id);

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
    const { id } = await resolveParams(params);
    await requireSelfAccess(id);

    const body = await parseJsonBody<unknown>(request);
    const input = validateProfileUpdateInput(body);
    const updatedUser = await updateUserProfileForSelf(id, input);

    return NextResponse.json(updatedUser);
  } catch (error) {
    return errorResponse(error);
  }
}