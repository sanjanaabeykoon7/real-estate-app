import { ApiError } from '@/lib/api/errors';

type UserRole = 'USER' | 'AGENT' | 'MODERATOR' | 'SUPER_ADMIN';

const VALID_ROLES: UserRole[] = ['USER', 'AGENT', 'MODERATOR', 'SUPER_ADMIN'];

function requireNonEmptyString(value: unknown, field: string, minLength = 1) {
  if (typeof value !== 'string' || value.trim().length < minLength) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} must be at least ${minLength} characters`);
  }
  return value.trim();
}

function optionalString(value: unknown) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Optional fields must be strings');
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function validateEmail(value: unknown) {
  const email = requireNonEmptyString(value, 'email');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid email format');
  }
  return email.toLowerCase();
}

export function validateRegisterInput(body: unknown) {
  if (!body || typeof body !== 'object') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid request body');
  }

  const data = body as Record<string, unknown>;
  const roleInput = typeof data.role === 'string' ? data.role.toUpperCase() : 'USER';

  if (!VALID_ROLES.includes(roleInput as UserRole)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid role');
  }

  return {
    email: validateEmail(data.email),
    password: requireNonEmptyString(data.password, 'password', 8),
    name: requireNonEmptyString(data.name, 'name', 2),
    role: roleInput as UserRole,
  };
}

export function validateProfileUpdateInput(body: unknown) {
  if (!body || typeof body !== 'object') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid request body');
  }

  const data = body as Record<string, unknown>;
  return {
    name: requireNonEmptyString(data.name, 'name', 2),
    phone: optionalString(data.phone),
    address: optionalString(data.address),
    bio: optionalString(data.bio),
  };
}
