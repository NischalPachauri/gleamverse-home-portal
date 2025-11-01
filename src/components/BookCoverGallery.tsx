import React, { useState, useEffect } from 'react';
import { handleImageError } from '../utils/bookCoverMapping';
import { bookCoverMap } from '../utils/generatedBookCoverMap';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BookCoverGalleryProps {
  itemsPerPage?: number;
  className?: string;
}

const BookCoverGallery: React.FC<BookCoverGalleryProps> = ({ 
  itemsPerPage = 12,
  className = ''
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [bookCovers, setBookCovers] = useState<Array<[string, string]>>([]);
  
  useEffect(() => {
    // Convert book cover map to array for pagination
    const covers = Object.entries(bookCoverMap);
    setBookCovers(covers);
  }, []);
  
  const totalPages = Math.ceil(bookCovers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleCovers = bookCovers.slice(startIndex, startIndex + itemsPerPage);
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visibleCovers.map(([title, path], index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="relative w-full h-64 overflow-hidden rounded-md shadow-md">
              <img
                src={path}
                alt={`Cover of ${title}`}
                className="w-full h-full object-cover transition-all hover:scale-105"
                onError={(e) => handleImageError(e)}
                loading="lazy"
                data-title={title}
              />
            </div>
            <p className="mt-2 text-sm text-center font-medium line-clamp-2">{title}</p>
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="mr-1" size={16} />
            Previous
          </button>
          
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="ml-1" size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default BookCoverGallery;

