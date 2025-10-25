import { useState, useEffect, useCallback } from 'react';
import { books as bookList } from '@/data/books';
import { BookCard } from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import { BookMarked } from 'lucide-react';
import { Link } from 'react-router-dom';
import supabase from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalBookmarks } from '@/hooks/useLocalBookmarks';
import { Book } from '@/data/books';

const Bookmarks = () => {
  const { user } = useAuth();
  const { bookmarkedBooks } = useLocalBookmarks();
  const [syncing, setSyncing] = useState(false);

  const getBookStatus = (bookId: string) => {
    const statusMap = JSON.parse(localStorage.getItem('bookStatus') || '{}');
    return statusMap[bookId] || 'Planning to Read';
  };

  const books = bookmarkedBooks
    .map(id => bookList.find(book => book.id === id))
    .filter((book): book is Book => book !== undefined);

  const planningBooks = books.filter(book => getBookStatus(book.id) === 'Planning to Read');
  const readingBooks = books.filter(book => getBookStatus(book.id) === 'Reading');
  const onHoldBooks = books.filter(book => getBookStatus(book.id) === 'On Hold');
  const completedBooks = books.filter(book => getBookStatus(book.id) === 'Completed');

  const handleRemoveBookmark = async (bookId: string) => {
    setSyncing(true);
    try {
      const success = await supabase
        .from('bookmarks')
        .delete()
        .eq('book_id', bookId)
        .eq('user_id', user.id);
      if (success) {
        // toast.success('Book removed from bookmarks');
      } else {
        // toast.error('Failed to remove bookmark');
      }
    } catch (error) {
      // toast.error('Failed to remove bookmark');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white">
      {/* Animated background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - Aligned to left */}
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-8">
          <Link
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors group inline-flex"
            to="/"
          >
            <BookMarked className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Library</span>
          </Link>
        </div>

        {/* Title Section - Larger */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-violet-500/30 to-purple-600/20 border border-violet-400/40 rounded-xl backdrop-blur-sm shadow-lg shadow-violet-500/20">
              <BookMarked className="w-9 h-9 text-violet-300" />
            </div>
            <div>
              <h1 className="text-4xl bg-gradient-to-r from-white via-violet-200 to-blue-200 bg-clip-text text-transparent mb-1">
                Your Bookmarks
              </h1>
              <p className="text-slate-300">Track and organize your reading journey</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-slate-300">You have</p>
            <div className="text-2xl bg-gradient-to-r from-white via-violet-200 to-blue-200 bg-clip-text text-transparent">
              {books.length} {books.length === 1 ? 'Book' : 'Books'}
            </div>
          </div>
        </div>

        {/* Stats Grid - Smaller boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-16">
          {[
            {
              icon: BookMarked,
              count: planningBooks.length,
              label: 'Planning to read',
              color: 'from-blue-500/30 to-blue-600/20',
              iconColor: 'text-blue-300',
              borderColor: 'border-blue-400/40',
              glowColor: 'shadow-blue-500/20'
            },
            {
              icon: BookMarked,
              count: readingBooks.length,
              label: 'Reading',
              color: 'from-violet-500/30 to-purple-600/20',
              iconColor: 'text-violet-300',
              borderColor: 'border-violet-400/40',
              glowColor: 'shadow-violet-500/20'
            },
            {
              icon: BookMarked,
              count: onHoldBooks.length,
              label: 'On hold',
              color: 'from-orange-500/30 to-amber-600/20',
              iconColor: 'text-orange-300',
              borderColor: 'border-orange-400/40',
              glowColor: 'shadow-orange-500/20'
            },
            {
              icon: BookMarked,
              count: completedBooks.length,
              label: 'Completed',
              color: 'from-teal-500/30 to-emerald-600/20',
              iconColor: 'text-teal-300',
              borderColor: 'border-teal-400/40',
              glowColor: 'shadow-teal-500/20'
            }
          ].map((stat, index) => (
            <div
              key={index}
              className={`group relative bg-gradient-to-br ${stat.color} backdrop-blur-sm border ${stat.borderColor} rounded-xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-xl ${stat.glowColor}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Glow effect on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300`} />
              
              <div className="relative flex items-center gap-3">
                <div className={`p-2 bg-slate-900/60 rounded-lg ${stat.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl mb-0.5 text-white">{stat.count}</div>
                  <div className="text-slate-300 text-xs">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-8">
              {/* Animated rings */}
              <div className="absolute inset-0 bg-violet-500/20 rounded-full animate-ping" />
              <div className="absolute inset-0 bg-violet-500/10 rounded-full animate-pulse" />
              
              {/* Icon container */}
              <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-violet-500/30 rounded-3xl p-8 shadow-2xl shadow-violet-500/20">
                <div className="bg-gradient-to-br from-violet-500/40 to-blue-500/30 rounded-2xl p-6">
                  <BookMarked className="w-16 h-16 text-violet-200" />
                </div>
              </div>
            </div>

            <h2 className="mb-3 text-white text-2xl">
              No bookmarks yet
            </h2>
            <p className="text-slate-300 mb-8 text-center max-w-md">
              Start adding books to your reading lists
            </p>

            <Link
              className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-8 py-6 rounded-xl shadow-lg shadow-violet-500/40 hover:shadow-violet-500/60 transition-all duration-300 border-0 inline-block"
              to="/"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Planning to read */}
            {planningBooks.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-4">Planning to Read</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {planningBooks.map((book) => (
                    <div key={book.id} className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-violet-400/20 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/20 hover:border-violet-400/40">
                      <Link to={`/book/${book.id}`} className="block">
                        <div className="relative overflow-hidden aspect-[2/3] bg-gradient-to-br from-violet-500/10 to-blue-500/10">
                          <img
                            src={`/book-covers/${book.id}.svg`}
                            alt={book.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-violet-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                      </Link>
                      
                      <div className="p-4 space-y-2">
                        <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-white group-hover:text-violet-300 transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-sm text-slate-300">{book.author}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
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
                        className="absolute top-2 right-2 h-8 w-8 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/80 hover:bg-red-600 border-0"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveBookmark(book.id);
                        }}
                        disabled={syncing}
                      >
                        {syncing ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <BookMarked className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Reading */}
            {readingBooks.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-4">Reading</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {readingBooks.map((book) => (
                    <div key={book.id} className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-violet-400/20 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/20 hover:border-violet-400/40">
                      <Link to={`/book/${book.id}`} className="block">
                        <div className="relative overflow-hidden aspect-[2/3] bg-gradient-to-br from-violet-500/10 to-blue-500/10">
                          <img
                            src={`/book-covers/${book.id}.svg`}
                            alt={book.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-violet-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                      </Link>
                      
                      <div className="p-4 space-y-2">
                        <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-white group-hover:text-violet-300 transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-sm text-slate-300">{book.author}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
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
                        className="absolute top-2 right-2 h-8 w-8 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/80 hover:bg-red-600 border-0"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveBookmark(book.id);
                        }}
                        disabled={syncing}
                      >
                        {syncing ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <BookMarked className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* On hold */}
            {onHoldBooks.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-4">On Hold</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {onHoldBooks.map((book) => (
                    <div key={book.id} className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-violet-400/20 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/20 hover:border-violet-400/40">
                      <Link to={`/book/${book.id}`} className="block">
                        <div className="relative overflow-hidden aspect-[2/3] bg-gradient-to-br from-violet-500/10 to-blue-500/10">
                          <img
                            src={`/book-covers/${book.id}.svg`}
                            alt={book.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-violet-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                      </Link>
                      
                      <div className="p-4 space-y-2">
                        <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-white group-hover:text-violet-300 transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-sm text-slate-300">{book.author}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
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
                        className="absolute top-2 right-2 h-8 w-8 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/80 hover:bg-red-600 border-0"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveBookmark(book.id);
                        }}
                        disabled={syncing}
                      >
                        {syncing ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <BookMarked className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Completed */}
            {completedBooks.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-4">Completed</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {completedBooks.map((book) => (
                    <div key={book.id} className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-violet-400/20 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/20 hover:border-violet-400/40">
                      <Link to={`/book/${book.id}`} className="block">
                        <div className="relative overflow-hidden aspect-[2/3] bg-gradient-to-br from-violet-500/10 to-blue-500/10">
                          <img
                            src={`/book-covers/${book.id}.svg`}
                            alt={book.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-violet-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                      </Link>
                      
                      <div className="p-4 space-y-2">
                        <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-white group-hover:text-violet-300 transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-sm text-slate-300">{book.author}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
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
                        className="absolute top-2 right-2 h-8 w-8 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/80 hover:bg-red-600 border-0"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveBookmark(book.id);
                        }}
                        disabled={syncing}
                      >
                        {syncing ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <BookMarked className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
