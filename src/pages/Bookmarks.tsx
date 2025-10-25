import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, BookMarked, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { books } from '@/data/books';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Function to get cover image path
const getCoverImage = (book: typeof books[0]) => {
  // For all books, use a placeholder for now
  return '/placeholder.svg';
};

export default function Bookmarks() {
  const { user, isAuthenticated } = useAuth();
  const { bookmarks, loading, removeBookmark } = useBookmarks();
  const [removing, setRemoving] = useState<string | null>(null);

  const handleRemoveBookmark = async (bookId: string) => {
    setRemoving(bookId);
    try {
      const success = await removeBookmark(bookId);
      if (success) {
        toast.success('Book removed from bookmarks');
      } else {
        toast.error('Failed to remove bookmark');
      }
    } catch (error) {
      toast.error('Failed to remove bookmark');
    } finally {
      setRemoving(null);
    }
  };

  const bookmarkedBooks = books.filter(book => bookmarks.includes(book.id));

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <BookMarked className="w-16 h-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Sign In Required</h1>
          <p className="text-muted-foreground">Please sign in to view your bookmarks</p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your bookmarks...</p>
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
            <BookMarked className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">My Bookmarks</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {bookmarkedBooks.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Bookmarks Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start bookmarking books to save them for later reading
            </p>
            <Link to="/">
              <Button>Browse Books</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {bookmarkedBooks.length} Bookmarked {bookmarkedBooks.length === 1 ? 'Book' : 'Books'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {bookmarkedBooks.map((book) => (
                <Card key={book.id} className="group relative overflow-hidden bg-card border border-border/50 transition-all duration-300 hover:shadow-lg hover:border-primary/30">
                  <Link to={`/book/${book.id}`} className="block">
                    <div className="relative overflow-hidden aspect-[2/3] bg-gradient-to-br from-primary/5 to-secondary/5">
                      <img
                        src={getCoverImage(book)}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </Link>
                  
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{book.author}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{book.year}</span>
                      <span>•</span>
                      <span>{book.pages} pages</span>
                      <span>•</span>
                      <span>{book.genre}</span>
                    </div>
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveBookmark(book.id);
                    }}
                    disabled={removing === book.id}
                  >
                    {removing === book.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
