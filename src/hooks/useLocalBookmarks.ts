import { useState, useEffect } from 'react';

const BOOKMARKS_KEY = 'gleamverse_bookmarks';

const useLocalBookmarks = () => {
  const [bookmarkedBooks, setBookmarkedBooks] = useState<string[]>([]);

  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]');
    setBookmarkedBooks(bookmarks);
  }, []);

  const addBookmark = (bookId: string) => {
    const updatedBookmarks = [...bookmarkedBooks, bookId];
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
    setBookmarkedBooks(updatedBookmarks);
  };

  const removeBookmark = (bookId: string) => {
    const updatedBookmarks = bookmarkedBooks.filter(id => id !== bookId);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
    setBookmarkedBooks(updatedBookmarks);
  };

  return {
    bookmarkedBooks,
    addBookmark,
    removeBookmark
  } as const;
};

export { useLocalBookmarks };
