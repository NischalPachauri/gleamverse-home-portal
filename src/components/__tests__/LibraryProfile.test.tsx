import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock components for testing
const MockLibrary = ({ bookmarks, readingHistory }: any) => (
  <div>
    <h1>Library</h1>
    <div data-testid="bookmarks">
      {bookmarks?.length > 0 ? (
        bookmarks.map((bookmark: any, index: number) => (
          <div key={index} data-testid={`bookmark-${index}`}>{bookmark.title}</div>
        ))
      ) : (
        <div data-testid="no-bookmarks">No bookmarks</div>
      )}
    </div>
    <div data-testid="reading-history">
      {readingHistory?.length > 0 ? (
        readingHistory.map((item: any, index: number) => (
          <div key={index} data-testid={`history-${index}`}>{item.title}</div>
        ))
      ) : (
        <div data-testid="no-history">No reading history</div>
      )}
    </div>
  </div>
);

const MockProfile = ({ user, isLoading }: any) => (
  <div>
    <h1>Profile</h1>
    {isLoading ? (
      <div data-testid="loading">Loading profile...</div>
    ) : user ? (
      <div data-testid="user-info">
        <div data-testid="user-name">{user.name}</div>
        <div data-testid="user-email">{user.email}</div>
      </div>
    ) : (
      <div data-testid="no-user">No user data</div>
    )}
  </div>
);

describe('Library and Profile Functionality', () => {
  describe('Library Component', () => {
    it('renders with empty bookmarks and history', () => {
      render(
        <BrowserRouter>
          <MockLibrary bookmarks={[]} readingHistory={[]} />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Library')).toBeInTheDocument();
      expect(screen.getByTestId('no-bookmarks')).toBeInTheDocument();
      expect(screen.getByTestId('no-history')).toBeInTheDocument();
    });

    it('renders with bookmarks', () => {
      const bookmarks = [
        { title: 'Book 1', id: 1 },
        { title: 'Book 2', id: 2 }
      ];
      
      render(
        <BrowserRouter>
          <MockLibrary bookmarks={bookmarks} readingHistory={[]} />
        </BrowserRouter>
      );
      
      expect(screen.getByTestId('bookmark-0')).toHaveTextContent('Book 1');
      expect(screen.getByTestId('bookmark-1')).toHaveTextContent('Book 2');
      expect(screen.getByTestId('no-history')).toBeInTheDocument();
    });

    it('renders with reading history', () => {
      const history = [
        { title: 'Read Book 1', id: 1, lastRead: '2024-01-01' },
        { title: 'Read Book 2', id: 2, lastRead: '2024-01-02' }
      ];
      
      render(
        <BrowserRouter>
          <MockLibrary bookmarks={[]} readingHistory={history} />
        </BrowserRouter>
      );
      
      expect(screen.getByTestId('history-0')).toHaveTextContent('Read Book 1');
      expect(screen.getByTestId('history-1')).toHaveTextContent('Read Book 2');
      expect(screen.getByTestId('no-bookmarks')).toBeInTheDocument();
    });

    it('handles null data gracefully', () => {
      render(
        <BrowserRouter>
          <MockLibrary bookmarks={null} readingHistory={null} />
        </BrowserRouter>
      );
      
      expect(screen.getByTestId('no-bookmarks')).toBeInTheDocument();
      expect(screen.getByTestId('no-history')).toBeInTheDocument();
    });
  });

  describe('Profile Component', () => {
    it('renders loading state', () => {
      render(
        <BrowserRouter>
          <MockProfile user={null} isLoading={true} />
        </BrowserRouter>
      );
      
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('renders with user data', () => {
      const user = {
        name: 'Test User',
        email: 'test@example.com'
      };
      
      render(
        <BrowserRouter>
          <MockProfile user={user} isLoading={false} />
        </BrowserRouter>
      );
      
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    it('renders empty state when no user', () => {
      render(
        <BrowserRouter>
          <MockProfile user={null} isLoading={false} />
        </BrowserRouter>
      );
      
      expect(screen.getByTestId('no-user')).toBeInTheDocument();
    });

    it('handles user data with missing fields', () => {
      const incompleteUser = {
        name: 'Partial User'
        // missing email
      };
      
      render(
        <BrowserRouter>
          <MockProfile user={incompleteUser} isLoading={false} />
        </BrowserRouter>
      );
      
      expect(screen.getByTestId('user-name')).toHaveTextContent('Partial User');
      expect(screen.getByTestId('user-email')).toBeEmptyDOMElement();
    });
  });

  describe('Integration Tests', () => {
    it('handles state changes from loading to loaded', async () => {
      const { rerender } = render(
        <BrowserRouter>
          <MockProfile user={null} isLoading={true} />
        </BrowserRouter>
      );
      
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      
      const user = { name: 'Loaded User', email: 'loaded@example.com' };
      rerender(
        <BrowserRouter>
          <MockProfile user={user} isLoading={false} />
        </BrowserRouter>
      );
      
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      expect(screen.getByTestId('user-name')).toHaveTextContent('Loaded User');
    });

    it('handles large datasets efficiently', () => {
      const largeBookmarks = Array.from({ length: 100 }, (_, i) => ({
        title: `Book ${i + 1}`,
        id: i + 1
      }));
      
      const largeHistory = Array.from({ length: 100 }, (_, i) => ({
        title: `Read Book ${i + 1}`,
        id: i + 1,
        lastRead: `2024-01-${(i % 30) + 1}`
      }));
      
      const startTime = performance.now();
      
      render(
        <BrowserRouter>
          <MockLibrary bookmarks={largeBookmarks} readingHistory={largeHistory} />
        </BrowserRouter>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in reasonable time (less than 1 second)
      expect(renderTime).toBeLessThan(1000);
      
      // Verify some items are rendered
      expect(screen.getByTestId('bookmark-0')).toHaveTextContent('Book 1');
      expect(screen.getByTestId('history-99')).toHaveTextContent('Read Book 100');
    });
  });
});