import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { books as bookList } from '@/data/books';
import { Button } from '@/components/ui/button';
import { BookMarked, BookOpen, Clock, CheckCircle2, Loader2, ArrowLeft, Filter, SortAsc, Calendar, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { Grid, List, Plus } from 'lucide-react';
import { Book } from '@/types/book';
import { books } from '@/data/books';
import { toast } from 'sonner';
import BookmarkGrid from '@/components/BookmarkGrid';
import { getBookCover } from '@/utils/bookCoverMapping';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define section types for navigation
type BookmarkSection = 'planning' | 'reading' | 'on-hold' | 'completed';

export default function Bookmarks() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { 
    bookmarks: bookmarkedBooks, 
    bookmarkStatuses, 
    removeBookmark, 
    updateBookmarkStatus,
    clearAllBookmarks,
    operationState,
    loading: bookmarksLoading 
  } = useBookmarks();
  const syncing = operationState.status === 'loading';
  const [countLoading, setCountLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<BookmarkSection>('planning');
  
  // Refs for section scrolling
  const planningRef = useRef<HTMLDivElement>(null);
  const readingRef = useRef<HTMLDivElement>(null);
  const onHoldRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef<HTMLDivElement>(null);

  // Debounce function for scroll events
  const debounce = <T extends (...args: unknown[]) => void>(fn: T, ms = 300) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function(...args: Parameters<T>) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), ms);
    };
  };

  const getBookStatus = (bookId: string) => {
    return bookmarkStatuses[bookId] || 'Planning to Read';
  };

  // Process books with loading state
  const [processedBooks, setProcessedBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  
  // Track when books were added to bookmarks
  const [bookAddDates, setBookAddDates] = useState<Record<string, number>>({});
  
  useEffect(() => {
    // Load or initialize book add dates
    try {
      const storedDates = localStorage.getItem('bookmark_add_dates');
      if (storedDates) {
        setBookAddDates(JSON.parse(storedDates));
      } else {
        // Initialize with current timestamps if not exists
        const initialDates: Record<string, number> = {};
        bookmarkedBooks.forEach(id => {
          initialDates[id] = Date.now();
        });
        localStorage.setItem('bookmark_add_dates', JSON.stringify(initialDates));
        setBookAddDates(initialDates);
      }
    } catch (error) {
      console.error('Error loading bookmark dates:', error);
    }
  }, [bookmarkedBooks]);
  
  // Save new bookmark dates when bookmarks change
  useEffect(() => {
    const updatedDates = {...bookAddDates};
    bookmarkedBooks.forEach(id => {
      if (!updatedDates[id]) {
        updatedDates[id] = Date.now();
      }
    });
    
    // Remove dates for books no longer bookmarked
    Object.keys(updatedDates).forEach(id => {
      if (!bookmarkedBooks.includes(id)) {
        delete updatedDates[id];
      }
    });
    
    localStorage.setItem('bookmark_add_dates', JSON.stringify(updatedDates));
    setBookAddDates(updatedDates);
  }, [bookmarkedBooks, bookAddDates]);
  
  useEffect(() => {
    setCountLoading(true);
    const books = bookmarkedBooks
      .map(id => bookList.find(book => book.id === id))
      .filter((book): book is Book => book !== undefined);
    setProcessedBooks(books);
    setCountLoading(false);
  }, [bookmarkedBooks]);

  // Prefetch covers so they appear instantly when bookmarks change
  useEffect(() => {
    const coverLoaded: Set<string> = (window as any).__coverLoaded || ((window as any).__coverLoaded = new Set<string>());
    processedBooks.forEach(b => {
      const src = getBookCover(b.title);
      if (src && !coverLoaded.has(src)) {
        const img = new Image();
        img.onload = () => coverLoaded.add(src);
        img.src = src;
        (img as any).decoding = 'async';
      }
    });
  }, [processedBooks]);
  
  // Apply filtering and sorting
  useEffect(() => {
    const filtered = [...processedBooks];
    
    // No filtering by status - show all books in their respective sections
    
    // Sort by date added (newest first)
    filtered.sort((a, b) => {
      const dateA = bookAddDates[a.id] || 0;
      const dateB = bookAddDates[b.id] || 0;
      return dateB - dateA;
    });
    
    setFilteredBooks(filtered);
  }, [processedBooks, bookAddDates]);
  
  // Compute books per section with memoization for performance
  const planningBooks = useMemo(() => 
    filteredBooks.filter(book => bookmarkStatuses[book.id] === 'Planning to Read' || 
      (bookmarkedBooks.includes(book.id) && !bookmarkStatuses[book.id])),
    [filteredBooks, bookmarkStatuses, bookmarkedBooks]
  );
  
  const readingBooks = useMemo(() => 
    filteredBooks.filter(book => bookmarkStatuses[book.id] === 'Reading'),
    [filteredBooks, bookmarkStatuses]
  );
  
  const onHoldBooks = useMemo(() => 
    filteredBooks.filter(book => bookmarkStatuses[book.id] === 'On Hold'),
    [filteredBooks, bookmarkStatuses]
  );
  
  const completedBooks = useMemo(() => 
    filteredBooks.filter(book => bookmarkStatuses[book.id] === 'Completed'),
    [filteredBooks, bookmarkStatuses]
  );
  
  // Function to scroll to a specific section
  const scrollToSection = useCallback((section: BookmarkSection) => {
    const refs = {
      'planning': planningRef,
      'reading': readingRef,
      'on-hold': onHoldRef,
      'completed': completedRef
    };
    
    const ref = refs[section];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveSection(section);
  }, []);
  
  // Get current section books based on active section
  const getCurrentSectionBooks = () => {
    switch(activeSection) {
      case 'planning': return planningBooks;
      case 'reading': return readingBooks;
      case 'on-hold': return onHoldBooks;
      case 'completed': return completedBooks;
      default: return planningBooks;
    }
  };
  
  // Show loading skeleton while bookmarks are loading
  useEffect(() => {
    setCountLoading(bookmarksLoading);
  }, [bookmarksLoading]);
  
  // Book count display with loading state
  const renderBookCount = (count: number) => {
    if (countLoading) {
      return (
        <span className="count-skeleton" aria-live="polite" aria-busy="true">
          <span className="sr-only">Loading count...</span>
          <span aria-hidden="true">...</span>
        </span>
      );
    }
    return (
      <span className="book-count" title={`${count} book${count !== 1 ? 's' : ''}`}>
        {count}
      </span>
    );
  };
  
  return (
    <div className={`${theme === 'dark' ? 'min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white' : 'min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-amber-50 text-slate-900'}`}>
      {/* Animated background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - Aligned to left */}
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-8">
          <Link to="/" className={`flex items-center gap-2 ${theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'} transition-colors group`}>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Library</span>
          </Link>
        </div>

        {/* Title Section - Larger */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className={`${theme === 'dark' ? 'p-3 bg-gradient-to-br from-violet-500/30 to-purple-600/20 border border-violet-400/40 rounded-xl backdrop-blur-sm shadow-lg shadow-violet-500/20' : 'p-3 bg-gradient-to-br from-violet-200 to-purple-200 border border-violet-300 rounded-xl backdrop-blur-sm shadow-md'}`}>
              <BookMarked className={`w-9 h-9 ${theme === 'dark' ? 'text-violet-300' : 'text-violet-700'}`} />
            </div>
            <div className="flex-1">
              <h1 className={`text-4xl ${theme === 'dark' ? 'text-white' : 'text-slate-900'} mb-1`}>Your Bookmarks</h1>
              <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Track and organize your reading journey</p>
            </div>
          
          {/* Clear All Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`${theme === 'dark' ? 'h-10 w-10 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-300 hover:text-red-200' : 'h-10 w-10 rounded-full bg-red-100 hover:bg-red-200 border border-red-200 text-red-700 hover:text-red-800'} transition-all duration-300`}
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all bookmarks? This action cannot be undone.')) {
                        clearAllBookmarks();
                      }
                    }}
                    aria-label="Clear all bookmarks"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear all bookmarks</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* Syncing indicator */}
          {syncing && (
            <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mt-2`}>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Syncing your bookmarks...</span>
            </div>
          )}
        </div>
        
        {/* Filter and sort section removed as requested */}

        {/* Stats Grid - Smaller boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          <div 
            className={`group relative bg-gradient-to-br from-blue-500/30 to-blue-600/20 backdrop-blur-sm border border-blue-400/40 rounded-xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-xl shadow-blue-500/20 cursor-pointer ${activeSection === 'planning' ? 'ring-2 ring-blue-400' : ''}`}
            onClick={() => {
              setActiveSection('planning');
              scrollToSection('planning');
            }}
            aria-label="View planning to read books"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300" />
            
            <div className="relative flex items-center gap-3">
              <div className="p-2 bg-slate-900/60 rounded-lg text-blue-300 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className={`text-2xl mb-0.5 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{renderBookCount(planningBooks.length)}</div>
                <div className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} text-xs`}>Planning to read</div>
              </div>
            </div>
          </div>
          
          <div 
            className={`group relative bg-gradient-to-br from-green-500/30 to-green-600/20 backdrop-blur-sm border border-green-400/40 rounded-xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-xl shadow-green-500/20 cursor-pointer ${activeSection === 'reading' ? 'ring-2 ring-green-400' : ''}`}
            onClick={() => {
              setActiveSection('reading');
              scrollToSection('reading');
            }}
            aria-label="View currently reading books"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-green-600/20 rounded-xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300" />
            
            <div className="relative flex items-center gap-3">
              <div className="p-2 bg-slate-900/60 rounded-lg text-green-300 group-hover:scale-110 transition-transform duration-300">
                <BookMarked className="w-5 h-5" />
              </div>
              <div>
                <div className={`text-2xl mb-0.5 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{renderBookCount(readingBooks.length)}</div>
                <div className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} text-xs`}>Currently reading</div>
              </div>
            </div>
          </div>
          
          <div 
            className={`group relative bg-gradient-to-br from-amber-500/30 to-amber-600/20 backdrop-blur-sm border border-amber-400/40 rounded-xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-xl shadow-amber-500/20 cursor-pointer ${activeSection === 'on-hold' ? 'ring-2 ring-amber-400' : ''}`}
            onClick={() => {
              setActiveSection('on-hold');
              scrollToSection('on-hold');
            }}
            aria-label="View on hold books"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 to-amber-600/20 rounded-xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300" />
            
            <div className="relative flex items-center gap-3">
              <div className="p-2 bg-slate-900/60 rounded-lg text-amber-300 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className={`text-2xl mb-0.5 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{renderBookCount(onHoldBooks.length)}</div>
                <div className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} text-xs`}>On hold</div>
              </div>
            </div>
          </div>
          
          <div 
            className={`group relative bg-gradient-to-br from-purple-500/30 to-purple-600/20 backdrop-blur-sm border border-purple-400/40 rounded-xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-xl shadow-purple-500/20 cursor-pointer ${activeSection === 'completed' ? 'ring-2 ring-purple-400' : ''}`}
            onClick={() => {
              setActiveSection('completed');
              scrollToSection('completed');
            }}
            aria-label="View completed books"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-purple-600/20 rounded-xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300" />
            
            <div className="relative flex items-center gap-3">
              <div className="p-2 bg-slate-900/60 rounded-lg text-purple-300 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className={`text-2xl mb-0.5 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{renderBookCount(completedBooks.length)}</div>
                <div className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} text-xs`}>Completed</div>
              </div>
            </div>
          </div>
        </div>
      
        <div className="bookmark-sections space-y-6">
          {/* Planning to Read Section */}
          <div 
            ref={planningRef} 
            id="planning-section"
            className={`section-container ${activeSection === 'planning' ? 'opacity-100' : 'opacity-70'} transition-opacity duration-300`}
          >
            <BookmarkGrid
              books={planningBooks}
              title="Planning to Read"
              icon={BookOpen}
              id="planning"
              isActive={activeSection === 'planning'}
              loading={bookmarksLoading || countLoading}
            />
          </div>
          
          {/* Currently Reading Section */}
          <div 
            ref={readingRef} 
            id="reading-section"
            className={`section-container ${activeSection === 'reading' ? 'opacity-100' : 'opacity-70'} transition-opacity duration-300`}
          >
            <BookmarkGrid
              books={readingBooks}
              title="Currently Reading"
              icon={BookMarked}
              id="reading"
              isActive={activeSection === 'reading'}
              loading={bookmarksLoading || countLoading}
            />
          </div>
          
          {/* On Hold Section */}
          <div 
            ref={onHoldRef} 
            id="on-hold-section"
            className={`section-container ${activeSection === 'on-hold' ? 'opacity-100' : 'opacity-70'} transition-opacity duration-300`}
          >
            <BookmarkGrid
              books={onHoldBooks}
              title="On Hold"
              icon={Clock}
              id="on-hold"
              isActive={activeSection === 'on-hold'}
              loading={bookmarksLoading || countLoading}
            />
          </div>
          
          {/* Completed Section */}
          <div 
            ref={completedRef} 
            id="completed-section"
            className={`section-container ${activeSection === 'completed' ? 'opacity-100' : 'opacity-70'} transition-opacity duration-300`}
          >
            <BookmarkGrid
              books={completedBooks}
              title="Completed"
              icon={CheckCircle2}
              id="completed"
              isActive={activeSection === 'completed'}
              loading={bookmarksLoading || countLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
