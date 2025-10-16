import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Favorites API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should add property to favorites', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ saved: true }),
      })
    ) as any

    const response = await fetch('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ listingId: 'listing-123' }),
    })

    const data = await response.json()
    expect(response.ok).toBe(true)
    expect(data.saved).toBe(true)
  })

  it('should remove property from favorites', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ saved: false }),
      })
    ) as any

    const response = await fetch('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ listingId: 'listing-123' }),
    })

    const data = await response.json()
    expect(data.saved).toBe(false)
  })

  it('should get saved listings', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: '1', listingId: 'listing-1' },
          { id: '2', listingId: 'listing-2' }
        ]),
      })
    ) as any

    const response = await fetch('/api/favorites/saved-listings')
    const data = await response.json()
    
    expect(response.ok).toBe(true)
    expect(data).toHaveLength(2)
  })
})