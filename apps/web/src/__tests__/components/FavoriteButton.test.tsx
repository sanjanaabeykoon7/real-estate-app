import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FavoriteButton from '@/components/FavoriteButton'

// Mock useSession
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { id: '123', email: 'test@example.com' } },
    status: 'authenticated',
  }),
}))

describe('FavoriteButton Component', () => {
  it('renders favorite button', () => {
    render(<FavoriteButton listingId="listing-123" />)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('toggles favorite status on click', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ saved: false }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ saved: true }),
      })

    render(<FavoriteButton listingId="listing-123" />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/favorites',
        expect.objectContaining({
          method: 'POST',
        })
      )
    })
  })
})