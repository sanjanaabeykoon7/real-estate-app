import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ApiError } from '@/lib/api/errors';

export async function requireAuthenticatedUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Unauthorized');
  }

  return session.user;
}

export async function requireSelfAccess(targetUserId: string) {
  const user = await requireAuthenticatedUser();

  if (user.id !== targetUserId) {
    throw new ApiError(403, 'FORBIDDEN', 'Forbidden');
  }

  return user;
}
