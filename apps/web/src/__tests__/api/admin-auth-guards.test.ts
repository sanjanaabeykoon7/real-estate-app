import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { requireAdminUser } from '../../../../admin/src/lib/api/auth';

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

describe('Admin API Auth Guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows SUPER_ADMIN', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'admin-1', role: 'SUPER_ADMIN', email: 'a@test.com', name: 'Admin' },
    } as any);

    const user = await requireAdminUser();
    expect(user.id).toBe('admin-1');
  });

  it('allows MODERATOR', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'mod-1', role: 'MODERATOR', email: 'm@test.com', name: 'Mod' },
    } as any);

    const user = await requireAdminUser();
    expect(user.id).toBe('mod-1');
  });

  it('rejects USER role', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1', role: 'USER', email: 'u@test.com', name: 'User' },
    } as any);

    await expect(requireAdminUser()).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHORIZED',
    });
  });
});
