import { describe, it, expect, vi } from 'vitest'

describe('Upload API', () => {
  it('should upload image successfully', async () => {
    const mockUrl = 'https://cloudinary.com/image.jpg'
    
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ url: mockUrl }),
      })
    ) as any

    const formData = new FormData()
    formData.append('file', new File([''], 'test.jpg'))

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    expect(response.ok).toBe(true)
    expect(data.url).toBe(mockUrl)
  })

  it('should handle upload failure', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Upload failed' }),
      })
    ) as any

    const response = await fetch('/api/upload', {
      method: 'POST',
    })

    expect(response.ok).toBe(false)
  })
})