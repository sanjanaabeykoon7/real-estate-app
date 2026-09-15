import { ApiError } from '@/lib/api/errors';

type JsonRecord = Record<string, unknown>;

function isObject(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null;
}

function asPositiveInt(value: unknown, field: string) {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} must be a positive integer`);
  }
  return value;
}

function asNonEmptyString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} is required`);
  }
  return value.trim();
}

function asOptionalString(value: unknown) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Optional text fields must be strings');
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export function validateCreateListingInput(body: unknown) {
  if (!isObject(body)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid request body');
  }

  const images = body.images;
  if (!Array.isArray(images) || images.length === 0 || images.some((img) => typeof img !== 'string')) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'images must be a non-empty string array');
  }

  if (!isObject(body.address)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'address must be an object');
  }

  return {
    title: asNonEmptyString(body.title, 'title'),
    description: asNonEmptyString(body.description, 'description'),
    price: asPositiveInt(body.price, 'price'),
    beds: asPositiveInt(body.beds, 'beds'),
    baths: asPositiveInt(body.baths, 'baths'),
    sqft: body.sqft === undefined || body.sqft === null ? null : asPositiveInt(body.sqft, 'sqft'),
    address: body.address,
    location: asOptionalString(body.location),
    images,
    published: typeof body.published === 'boolean' ? body.published : false,
  };
}

export function validateUpdateListingInput(body: unknown) {
  if (!isObject(body)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid request body');
  }

  const allowedKeys = new Set([
    'title',
    'description',
    'price',
    'beds',
    'baths',
    'sqft',
    'address',
    'location',
    'images',
    'published',
    'featured',
    'status',
  ]);

  const inputKeys = Object.keys(body);
  if (inputKeys.length === 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'At least one field is required for update');
  }

  for (const key of inputKeys) {
    if (!allowedKeys.has(key)) {
      throw new ApiError(400, 'VALIDATION_ERROR', `Unsupported field: ${key}`);
    }
  }

  const data: Record<string, unknown> = {};
  if ('title' in body) data.title = asNonEmptyString(body.title, 'title');
  if ('description' in body) data.description = asNonEmptyString(body.description, 'description');
  if ('price' in body) data.price = asPositiveInt(body.price, 'price');
  if ('beds' in body) data.beds = asPositiveInt(body.beds, 'beds');
  if ('baths' in body) data.baths = asPositiveInt(body.baths, 'baths');
  if ('sqft' in body) data.sqft = body.sqft === null ? null : asPositiveInt(body.sqft, 'sqft');
  if ('address' in body) {
    if (!isObject(body.address)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'address must be an object');
    }
    data.address = body.address;
  }
  if ('location' in body) data.location = asOptionalString(body.location);
  if ('images' in body) {
    if (!Array.isArray(body.images) || body.images.some((img) => typeof img !== 'string')) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'images must be a string array');
    }
    data.images = body.images;
  }
  if ('published' in body) {
    if (typeof body.published !== 'boolean') {
      throw new ApiError(400, 'VALIDATION_ERROR', 'published must be boolean');
    }
    data.published = body.published;
  }
  if ('featured' in body) {
    if (typeof body.featured !== 'boolean') {
      throw new ApiError(400, 'VALIDATION_ERROR', 'featured must be boolean');
    }
    data.featured = body.featured;
  }
  if ('status' in body) {
    if (typeof body.status !== 'string') {
      throw new ApiError(400, 'VALIDATION_ERROR', 'status must be a string');
    }
    data.status = body.status;
  }

  return data;
}
