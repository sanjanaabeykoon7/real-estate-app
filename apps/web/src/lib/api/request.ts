import { ApiError } from '@/lib/api/errors';

export async function parseJsonBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ApiError(400, 'INVALID_JSON', 'Request body must be valid JSON');
  }
}

export function requireQueryParam(request: Request, key: string): string {
  const value = new URL(request.url).searchParams.get(key);
  if (!value) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${key} is required`);
  }
  return value;
}

export async function resolveParams<T>(params: T | Promise<T>): Promise<T> {
  return Promise.resolve(params);
}
