import { Book } from "@/data/books";
import { BookCard } from "@/components/BookCard";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookmarkGridProps {
  books: Book[];
  title: string;
  icon: LucideIcon;
  id: string;
  isActive: boolean;
  loading?: boolean;
}

// Constants for pagination
const BOOKS_PER_PAGE = 8;

export const BookmarkGrid = ({ 
  books, 
  title, 
  icon: Icon, 
  id, 
  isActive,
  loading = false
}: BookmarkGridProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageInputValue, setPageInputValue] = useState("1");
  
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(books.length / BOOKS_PER_PAGE));
  
  // Get current page books
  const currentBooks = books.slice(
    currentPage * BOOKS_PER_PAGE, 
    (currentPage + 1) * BOOKS_PER_PAGE
  );

  // Add focus when section becomes active
  useEffect(() => {
    if (isActive && gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isActive]);
  
  // Update page input when page changes
  useEffect(() => {
    setPageInputValue((currentPage + 1).toString());
  }, [currentPage]);
  
  // Handle page navigation
  const goToPage = (page: number) => {
    const validPage = Math.max(0, Math.min(page, totalPages - 1));
    setCurrentPage(validPage);
  };
  
  // Handle page input change
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(e.target.value);
  };
  
  // Handle page input submission
  const handlePageInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNumber = parseInt(pageInputValue, 10);
      if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
        goToPage(pageNumber - 1);
      } else {
        setPageInputValue((currentPage + 1).toString());
      }
    }
  };

  return (
    <div 
      id={id} 
      ref={gridRef}
      className={`pt-6 pb-12 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-80'}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10 text-primary">
            <Icon size={18} />
          </div>
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        
        {books.length > 0 && (
          <div className="text-sm text-slate-400">
            {books.length} {books.length === 1 ? 'book' : 'books'}
          </div>
        )}
      </div>
      
      {/* Books grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={`skeleton-${id}-${i}`} 
              className="aspect-[2/3] bg-slate-800/50 rounded-lg animate-pulse"
            />
          ))
        ) : currentBooks.length > 0 ? (
          // Book cards
          currentBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))
        ) : (
          // Empty state
          <div className="col-span-full py-8 text-center text-slate-400">
            No books in this section yet
          </div>
        )}
      </div>
      
      {/* Pagination controls */}
      {books.length > BOOKS_PER_PAGE && (
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Page</span>
            <input
              type="text"
              value={pageInputValue}
              onChange={handlePageInputChange}
              onKeyDown={handlePageInputSubmit}
              className="w-12 h-8 text-center bg-slate-800 border border-slate-700 rounded-md text-sm"
              aria-label={`Page ${currentPage + 1} of ${totalPages}`}
            />
            <span className="text-sm text-slate-400">of {totalPages}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default BookmarkGrid;