import { describe, it, expect } from 'vitest'
import { getBookCover } from '../bookCoverMapping'

describe('getBookCover', () => {
  it('maps both apostrophe and non-apostrophe HP1 titles', () => {
    const a = getBookCover("Harry Potter and the Philosopher's Stone")
    const b = getBookCover('Harry Potter and the Philosophers Stone')
    expect(a.startsWith('/BookCoversNew/')).toBe(true)
    expect(b.startsWith('/BookCoversNew/')).toBe(true)
  })

  it('falls back to placeholder for unknown title', () => {
    const p = getBookCover('Unknown Book XYZ')
    expect(p).toBe('/placeholder.svg')
  })
})
