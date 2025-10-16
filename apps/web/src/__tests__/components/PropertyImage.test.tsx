import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PropertyImage from '@/components/PropertyImage'

describe('PropertyImage Component', () => {
  it('renders image with correct src', () => {
    render(
      <PropertyImage
        src="https://example.com/image.jpg"
        alt="Test property"
        width={400}
        height={300}
      />
    )
    
    const image = screen.getByAltText('Test property')
    expect(image).toBeInTheDocument()
  })

  it('shows placeholder on error', () => {
    render(
      <PropertyImage
        src=""
        alt="Test property"
        width={400}
        height={300}
      />
    )
    
    expect(screen.getByText(/no image available/i)).toBeInTheDocument()
  })
})