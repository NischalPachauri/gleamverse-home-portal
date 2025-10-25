import { useRef, useEffect, useState } from 'react';
import { Book } from '@/data/books';
import { BookCard } from '@/components/BookCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface VirtualizedBookGridProps {
  books: Book[];
  loading?: boolean;
}

export const VirtualizedBookGrid = ({ books, loading = false }: VirtualizedBookGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 12 });
  const [containerWidth, setContainerWidth] = useState(0);
  const [pageInputValue, setPageInputValue] = useState('1');
  
  // Calculate columns based on container width
  const getColumnsCount = (width: number) => {
    if (width < 640) return 2; // Mobile: 2 columns
    if (width < 1024) return 3; // Tablet: 3 columns
    return 4; // Desktop: 4 columns
  };
  
  // Calculate visible items based on scroll position
  const updateVisibleItems = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scrollTop = window.scrollY;
    const containerTop = container.getBoundingClientRect().top + scrollTop;
    const viewportHeight = window.innerHeight;
    
    // Calculate row height (aspect ratio 2/3 + gap)
    const columns = getColumnsCount(containerWidth);
    const itemWidth = (containerWidth - (columns - 1) * 24) / columns;
    const itemHeight = (itemWidth * 1.5) + 24; // 1.5 is the aspect ratio + gap
    
    // Calculate visible range with buffer for smooth scrolling
    const rowsAbove = Math.floor((scrollTop - containerTop) / itemHeight);
    const visibleRows = Math.ceil(viewportHeight / itemHeight) + 2; // +2 rows buffer
    
    const start = Math.max(0, rowsAbove * columns);
    const end = Math.min(books.length, (rowsAbove + visibleRows) * columns);
    
    setVisibleRange({ start, end });
  };
  
  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Update page input value when current page changes
  useEffect(() => {
    setPageInputValue(getCurrentPage().toString());
  }, [visibleRange]);
  
  // Optimize scroll performance with requestAnimationFrame
  useEffect(() => {
    let ticking = false;
    let scrollTimeout: number;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateVisibleItems();
          ticking = false;
        });
        ticking = true;
      }
      
      // Clear previous timeout
      clearTimeout(scrollTimeout);
      
      // Set new timeout to update items after scrolling stops
      scrollTimeout = window.setTimeout(() => {
        updateVisibleItems();
      }, 100);
    };

    handleScroll(); // Initial update
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [books.length, containerWidth]);
  
  // Calculate total height for proper scrolling
  const getTotalHeight = () => {
    if (!containerWidth || books.length === 0) return 'auto';
    
    const columns = getColumnsCount(containerWidth);
    const rows = Math.ceil(books.length / columns);
    const itemWidth = (containerWidth - (columns - 1) * 24) / columns;
    const itemHeight = (itemWidth * 1.5) + 24;
    
    // Calculate total height based on number of rows
    return `${rows * itemHeight}px`;
  };
  
  // Calculate current page number based on visible range
  const getCurrentPage = () => {
    const columns = getColumnsCount(containerWidth);
    const itemsPerPage = columns * 3; // 3 rows per page
    return Math.floor(visibleRange.start / itemsPerPage) + 1;
  };
  
  // Calculate total number of pages
  const getTotalPages = () => {
    if (!containerWidth || books.length === 0) return 1;
    const columns = getColumnsCount(containerWidth);
    const itemsPerPage = columns * 3; // 3 rows per page
    return Math.ceil(books.length / itemsPerPage);
  };
  
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={`skeleton-${i}`} 
            className="aspect-[1/1.5] rounded-lg bg-card animate-pulse"
          />
        ))}
      </div>
    );
  }
  
  if (books.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg border border-border/50">
        <p className="text-muted-foreground">No books in this section yet</p>
        <p className="text-sm mt-2 text-muted-foreground/70">
          Add books to this section by clicking the three dots on any book card
        </p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-4">
      <div 
        ref={containerRef} 
        className="relative"
        style={{ height: getTotalHeight() }}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 absolute top-0 left-0 w-full">
          {books.slice(visibleRange.start, visibleRange.end).map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
      
      {books.length > 0 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <button 
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-primary/10 hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={getCurrentPage() === 1}
            onClick={() => {
              const newPage = getCurrentPage() - 1;
              if (newPage >= 1) {
                const columns = getColumnsCount(containerWidth);
                const itemsPerPage = columns * 3;
                setVisibleRange({
                  start: (newPage - 1) * itemsPerPage,
                  end: newPage * itemsPerPage
                });
                window.scrollTo({
                  top: containerRef.current?.offsetTop || 0,
                  behavior: 'smooth'
                });
              }
            }}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span>Page</span>
            <input
              type="text"
              className="w-12 px-2 py-1 text-center rounded-md bg-primary/10 border border-primary/20 focus:outline-none focus:border-primary/50"
              value={pageInputValue}
              onChange={(e) => setPageInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const newPage = parseInt(pageInputValue);
                  if (!isNaN(newPage) && newPage >= 1 && newPage <= getTotalPages()) {
                    const columns = getColumnsCount(containerWidth);
                    const itemsPerPage = columns * 3;
                    setVisibleRange({
                      start: (newPage - 1) * itemsPerPage,
                      end: newPage * itemsPerPage
                    });
                    window.scrollTo({
                      top: containerRef.current?.offsetTop || 0,
                      behavior: 'smooth'
                    });
                  } else {
                    setPageInputValue(getCurrentPage().toString());
                  }
                }
              }}
              onBlur={() => {
                setPageInputValue(getCurrentPage().toString());
              }}
            />
            <span>of {getTotalPages()}</span>
          </div>
          
          <button 
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-primary/10 hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={getCurrentPage() === getTotalPages()}
            onClick={() => {
              const newPage = getCurrentPage() + 1;
              if (newPage <= getTotalPages()) {
                const columns = getColumnsCount(containerWidth);
                const itemsPerPage = columns * 3;
                setVisibleRange({
                  start: (newPage - 1) * itemsPerPage,
                  end: newPage * itemsPerPage
                });
                window.scrollTo({
                  top: containerRef.current?.offsetTop || 0,
                  behavior: 'smooth'
                });
              }
            }}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default VirtualizedBookGrid;