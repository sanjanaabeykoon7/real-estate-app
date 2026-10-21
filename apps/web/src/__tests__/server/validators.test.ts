import { describe, expect, it } from 'vitest';
import { validateCreateListingInput } from '@/server/listings/validators';
import { validateRegisterInput } from '@/server/users/validators';
import { validateToggleFavoriteInput } from '@/server/favorites/validators';

describe('server input validators', () => {
  it('normalizes valid registration input', () => {
    expect(
      validateRegisterInput({
        name: ' Test User ',
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      }),
    ).toEqual({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'USER',
    });
  });

  it('rejects invalid registration input', () => {
    expect(() =>
      validateRegisterInput({
        name: 'A',
        email: 'not-an-email',
        password: 'short',
      }),
    ).toThrow('Invalid email format');
  });

  it('requires all fields needed to create a listing', () => {
    expect(() => validateCreateListingInput({ title: 'Incomplete' })).toThrow(
      'images must be a non-empty string array',
    );
  });

  it('accepts a valid listing payload', () => {
    expect(
      validateCreateListingInput({
        title: 'Test Listing',
        description: 'A test listing',
        price: 100000,
        beds: 2,
        baths: 1,
        address: { city: 'Test City' },
        images: ['https://example.com/test.jpg'],
      }),
    ).toMatchObject({
      title: 'Test Listing',
      price: 100000,
      published: false,
    });
  });

  it('rejects an empty favorite listing id', () => {
    expect(() => validateToggleFavoriteInput({ listingId: ' ' })).toThrow(
      'Listing ID is required',
    );
  });
});
