import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import SearchBar from '@/components/SearchBar'

// Mock useRouter
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(),
}))

describe('SearchBar Component', () => {
  it('renders search form with all fields', () => {
    render(<SearchBar />)
    
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/min price/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/max price/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/bedrooms/i)).toBeInTheDocument()
  })

  it('handles search submission', () => {
    render(<SearchBar />)
    
    const cityInput = screen.getByLabelText(/location/i)
    fireEvent.change(cityInput, { target: { value: 'Colombo' } })
    
    const searchButton = screen.getByRole('button', { name: /search/i })
    fireEvent.click(searchButton)
    
    expect(mockPush).toHaveBeenCalled()
  })

  it('handles reset button', () => {
    render(<SearchBar />)
    
    const cityInput = screen.getByLabelText(/location/i) as HTMLInputElement
    fireEvent.change(cityInput, { target: { value: 'Colombo' } })
    
    const resetButton = screen.getByRole('button', { name: /reset/i })
    fireEvent.click(resetButton)
    
    expect(mockPush).toHaveBeenCalledWith('/')
  })
})