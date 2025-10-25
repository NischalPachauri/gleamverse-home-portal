import { BookOpen, X, BookMarked, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { books } from "@/data/books";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useLocalBookmarks } from "@/hooks/useLocalBookmarks";
import { getBookCover } from "@/utils/bookCoverMapping";
import { useEffect } from "react";

// Maximum number of books allowed in the library
const MAX_LIBRARY_CAPACITY = 10;

// Function to get cover image path
const getCoverImage = (book: typeof books[0]) => {
  // First try to get the real book cover from BookCoversNew
  const realCover = getBookCover(book.title);
  if (realCover) {
    return realCover;
  }
  
  // Check if we have a generated SVG cover
  const bookFileName = book.pdfPath.split('/').pop()?.replace('.pdf', '.svg');
  if (bookFileName) {
    return `/book-covers/${bookFileName}`;
  }
  
  // Final fallback: Use a placeholder
  return '/placeholder.svg';
};

export const ReadingList = () => {
  const { bookmarkedBooks, removeBookmark } = useLocalBookmarks();
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.2 });

  const removeFromList = async (bookId: string) => {
    try {
      await removeBookmark(bookId);
    } catch (error) {
      // Silent error handling
    }
  };

  // Get books with their correct status
  const { bookmarkStatuses } = useLocalBookmarks();
  
  // Show all bookmarked books in their correct status categories
  const libraryBooks = books.filter((book) => {
    return bookmarkedBooks.includes(book.id);
  });
  
  // Group books by their status
  const booksByStatus = {
    'Planning to Read': libraryBooks.filter(book => !bookmarkStatuses[book.id] || bookmarkStatuses[book.id] === 'Planning to Read'),
    'Reading': libraryBooks.filter(book => bookmarkStatuses[book.id] === 'Reading'),
    'On Hold': libraryBooks.filter(book => bookmarkStatuses[book.id] === 'On Hold'),
    'Completed': libraryBooks.filter(book => bookmarkStatuses[book.id] === 'Completed')
  };
  
  // Get status icon based on book status
  const getStatusIcon = (bookId: string) => {
    const status = bookmarkStatuses[bookId];
    switch(status) {
      case 'Reading':
        return <BookMarked className="w-4 h-4 text-blue-500" />;
      case 'On Hold':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'Completed':
        return <CheckCircle2 className="w-4 h-4 text-purple-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-emerald-500" />;
    }
  };
  
  // Enforce FIFO capacity limit
  useEffect(() => {
    if (libraryBooks.length > MAX_LIBRARY_CAPACITY) {
      // Find the oldest book (last one in the array) to remove
      const oldestBook = libraryBooks[libraryBooks.length - 1];
      
      // Remove the oldest book silently without notification
      removeBookmark(oldestBook.id);
    }
  }, [libraryBooks.length]);

  if (libraryBooks.length === 0) {
    return (
      <section ref={sectionRef} className={`py-12 bg-blue-50 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-8">
            <BookOpen className="w-8 h-8 text-primary" />
            <h2 className="text-4xl font-bold text-foreground">Your Library</h2>
          </div>
          <p className="text-center text-muted-foreground">
            Your library is empty. Start adding books to read later!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className={`py-12 bg-blue-50 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-10">
          <BookOpen className="w-8 h-8 text-primary" />
          <h2 className="text-4xl font-bold text-foreground">Your Library</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 px-2">
          {libraryBooks.map((book, index) => (
            <div
              key={book.id}
              className={`group relative hover-scale transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Link to={`/book/${book.id}`}>
                <div className="aspect-[2/3] overflow-hidden rounded-lg shadow-lg relative">
                  {/* Section indicator icon */}
                  <div className="absolute top-2 left-2 z-10 p-1.5 rounded-full bg-slate-900/70 backdrop-blur-sm">
                    {getStatusIcon(book.id)}
                  </div>
                  
                  <img
                    src={getCoverImage(book)}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src='/placeholder.svg'; }}
                  />
                </div>
                {/* Book title */}
                <div className="mt-3 text-center text-sm font-medium text-foreground">
                  {book.title}
                </div>
              </Link>
              {bookmarkStatuses[book.id] && (
                <div className="mt-2 text-xs font-medium text-center rounded-full px-2 py-1 bg-primary/10 text-primary">
                  {bookmarkStatuses[book.id]}
                </div>
              )}
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFromList(book.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};