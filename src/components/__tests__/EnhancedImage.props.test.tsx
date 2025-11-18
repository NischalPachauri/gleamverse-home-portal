import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EnhancedImage from '../EnhancedImage'

describe('EnhancedImage props', () => {
  it('sets fetchPriority correctly and renders img', async () => {
    render(
      <EnhancedImage bookTitle="Harry Potter and the Philosopher's Stone" alt="hp1" className="w-10 h-10" />
    )
    const img = await screen.findByAltText('hp1')
    expect(img).toBeInTheDocument()
    expect(img.getAttribute('fetchpriority')).toBe('high')
  })
})
