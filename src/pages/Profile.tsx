import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, BookOpen, Clock, ArrowLeft, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { books } from '@/data/books';
import { useAuth } from '@/contexts/AuthContext';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import { formatDistanceToNow } from 'date-fns';

// Function to get cover image path
const getCoverImage = (book: typeof books[0]) => {
  // For all books, use a placeholder for now
  return '/placeholder.svg';
};

export default function Profile() {
  const { user, isAuthenticated, signOut } = useAuth();
  const { history, loading } = useReadingHistory();
  const [lastReadBook, setLastReadBook] = useState<typeof books[0] | null>(null);

  useEffect(() => {
    if (history.length > 0) {
      const mostRecent = history[0];
      const book = books.find(b => b.id === mostRecent.book_id);
      setLastReadBook(book || null);
    }
  }, [history]);

  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'U';
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <User className="w-16 h-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Sign In Required</h1>
          <p className="text-muted-foreground">Please sign in to view your profile</p>
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
            <User className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center space-y-4">
                <Avatar className="w-20 h-20 mx-auto">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {user?.user_metadata?.full_name || 'User'}
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mt-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mt-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      Joined {user?.created_at ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true }) : 'recently'}
                    </span>
                  </div>
                </div>

                <Button onClick={handleSignOut} variant="outline" className="w-full">
                  Sign Out
                </Button>
              </div>
            </Card>
          </div>

          {/* Reading Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Last Read Book */}
            {lastReadBook && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Last Read Book</h3>
                </div>
                
                <div className="flex gap-4">
                  <img
                    src={getCoverImage(lastReadBook)}
                    alt={lastReadBook.title}
                    className="w-20 h-30 object-cover rounded shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{lastReadBook.title}</h4>
                    <p className="text-sm text-muted-foreground">{lastReadBook.author}</p>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <span>Page {history[0]?.last_read_page || 0} of {lastReadBook.pages}</span>
                      <span className="mx-2">•</span>
                      <span>
                        Last read {history[0]?.last_read_at ? formatDistanceToNow(new Date(history[0].last_read_at), { addSuffix: true }) : 'recently'}
                      </span>
                    </div>
                    <Link to={`/book/${lastReadBook.id}`}>
                      <Button size="sm" className="mt-3">
                        Continue Reading
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}

            {/* Reading History */}
            <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Reading History</h3>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading reading history...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No reading history yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Start reading books to see your history here</p>
            </div>
              ) : (
                <div className="space-y-3">
                  {history.slice(0, 10).map((item) => {
                    const book = books.find(b => b.id === item.book_id);
                    if (!book) return null;

                  return (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <img
                          src={getCoverImage(book)}
                          alt={book.title}
                          className="w-12 h-16 object-cover rounded shadow-sm"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">{book.title}</h4>
                          <p className="text-sm text-muted-foreground">{book.author}</p>
                          <div className="text-xs text-muted-foreground mt-1">
                            Page {item.last_read_page} of {book.pages}
                            <span className="mx-2">•</span>
                            {formatDistanceToNow(new Date(item.last_read_at), { addSuffix: true })}
                        </div>
                      </div>
                        <Link to={`/book/${book.id}`}>
                          <Button size="sm" variant="outline">
                            Read
                          </Button>
                        </Link>
                    </div>
                  );
                })}
              </div>
            )}
            </Card>
      </div>
        </div>
      </main>
    </div>
  );
}
