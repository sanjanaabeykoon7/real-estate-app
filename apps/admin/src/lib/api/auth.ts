import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ApiError } from '@/lib/api/errors';

const ADMIN_ROLES = new Set(['SUPER_ADMIN', 'MODERATOR']);

export async function requireAdminUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Unauthorized');
  }

  if (!ADMIN_ROLES.has(session.user.role)) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Unauthorized');
  }

  return session.user;
}
