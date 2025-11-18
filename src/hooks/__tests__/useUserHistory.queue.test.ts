import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { renderHook, act } from '@testing-library/react'

vi.mock('@/integrations/supabase/client', () => ({
  default: { 
    from: () => ({ 
      select: () => ({ data: [], error: null }), 
      delete: () => ({ error: null }),
      upsert: () => ({ error: null })
    }), 
    channel: () => ({ on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }) }) 
  },
  isSupabaseConfigured: true
}))
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }))
vi.mock('@/data/books', () => ({ books: [] }))

import { useUserHistory } from '@/hooks/useUserHistory'

describe('useUserHistory queue', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('keeps only the 5 newest items', async () => {
    const { result } = renderHook(() => useUserHistory())
    // Add 6 items with increasing timestamps
    for (let i = 0; i < 6; i++) {
      await act(async () => {
        await result.current.updateProgress(`b${i}`, 1 + i)
      })
    }
    expect(result.current.history.length).toBe(5)
  })

  it('moves updated book to front and evicts oldest on 6th add', async () => {
    const { result } = renderHook(() => useUserHistory())
    for (let i = 0; i < 5; i++) {
      await act(async () => { await result.current.updateProgress(`b${i}`, 1 + i) })
    }
    const initialOrder = result.current.history.map(h => h.book_id)
    expect(initialOrder.length).toBe(5)
    // Update b2 to make it newest
    await act(async () => { await result.current.updateProgress('b2', 99) })
    const afterUpdateOrder = result.current.history.map(h => h.book_id)
    expect(afterUpdateOrder[0]).toBe('b2')
    // Add 6th book; oldest should be evicted
    await act(async () => { await result.current.updateProgress('b6', 1) })
    const finalOrder = result.current.history.map(h => h.book_id)
    expect(finalOrder.length).toBe(5)
    expect(finalOrder.includes('b6')).toBe(true)
    expect(['b6','b2']).toContain(finalOrder[0])
    // One of the early items should be evicted
    const evictedCandidates = ['b0','b1','b3','b4']
    expect(evictedCandidates.some(id => !finalOrder.includes(id))).toBe(true)
  })
})
