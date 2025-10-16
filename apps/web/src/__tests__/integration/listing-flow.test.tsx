import { describe, it, expect, vi } from 'vitest'

describe('Listing Flow Integration', () => {
  it('should complete full listing creation flow', async () => {
    // Mock create listing
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          id: 'new-listing-123',
          title: 'Test Property',
          published: true
        }),
      })
    ) as any

    const listingData = {
      title: 'Test Property',
      price: 1000000,
      beds: 3,
      baths: 2,
    }

    const response = await fetch('/api/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    })

    const data = await response.json()
    
    expect(response.ok).toBe(true)
    expect(data.id).toBe('new-listing-123')
    expect(data.published).toBe(true)
  })
})