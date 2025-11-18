import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'
import { BookCard } from '@/components/BookCard'

vi.mock('@/hooks/useBookmarks', () => {
  return {
    useBookmarks: () => ({
      bookmarks: [],
      bookmarkStatuses: {},
      addBookmark: vi.fn(),
      removeBookmark: vi.fn(),
      updateBookmarkStatus: vi.fn(),
    }),
  }
})

vi.mock('@/hooks/useUserHistory', () => ({ useUserHistory: () => ({ getProgress: () => null }) }))
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ isAuthenticated: true }) }))
vi.mock('@/utils/bookMetadataRegistry', () => ({ applyMetadata: (b: any) => b }))

const book: any = { id: 'b1', title: 'Alpha', author: 'A', pdfPath: '/a.pdf' }

describe('BookCard bookmark dropdown', () => {
  it('renders bookmark options trigger in compact mode', () => {
    const { container } = render(
      <MemoryRouter>
        <BookCard book={book} compact />
      </MemoryRouter>
    )
    const trigger = container.querySelector('button[aria-label="Bookmark options"]')
    expect(trigger).toBeTruthy()
  })
})