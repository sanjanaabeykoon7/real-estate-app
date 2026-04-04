import { ApiError } from '@/lib/api/errors';

const VALID_ROLES = ['USER', 'AGENT', 'MODERATOR', 'SUPER_ADMIN'] as const;
type UserRole = (typeof VALID_ROLES)[number];

function validateEmail(value: unknown) {
  if (typeof value !== 'string') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Email must be a string');
  }
  const email = value.trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid email format');
  }
  return email;
}

function nonEmptyString(value: unknown, field: string, minLength = 1) {
  if (typeof value !== 'string' || value.trim().length < minLength) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} must be at least ${minLength} characters`);
  }
  return value.trim();
}

function validateRole(value: unknown): UserRole {
  if (typeof value !== 'string') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Role must be a string');
  }

  const normalized = value.toUpperCase() as UserRole;
  if (!VALID_ROLES.includes(normalized)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid role value');
  }

  return normalized;
}

export function validateCreateUserInput(body: unknown) {
  if (!body || typeof body !== 'object') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid request body');
  }

  const data = body as Record<string, unknown>;
  return {
    email: validateEmail(data.email),
    password: nonEmptyString(data.password, 'password', 8),
    name: nonEmptyString(data.name, 'name', 2),
    role: data.role ? validateRole(data.role) : ('USER' as UserRole),
  };
}

export function validateUpdateUserInput(body: unknown) {
  if (!body || typeof body !== 'object') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid request body');
  }

  const data = body as Record<string, unknown>;
  const result: {
    email?: string;
    name?: string;
    role?: UserRole;
    password?: string;
  } = {};

  if ('email' in data) result.email = validateEmail(data.email);
  if ('name' in data) result.name = nonEmptyString(data.name, 'name', 2);
  if ('role' in data) result.role = validateRole(data.role);
  if ('password' in data) result.password = nonEmptyString(data.password, 'password', 8);

  if (Object.keys(result).length === 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'At least one field is required');
  }

  return result;
}
