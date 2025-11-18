import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUserHistory } from '@/hooks/useUserHistory'

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }))
vi.stubGlobal('localStorage', {
  getItem: vi.fn((k: string) => (globalThis as any).__store?.[k] || null),
  setItem: vi.fn((k: string, v: string) => { (globalThis as any).__store = { ...(globalThis as any).__store, [k]: v } }),
  removeItem: vi.fn(),
  clear: vi.fn(),
})

describe('useUserHistory guest mode', () => {
  beforeEach(() => { (globalThis as any).__store = {} })

  it('loads empty guest history by default', () => {
    const { result } = renderHook(() => useUserHistory())
    expect(result.current.history.length).toBe(0)
  })

  it('updates and persists guest progress', async () => {
    const { result } = renderHook(() => useUserHistory())
    await act(async () => { await result.current.updateProgress('book-1', 5, 100) })
    expect(result.current.history.length).toBe(1)
    expect(JSON.parse((localStorage.getItem as any)('guest_history'))[0].book_id).toBe('book-1')
  })
})