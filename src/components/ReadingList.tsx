import { BookOpen, X, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { books } from "@/data/books";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useLocalBookmarks } from "@/hooks/useLocalBookmarks";
import { getBookCover } from "@/utils/bookCoverMapping";
import ImageWithFallback from "./ImageWithFallback";
import { useEffect } from "react";

// Maximum number of books allowed in the reading queue
const MAX_LIBRARY_CAPACITY = 5;

export const ReadingList = () => {
  const { bookmarkedBooks, removeBookmark, bookmarkStatuses } = useLocalBookmarks();
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.2 });

  const removeFromList = async (bookId: string) => {
    try {
      await removeBookmark(bookId);
    } catch (error) {
      // Silent error handling
    }
  };

  // Get only books with 'Reading' status for the queue
  const readingBooks = books.filter((book) => {
    return bookmarkedBooks.includes(book.id) && bookmarkStatuses[book.id] === 'Reading';
  });
  
  // Sort reading books by most recently updated (assuming order in bookmarkedBooks array)
  // Most recent books are at the end of the array, so we reverse to show newest first
  const sortedReadingBooks = [...readingBooks].reverse().slice(0, MAX_LIBRARY_CAPACITY);

  // Enforce queue capacity limit for reading books only
  useEffect(() => {
    if (readingBooks.length > MAX_LIBRARY_CAPACITY) {
      // Find the oldest reading book to remove (first one in the array)
      const oldestReadingBook = readingBooks[0];
      
      // Remove the oldest reading book from the library entirely
      removeBookmark(oldestReadingBook.id);
      toast.info(`"${oldestReadingBook.title}" was removed from your reading queue as you've reached the 5-book limit.`);
    }
  }, [readingBooks.length]);

  if (sortedReadingBooks.length === 0) {
    return (
      <section ref={sectionRef} className={`py-12 bg-blue-50 dark:bg-slate-900 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-8">
            <BookOpen className="w-8 h-8 text-primary dark:text-cyan-400" />
            <h2 className="text-4xl font-bold text-foreground dark:text-white">Currently Reading</h2>
          </div>
          <p className="text-center text-muted-foreground dark:text-slate-300">
            No books are currently being read. Start reading a book to see it here!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className={`py-12 bg-blue-50 dark:bg-slate-900 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-10">
          <BookOpen className="w-8 h-8 text-primary dark:text-cyan-400" />
          <h2 className="text-4xl font-bold text-foreground dark:text-white">Currently Reading</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-6 px-2">
          {sortedReadingBooks.map((book, index) => (
            <div
              key={book.id}
              className={`group relative hover-scale transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Link to={`/book/${book.id}`}>
                <div className="aspect-[2/3] overflow-hidden rounded-lg shadow-lg relative">
                  {/* Reading indicator icon */}
                  <div className="absolute top-2 left-2 z-10 p-1.5 rounded-full bg-slate-900/70 backdrop-blur-sm">
                    <BookMarked className="w-4 h-4 text-blue-500" />
                  </div>
                  
                  <ImageWithFallback
                    src={getBookCover(book.title) || '/placeholder.svg'}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {/* Book title */}
                <div className="mt-3 text-center text-sm font-medium text-foreground dark:text-white">
                  {book.title}
                </div>
              </Link>
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