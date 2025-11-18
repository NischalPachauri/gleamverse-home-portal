import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import BookmarkGrid from '@/components/BookmarkGrid'
import { BookOpen } from 'lucide-react'

vi.mock('@/hooks/useBookmarks', () => {
  const updateBookmarkStatus = vi.fn()
  const addBookmark = vi.fn()
  const removeBookmark = vi.fn()
  return {
    useBookmarks: () => ({
      bookmarks: ['b1'],
      bookmarkStatuses: { b1: 'Reading' },
      updateBookmarkStatus,
      addBookmark,
      removeBookmark,
    }),
  }
})

const books = [
  { id: 'b1', title: 'Alpha', author: 'A', pdfPath: '/a.pdf' },
] as any

describe('BookmarkGrid interactions', () => {
  it('renders bookmark options trigger overlay', async () => {
    const { container } = render(<BookmarkGrid books={books} title="Test" icon={BookOpen} id="t" isActive />)
    const trigger = container.querySelector('button[aria-label="Bookmark options"]')
    expect(trigger).toBeTruthy()
  })
})