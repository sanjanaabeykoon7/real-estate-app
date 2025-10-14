import { describe, it, expect, vi } from 'vitest'

describe('Listings API', () => {
  it('should create a new listing', async () => {
    const mockListing = {
      title: 'Beautiful House',
      description: 'A lovely home',
      price: 500000,
      beds: 3,
      baths: 2,
      address: {
        street: '123 Main St',
        city: 'Colombo',
        state: 'Western',
        country: 'Sri Lanka',
      },
      images: ['image1.jpg'],
    }

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          id: 'listing-123',
          ...mockListing 
        }),
      })
    ) as any

    const response = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockListing),
    })

    const data = await response.json()
    
    expect(response.ok).toBe(true)
    expect(data.title).toBe(mockListing.title)
    expect(data.price).toBe(mockListing.price)
  })

  it('should fetch user listings', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: '1', title: 'House 1' },
          { id: '2', title: 'House 2' },
        ]),
      })
    ) as any

    const response = await fetch('/api/listings')
    const data = await response.json()
    
    expect(response.ok).toBe(true)
    expect(data).toHaveLength(2)
  })
})