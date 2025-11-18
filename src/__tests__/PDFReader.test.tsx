import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { PDFReader } from '@/components/PDFReader'

vi.mock('react-pdf', () => ({
  Document: ({ children }: any) => children,
  Page: () => null,
  pdfjs: {},
}))

describe('PDFReader header visibility', () => {
  it('renders sticky header wrapper immediately', () => {
    const { container } = render(
      <PDFReader pdfPath="/dummy.pdf" title="Dummy" author="Author" />
    )
    const sticky = container.querySelector('.sticky.top-0')
    expect(sticky).toBeTruthy()
  })
})