import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PerformanceTester } from '../performanceTester'

describe('performanceTester.runNetworkPerformanceTest', () => {
  const originalFetch = global.fetch as any

  beforeEach(() => {
    // no timers
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('handles rejected requests and counts successes correctly', async () => {
    global.fetch = vi.fn(async (url: string) => {
      if (url === '/assets/images/book-covers/') {
        throw new Error('fail')
      }
      return { ok: true, status: 200 } as Response
    }) as any

    const tester = new PerformanceTester()
    const result = await tester.runNetworkPerformanceTest()
    expect(result.passed).toBeFalsy()
    expect(result.message.toLowerCase()).toContain('failed')
    expect(typeof result.duration).toBe('number')
  })
})