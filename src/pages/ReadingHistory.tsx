import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, Clock, Calendar, TrendingUp, 
  CheckCircle2, BookMarked, ArrowRight 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ReadingHistory() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { history, loading, getContinueReading, getRecentlyFinished } = useReadingHistory();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const continueReading = getContinueReading();
  const recentlyFinished = getRecentlyFinished();

  const formatReadingTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your reading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Reading History</h1>
          <p className="text-muted-foreground">Track your reading progress and discover your reading patterns</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Books</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{history.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {history.filter(h => h.completed_at).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>In Progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {history.filter(h => !h.completed_at).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Reading Time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatReadingTime(
                  history.reduce((acc, h) => acc + h.reading_time_seconds, 0)
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Continue Reading Section */}
        {continueReading.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Continue Reading
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {continueReading.map((book) => (
                <Card key={book.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate(`/book/${book.book_id}`)}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-1">{book.book_title}</CardTitle>
                        <CardDescription>{book.book_author}</CardDescription>
                      </div>
                      <Badge variant="secondary">{book.progress_percentage}%</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={book.progress_percentage} className="mb-3" />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{book.current_page} / {book.total_pages} pages</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(book.last_read_at), { addSuffix: true })}
                      </span>
                    </div>
                    <Button className="w-full mt-3" size="sm">
                      Continue Reading
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recently Finished Section */}
        {recentlyFinished.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Recently Finished
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentlyFinished.map((book) => (
                <Card key={book.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate(`/book/${book.book_id}`)}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-1">{book.book_title}</CardTitle>
                        <CardDescription>{book.book_author}</CardDescription>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4" />
                        Finished {formatDistanceToNow(new Date(book.completed_at!), { addSuffix: true })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Total time: {formatReadingTime(book.reading_time_seconds)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Books */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <BookMarked className="h-6 w-6" />
            All Books
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((book) => (
              <Card key={book.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/book/${book.book_id}`)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1">{book.book_title}</CardTitle>
                      <CardDescription>{book.book_author}</CardDescription>
                    </div>
                    {book.completed_at ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Badge variant="secondary">{book.progress_percentage}%</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!book.completed_at && (
                    <Progress value={book.progress_percentage} className="mb-3" />
                  )}
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-3 w-3" />
                      Started {formatDistanceToNow(new Date(book.started_at), { addSuffix: true })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Last read {formatDistanceToNow(new Date(book.last_read_at), { addSuffix: true })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {history.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No reading history yet</h3>
              <p className="text-muted-foreground mb-4">
                Start reading books to track your progress here
              </p>
              <Button onClick={() => navigate('/')}>
                Browse Books
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
