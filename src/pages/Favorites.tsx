import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
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
            <Heart className="w-6 h-6 text-primary" />
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
                <BookCard key={book.id} book={book} />
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