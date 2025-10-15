import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AuthModal from '@/components/AuthModal'

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}))

describe('AuthModal Component', () => {
  it('renders login form by default', () => {
    render(<AuthModal isOpen={true} onClose={vi.fn()} />)
    
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('switches to register mode', () => {
    render(<AuthModal isOpen={true} onClose={vi.fn()} />)
    
    const registerButton = screen.getByRole('button', { name: /register here/i })
    fireEvent.click(registerButton)
    
    expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/retype password/i)).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn()
    render(<AuthModal isOpen={true} onClose={onClose} />)
    
    const closeButton = screen.getByRole('button', { name: /close modal/i })
    fireEvent.click(closeButton)
    
    expect(onClose).toHaveBeenCalled()
  })
})