import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user' }, isAuthenticated: true })
}));

const insertMock = vi.fn(async () => ({ data: null, error: null }));
const deleteMock = vi.fn(async () => ({ data: null, error: null }));
const updateMock = vi.fn(async () => ({ data: null, error: null }));
const selectMock = vi.fn(async () => ({ data: [
  { metadata: { book_id: 'book-1', status: 'Planning to Read' }, url: '/books/b1.pdf', title: 'B1' },
  { metadata: { book_id: 'book-2', status: 'Reading' }, url: '/books/b2.pdf', title: 'B2' },
], error: null }));

vi.mock('@/integrations/supabase/client', () => ({
  default: {
    from: () => ({
      select: selectMock,
      insert: insertMock,
      delete: deleteMock,
      update: updateMock,
      eq: () => ({ select: selectMock, delete: deleteMock, update: updateMock })
    }),
    channel: () => ({ on: () => ({ subscribe: () => ({ unsubscribe: vi.fn() }) }) })
  }
}));

import { useBookmarks } from '@/hooks/useBookmarks';

describe('useBookmarks', () => {
  it('loads bookmarks and statuses from Supabase', async () => {
    const { result } = renderHook(() => useBookmarks());
    expect(result.current.loading).toBe(true);
    // allow async effect to run
    await act(async () => {});
    expect(result.current.loading).toBe(false);
    expect(result.current.bookmarks).toEqual(['book-1', 'book-2']);
    expect(result.current.bookmarkStatuses['book-2']).toBe('Reading');
  });

  it('adds and removes a bookmark', async () => {
    const { result } = renderHook(() => useBookmarks());
    await act(async () => {});

    await act(async () => {
      await result.current.addBookmark('book-3');
    });
    expect(insertMock).toHaveBeenCalled();
    expect(result.current.bookmarks).toContain('book-3');

    await act(async () => {
      await result.current.removeBookmark('book-3');
    });
    expect(deleteMock).toHaveBeenCalled();
    expect(result.current.bookmarks).not.toContain('book-3');
  });

  it('updates bookmark status', async () => {
    const { result } = renderHook(() => useBookmarks());
    await act(async () => {});
    await act(async () => {
      await result.current.updateBookmarkStatus('book-1', 'Completed');
    });
    expect(updateMock).toHaveBeenCalled();
    expect(result.current.bookmarkStatuses['book-1']).toBe('Completed');
  });

  it('enforces reading queue limit silently', async () => {
    const { result } = renderHook(() => useBookmarks());
    await act(async () => {});
    // Simulate adding more than 5 reading items
    for (let i = 3; i <= 9; i++) {
      await act(async () => {
        await result.current.addBookmark(`book-${i}`, 'Reading');
      });
    }
    // The hook maintains state; server-side deletions are not visible here, but no errors should occur
    expect(result.current.operationState.status).toBe('success');
  });

  it('clears all bookmarks', async () => {
    const { result } = renderHook(() => useBookmarks());
    await act(async () => {});
    await act(async () => {
      await result.current.clearAllBookmarks();
    });
    expect(result.current.bookmarks.length).toBe(0);
  });
});