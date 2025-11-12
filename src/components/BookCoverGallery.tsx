import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Grid, List } from 'lucide-react';

interface BookCoverGalleryProps {
  itemsPerPage?: number;
  className?: string;
  showSearch?: boolean;
  viewMode?: 'grid' | 'list';
}

const BookCoverGallery: React.FC<BookCoverGalleryProps> = ({ 
  itemsPerPage = 12,
  className = '',
  showSearch = true,
  viewMode: initialViewMode = 'grid'
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [bookCovers, setBookCovers] = useState<Array<[string, string]>>([]);
  const [filteredCovers, setFilteredCovers] = useState<Array<[string, string]>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    // Create placeholder book covers since bookCoverMapping was removed
    const placeholderCovers: Array<[string, string]> = [
      ['The Alchemist', '/placeholder.svg'],
      ['Atomic Habits', '/placeholder.svg'],
      ['The Great Gatsby', '/placeholder.svg'],
      ['To Kill a Mockingbird', '/placeholder.svg'],
      ['1984', '/placeholder.svg'],
      ['Pride and Prejudice', '/placeholder.svg'],
      ['The Catcher in the Rye', '/placeholder.svg'],
      ['Harry Potter and the Sorcerer\'s Stone', '/placeholder.svg'],
      ['The Lord of the Rings', '/placeholder.svg'],
      ['The Hobbit', '/placeholder.svg'],
      ['Fahrenheit 451', '/placeholder.svg'],
      ['Jane Eyre', '/placeholder.svg'],
      ['The Adventures of Sherlock Holmes', '/placeholder.svg'],
      ['The Picture of Dorian Gray', '/placeholder.svg'],
      ['Wuthering Heights', '/placeholder.svg'],
      ['Moby Dick', '/placeholder.svg'],
      ['War and Peace', '/placeholder.svg'],
      ['Crime and Punishment', '/placeholder.svg'],
      ['The Brothers Karamazov', '/placeholder.svg'],
      ['Anna Karenina', '/placeholder.svg']
    ];
    
    setBookCovers(placeholderCovers);
    setFilteredCovers(placeholderCovers);
  }, []);
  
  // Filter books based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCovers(bookCovers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = bookCovers.filter(([title]) => 
        title.toLowerCase().includes(query)
      );
      setFilteredCovers(filtered);
    }
    setCurrentPage(1); // Reset to first page on search
  }, [searchQuery, bookCovers]);
  
  const totalPages = Math.ceil(filteredCovers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleCovers = filteredCovers.slice(startIndex, startIndex + itemsPerPage);
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleImageError = (title: string) => {
    setImageLoadErrors(prev => new Set(prev).add(title));
  };
  
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  if (bookCovers.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading book covers...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`w-full ${className}`}>
      {/* Header with Search and View Toggle */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Book Cover Gallery</h2>
          <span className="text-sm text-gray-500">
            ({filteredCovers.length} book{filteredCovers.length !== 1 ? 's' : ''})
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
          )}
          
          {/* View Mode Toggle */}
          <div className="flex gap-1 border border-gray-300 rounded-md p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              aria-label="Grid view"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              aria-label="List view"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Book Covers Grid/List */}
      {filteredCovers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No books found matching "{searchQuery}"
        </div>
      ) : (
        <>
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
              : "flex flex-col gap-3"
          }>
            {visibleCovers.map(([title, path], index) => {
              const hasError = imageLoadErrors.has(title);
              
              return viewMode === 'grid' ? (
                // Grid View
                <div key={index} className="flex flex-col items-center group">
                  <div className="relative w-full aspect-[2/3] overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 bg-gray-100">
                    {hasError ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 p-4">
                        <div className="text-gray-500 text-4xl mb-2">📚</div>
                        <p className="text-xs text-gray-600 text-center font-medium line-clamp-3">
                          {title}
                        </p>
                      </div>
                    ) : (
                      <img
                        src={path}
                        alt={`Cover of ${title}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={() => handleImageError(title)}
                        loading="lazy"
                      />
                    )}
                  </div>
                  <p className="mt-2 text-xs text-center font-medium line-clamp-2 px-1 w-full">
                    {title}
                  </p>
                </div>
              ) : (
                // List View
                <div key={index} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="relative w-16 h-24 flex-shrink-0 overflow-hidden rounded shadow-sm bg-gray-100">
                    {hasError ? (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                        <span className="text-gray-500 text-2xl">📚</span>
                      </div>
                    ) : (
                      <img
                        src={path}
                        alt={`Cover of ${title}`}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(title)}
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      #{startIndex + index + 1}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                <ChevronLeft className="mr-1" size={16} />
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-2">
                {getPageNumbers().map((page, idx) => (
                  <React.Fragment key={idx}>
                    {page === '...' ? (
                      <span className="px-2 text-gray-400">...</span>
                    ) : (
                      <button
                        onClick={() => goToPage(page as number)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                Next
                <ChevronRight className="ml-1" size={16} />
              </button>
            </div>
          )}
          
          {/* Stats */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredCovers.length)} of {filteredCovers.length} books
            {imageLoadErrors.size > 0 && (
              <span className="ml-2 text-yellow-600">
                ({imageLoadErrors.size} cover{imageLoadErrors.size !== 1 ? 's' : ''} failed to load)
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BookCoverGallery;