import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Search, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { books } from '@/data/books';
import { useNavigate } from 'react-router-dom';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof books>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [focusedResultIndex, setFocusedResultIndex] = useState(-1);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length > 0) {
      const filteredResults = books.filter(book => 
        book.title.toLowerCase().includes(query.toLowerCase()) || 
        book.author.toLowerCase().includes(query.toLowerCase()) ||
        book.genre.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10); // Limit to 10 results for better performance
      setSearchResults(filteredResults);
    } else {
      setSearchResults([]);
    }
  };

  // Handle clicking on a search result
  const handleResultClick = (bookId: string) => {
    navigate(`/book/${bookId}`);
    onClose();
  };

  // Focus the input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
      setSearchResults([]);
      setFocusedResultIndex(-1);
    }
  }, [isOpen]);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedResultIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedResultIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        if (focusedResultIndex >= 0 && focusedResultIndex < searchResults.length) {
          handleResultClick(searchResults[focusedResultIndex].id);
        }
        break;
      default:
        break;
    }
  };

  // Clear search and close modal
  const handleClearSearch = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-labelledby="search-modal-title"
    >
      <div 
        ref={modalRef}
        className={`w-full max-w-2xl transform transition-all duration-300 ease-out ${
          isOpen ? 'scale-100 opacity-100' : 'scale-80 opacity-0'
        }`}
        style={{ 
          animation: isOpen ? 'scaleIn 300ms ease-out forwards' : 'none' 
        }}
        onKeyDown={handleKeyDown}
      >
        <div className={`rounded-xl shadow-2xl overflow-hidden ${
          isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'
        }`}>
          {/* Search Header */}
          <div className="p-4 border-b border-slate-700/50">
            <h2 
              id="search-modal-title" 
              className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              Search Books
            </h2>
          </div>
          
          {/* Search Input */}
          <div className={`flex items-center gap-3 p-4 ${
            isDark ? 'bg-slate-800' : 'bg-slate-100'
          }`}>
            <Search className={`h-5 w-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search by title, author, or genre..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={`flex-1 bg-transparent outline-none ${
                isDark ? 'text-white placeholder:text-slate-400' : 'text-slate-900 placeholder:text-slate-500'
              }`}
              aria-label="Search books"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className={`rounded-full p-1 ${
                  isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'
                }`}
                aria-label="Clear search"
              >
                <X className={`h-4 w-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              </button>
            )}
          </div>
          
          {/* Search Results */}
          <div className={`max-h-96 overflow-y-auto ${
            isDark ? 'bg-slate-900' : 'bg-white'
          }`}>
            {searchResults.length > 0 ? (
              <div className="p-2">
                {searchResults.map((book, index) => (
                  <div
                    key={book.id}
                    onClick={() => handleResultClick(book.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      focusedResultIndex === index
                        ? isDark 
                          ? 'bg-blue-900/50 border border-blue-700'
                          : 'bg-blue-100 border border-blue-200'
                        : isDark
                          ? 'hover:bg-slate-800 border border-transparent'
                          : 'hover:bg-slate-100 border border-transparent'
                    }`}
                    role="option"
                    aria-selected={focusedResultIndex === index}
                    tabIndex={0}
                  >
                    <div className="flex items-start gap-3">
                      {book.coverImage && (
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="h-16 w-12 object-cover rounded shadow-md"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {book.title}
                        </h3>
                        <p className={`text-sm mt-1 ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {book.author} • {book.genre}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="p-8 text-center">
                <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  No results found for "{searchQuery}"
                </p>
              </div>
            ) : null}
          </div>
          
          {/* Footer with close button */}
          <div className={`p-4 border-t ${
            isDark ? 'border-slate-700/50' : 'border-slate-200'
          }`}>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-md ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
      
      {/* Global styles for animation */}
      <style jsx global>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}