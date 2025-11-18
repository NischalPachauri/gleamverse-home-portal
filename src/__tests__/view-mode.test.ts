import { describe, it, expect } from 'vitest'
import { normalizePageForMode, setSavedViewMode, getSavedViewMode } from '@/utils/viewMode'

describe('view mode utils', () => {
  it('normalizes even pages in double mode', () => {
    expect(normalizePageForMode(4, 'double')).toBe(3)
    expect(normalizePageForMode(5, 'double')).toBe(5)
  })
  it('does not change pages in single mode', () => {
    expect(normalizePageForMode(4, 'single')).toBe(4)
  })
  it('persists and retrieves mode', () => {
    setSavedViewMode('single')
    expect(getSavedViewMode()).toBe('single')
    setSavedViewMode('double')
    expect(getSavedViewMode()).toBe('double')
  })
})

