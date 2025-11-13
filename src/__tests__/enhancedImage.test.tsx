import { describe, it, expect, vi, beforeAll } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import * as mapping from '@/utils/bookCoverMapping'
import EnhancedImage from '@/components/EnhancedImage'

describe('EnhancedImage', () => {
  beforeAll(() => {
    // Mock global Image to immediately load
    // @ts-expect-error
    global.Image = class MockImage {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      set src(_v: string) {
        setTimeout(() => this.onload && this.onload(), 0)
      }
      set decoding(_v: any) {}
    } as any
  })

  it('loads and displays book cover', async () => {
    vi.spyOn(mapping, 'getBookCover').mockReturnValue('/BookCoversNew/test.png')
    render(
      <div style={{ width: 100, height: 150 }}>
        <EnhancedImage bookTitle="Test Book" alt="Test" />
      </div>
    )
    const img = await screen.findByAltText('Test')
    expect(img).toHaveAttribute('src', '/BookCoversNew/test.png')
  })
})

