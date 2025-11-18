import { describe, it, expect } from 'vitest'
import { resolveWSBase } from '@/utils/ws'

describe('resolveWSBase', () => {
  it('uses ws for http and current port', () => {
    Object.defineProperty(window, 'location', { value: { protocol: 'http:', hostname: 'localhost', port: '5173' }, writable: true })
    const base = resolveWSBase()
    expect(base).toBe('ws://localhost:5173')
  })
  it('uses wss for https and omits port when empty', () => {
    Object.defineProperty(window, 'location', { value: { protocol: 'https:', hostname: 'example.com', port: '' }, writable: true })
    const base = resolveWSBase()
    expect(base).toBe('wss://example.com')
  })
})

