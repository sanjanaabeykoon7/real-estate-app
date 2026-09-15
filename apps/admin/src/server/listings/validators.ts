import { ListingStatus } from '@prisma/client';
import { ApiError } from '@/lib/api/errors';

type JsonRecord = Record<string, unknown>;

const STATUS_MAP: Record<string, ListingStatus> = {
  active: 'ACTIVE',
  pending: 'PENDING',
  sold: 'SOLD',
  inactive: 'INACTIVE',
};

function isObject(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null;
}

function nonEmptyString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} is required`);
  }
  return value.trim();
}

function optionalString(value: unknown) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Optional text fields must be strings');
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

// Admin forms submit numbers as strings, so accept both.
function positiveInt(value: unknown, field: string) {
  const n = typeof value === 'string' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isInteger(n) || n <= 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} must be a positive integer`);
  }
  return n;
}

function optionalPositiveInt(value: unknown, field: string) {
  if (value === undefined || value === null || value === '' || Number.isNaN(value)) return null;
  return positiveInt(value, field);
}

function toBoolean(value: unknown) {
  return value === true || value === 'true' || value === 'on';
}

function toStatus(value: unknown): ListingStatus {
  if (typeof value !== 'string') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'status must be a string');
  }
  const status = STATUS_MAP[value.toLowerCase()];
  if (!status) {
    throw new ApiError(400, 'VALIDATION_ERROR', `Invalid status: ${value}`);
  }
  return status;
}

function stringArray(value: unknown) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'images must be an array');
  }
  return value.filter((img): img is string => typeof img === 'string' && img.length > 0);
}

export function validateAdminCreateListingInput(body: unknown) {
  if (!isObject(body)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid request body');
  }

  return {
    title: nonEmptyString(body.title, 'title'),
    description: nonEmptyString(body.description, 'description'),
    price: positiveInt(body.price, 'price'),
    beds: positiveInt(body.beds, 'beds'),
    baths: positiveInt(body.baths, 'baths'),
    sqft: optionalPositiveInt(body.sqft, 'sqft'),
    address: isObject(body.address) ? body.address : {},
    location: optionalString(body.location),
    status: body.status === undefined ? ListingStatus.ACTIVE : toStatus(body.status),
    images: stringArray(body.images),
    published: toBoolean(body.published),
    featured: toBoolean(body.featured),
    ownerId: optionalString(body.ownerId),
  };
}

export function validateAdminUpdateListingInput(body: unknown) {
  if (!isObject(body)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid request body');
  }

  const data: Record<string, unknown> = {};

  if ('title' in body) data.title = nonEmptyString(body.title, 'title');
  if ('description' in body) data.description = nonEmptyString(body.description, 'description');
  if ('price' in body) data.price = positiveInt(body.price, 'price');
  if ('beds' in body) data.beds = positiveInt(body.beds, 'beds');
  if ('baths' in body) data.baths = positiveInt(body.baths, 'baths');
  if ('sqft' in body) data.sqft = optionalPositiveInt(body.sqft, 'sqft');
  if ('address' in body) {
    if (!isObject(body.address)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'address must be an object');
    }
    data.address = body.address;
  }
  if ('location' in body) data.location = optionalString(body.location);
  if ('status' in body) data.status = toStatus(body.status);
  if ('images' in body) data.images = stringArray(body.images);
  if ('published' in body) data.published = toBoolean(body.published);
  if ('featured' in body) data.featured = toBoolean(body.featured);

  if (Object.keys(data).length === 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'At least one field is required for update');
  }

  return data;
}
