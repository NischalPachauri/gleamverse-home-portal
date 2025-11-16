import { describe, it, expect } from 'vitest'
import { findBestMatch } from '../bookCoverUtils'
import { bookCoverMapping } from '../bookCoverMapping'

describe('bookCoverUtils.findBestMatch', () => {
  it('returns exact match cover for known title', () => {
    const title = 'The Great Gatsby'
    const cover = findBestMatch(title)
    expect(cover).toBe(bookCoverMapping[title])
  })

  it('returns null for unrelated title', () => {
    const title = 'Completely Unrelated Title Foo Bar'
    const cover = findBestMatch(title)
    expect(cover).toBeNull()
  })
})