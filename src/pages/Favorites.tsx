import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { books } from '@/data/books';
import { Book } from '@/data/books';
import { BookCard } from '@/components/BookCard';
import { useAuth } from '@/contexts/AuthContext';

export default function Favorites() {
  const { isAuthenticated, user } = useAuth();
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [forcedVisible, setForcedVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load favorites from localStorage
    const loadFavorites = () => {
      try {
        const favoriteIds = JSON.parse(localStorage.getItem('gleamverse_favorites') || '[]');
        const favBooks = favoriteIds
          .map((id: string) => books.find(book => book.id.toString() === id))
          .filter((book: Book | undefined): book is Book => book !== undefined);
        
        setFavoriteBooks(favBooks);
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();

    // Listen for changes to favorites
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gleamverse_favorites') {
        loadFavorites();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Sign In Required</h1>
          <p className="text-muted-foreground">Please sign in to view your favorites</p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Favorites</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6 text-foreground">Your Favorite Books</h2>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div 
                  key={`skeleton-${i}`} 
                  className="aspect-[1/1.5] rounded-lg bg-card animate-pulse"
                />
              ))}
            </div>
          ) : favoriteBooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favoriteBooks.map(book => (
                <div
                  key={book.id}
                  className="relative group"
                  onPointerDown={() => {
                    const id = book.id.toString();
                    const timer = setTimeout(() => {
                      setForcedVisible(prev => ({ ...prev, [id]: true }));
                    }, 500);
                    (window as any).__favLP = { ...(window as any).__favLP, [id]: timer };
                  }}
                  onPointerUp={() => {
                    const id = book.id.toString();
                    const t = (window as any).__favLP?.[id];
                    if (t) clearTimeout(t);
                  }}
                  onPointerCancel={() => {
                    const id = book.id.toString();
                    const t = (window as any).__favLP?.[id];
                    if (t) clearTimeout(t);
                  }}
                >
                  <BookCard book={book} hideFavoriteOverlay={true} />
                  <button
                    className={`absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-red-600/80 text-white text-sm leading-none flex items-center justify-center ${forcedVisible[book.id.toString()] ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300 shadow hover:bg-red-600`}
                    aria-label="Remove favorite"
                    onClick={() => {
                      const favIds = JSON.parse(localStorage.getItem('gleamverse_favorites') || '[]');
                      const updated = favIds.filter((id: string) => id !== book.id.toString());
                      localStorage.setItem('gleamverse_favorites', JSON.stringify(updated));
                      setFavoriteBooks(prev => prev.filter(b => b.id !== book.id));
                      setForcedVisible(prev => ({ ...prev, [book.id.toString()]: false }));
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-border/50">
              <p className="text-muted-foreground">No favorite books yet</p>
              <p className="text-sm mt-2 text-muted-foreground/70">
                Add books to your favorites by clicking the heart icon on any book card
              </p>
              <Link to="/">
                <Button className="mt-4">Browse Books</Button>
              </Link>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}