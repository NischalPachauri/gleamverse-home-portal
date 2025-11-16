import { Book } from "@/data/books";
import { BookCard } from "@/components/BookCard";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, LucideIcon, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageWithFallback } from "./ImageWithFallback";
import { getBookCover } from "@/utils/bookCoverMapping";
import { useBookmarks } from "@/hooks/useBookmarks";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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

// Using getBookCover from import

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
  const { removeBookmark, updateBookmarkStatus, addBookmark, bookmarks, bookmarkStatuses } = useBookmarks();
  
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(books.length / BOOKS_PER_PAGE));
  
  // Get current page books
  const currentBooks = books.slice(
    currentPage * BOOKS_PER_PAGE, 
    (currentPage + 1) * BOOKS_PER_PAGE
  );
  const [forcedVisible, setForcedVisible] = useState<Record<string, boolean>>({});
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('gleamverse_favorites') || '[]'); } catch { return []; }
  });
  const toggleFavorite = (id: string) => {
    const sid = id.toString();
    const next = favorites.includes(sid) ? favorites.filter(x => x !== sid) : [...favorites, sid];
    setFavorites(next);
    try { localStorage.setItem('gleamverse_favorites', JSON.stringify(next)); } catch {}
  };
  const longPressTimers = useRef<Record<string, any>>({});

  const handlePointerDown = (id: string) => {
    clearTimeout(longPressTimers.current[id]);
    longPressTimers.current[id] = setTimeout(() => {
      setForcedVisible(prev => ({ ...prev, [id]: true }));
    }, 500);
  };
  const handlePointerUp = (id: string) => {
    clearTimeout(longPressTimers.current[id]);
  };

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
      className={`pt-2 pb-4 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-80'}`}
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-2">
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
            <div
              key={book.id}
              className={`relative group ${forcedVisible[book.id] ? 'hover:opacity-100' : ''}`}
              onPointerDown={() => handlePointerDown(book.id)}
              onPointerUp={() => handlePointerUp(book.id)}
              onPointerCancel={() => handlePointerUp(book.id)}
            >
              <div className="aspect-[2/3] overflow-hidden rounded-lg shadow-lg transition-all duration-300 group-hover:shadow-xl scale-90">
                <ImageWithFallback
                  src={getBookCover(book.title) || `/book-covers/${book.pdfPath.split('/').pop()?.replace('.pdf', '.svg')}` || '/placeholder.svg'}
                  alt={`Cover of ${book.title}`}
                  width={200}
                  height={300}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  fallbackSrc="/placeholder.svg"
                  priority={true}
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />
                {/* No progress bar in bookmarks section */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label="Bookmark options"
                      className={`absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-slate-900/70 text-white flex items-center justify-center transition-all duration-200 ${forcedVisible[book.id] ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} hover:scale-110`}
                    >
                      <Bookmark className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[200px]">
                    {(['Planning to Read','Reading','On Hold','Completed'] as const).map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={async () => {
                          const current = bookmarkStatuses[book.id];
                          if (!bookmarks.includes(book.id)) {
                            await addBookmark(book.id, status);
                          } else if (current === status) {
                            await removeBookmark(book.id);
                          } else {
                            await updateBookmarkStatus(book.id, status as any);
                          }
                        }}
                        className="justify-between"
                      >
                        <span>{status}</span>
                        {bookmarkStatuses[book.id] === status && <span className="text-xs opacity-60">Selected</span>}
                      </DropdownMenuItem>
                    ))}
                    <div className="h-px bg-border my-1" />
                    <DropdownMenuItem onClick={() => toggleFavorite(book.id)} className="justify-between">
                      <span>Favorite</span>
                      {favorites.includes(book.id.toString()) && <span className="text-xs opacity-60">Added</span>}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-1 text-sm font-medium truncate dark:text-white text-slate-900">{book.title}</div>
              <div className="text-xs truncate dark:text-slate-400 text-slate-600">{book.author}</div>
              <div className="text-[11px] mt-1 text-slate-500 dark:text-slate-400">{book.pages || '—'} pages</div>
            </div>
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
