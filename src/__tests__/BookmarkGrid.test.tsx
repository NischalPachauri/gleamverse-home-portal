import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import BookmarkGrid from '@/components/BookmarkGrid'
import { BookOpen } from 'lucide-react'

const books = [
  { id: 'b1', title: 'Alpha', author: 'A', pdfPath: '/a.pdf' },
  { id: 'b2', title: 'Beta', author: 'B', pdfPath: '/b.pdf' },
] as any

describe('BookmarkGrid', () => {
  it('renders a 4-column grid on md screens (class check)', () => {
    const { container } = render(<BookmarkGrid books={books} title="Test" icon={BookOpen} id="t" isActive />)
    const grid = container.querySelector('div.grid')
    expect(grid?.className).toContain('md:grid-cols-4')
  })
})
