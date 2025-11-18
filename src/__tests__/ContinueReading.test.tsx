import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import EnhancedImage from '@/components/EnhancedImage'

type ContinueReadingItem = { id: string; title: string; author: string; coverImage: string; gradient: string }

const ContinueReadingDesign = ({ books }: { books: ContinueReadingItem[] }) => (
  <div className="relative w-full overflow-x-auto snap-x snap-mandatory scroll-smooth">
    <div className="flex gap-4 min-w-full">
      {books.slice(0,5).map(b => (
        <div key={b.id} className="snap-start shrink-0 lg:basis-[calc((100%-64px)/5)]">
          <div className="aspect-[3/4]"><EnhancedImage bookTitle={b.title} alt={b.title} /></div>
        </div>
      ))}
    </div>
  </div>
)

describe('ContinueReadingDesign', () => {
  it('renders up to five items', () => {
    const items = Array.from({ length: 7 }).map((_, i) => ({ id: String(i), title: `T${i}`, author: 'A', coverImage: '', gradient: '' }))
    const { container } = render(<ContinueReadingDesign books={items} />)
    const cards = container.querySelectorAll('.snap-start')
    expect(cards.length).toBe(5)
  })
})