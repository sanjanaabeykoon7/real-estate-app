import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { requireAuthenticatedUser, requireSelfAccess } from '@/lib/api/auth';

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

vi.mock('@/lib/api/errors', () => ({
  ApiError: class ApiError extends Error {
    status: number;
    code: string;

    constructor(status: number, code: string, message: string) {
      super(message);
      this.status = status;
      this.code = code;
    }
  },
}));

describe('Web API Auth Guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns user when authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1', role: 'USER', email: 'u@test.com', name: 'User' },
    } as any);

    const user = await requireAuthenticatedUser();

    expect(user.id).toBe('user-1');
  });

  it('throws unauthorized when session is missing', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null as any);

    await expect(requireAuthenticatedUser()).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHORIZED',
    });
  });

  it('throws forbidden when accessing another user profile', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1', role: 'USER', email: 'u@test.com', name: 'User' },
    } as any);

    await expect(requireSelfAccess('user-2')).rejects.toMatchObject({
      status: 403,
      code: 'FORBIDDEN',
    });
  });
});
