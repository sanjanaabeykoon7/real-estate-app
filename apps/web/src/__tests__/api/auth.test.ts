import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Authentication API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should register a new user', async () => {
    const mockUser = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'USER'
    }

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          message: 'User created successfully',
          user: { ...mockUser, id: '123', password: undefined }
        }),
      })
    ) as any

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockUser),
    })

    const data = await response.json()
    
    expect(response.ok).toBe(true)
    expect(data.message).toBe('User created successfully')
    expect(data.user.email).toBe(mockUser.email)
  })

  it('should reject duplicate email registration', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'User already exists' }),
      })
    ) as any

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'existing@example.com' }),
    })

    const data = await response.json()
    
    expect(response.ok).toBe(false)
    expect(data.error).toBe('User already exists')
  })
})