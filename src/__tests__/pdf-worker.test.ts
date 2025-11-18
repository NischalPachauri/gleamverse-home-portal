import { describe, it, expect } from 'vitest'
import { getWorkerSrc } from '@/utils/pdfWorker'

describe('pdf worker', () => {
  it('returns a valid worker url string', () => {
    const url = getWorkerSrc()
    expect(typeof url).toBe('string')
    expect(url.includes('pdf.worker')).toBe(true)
  })
})

