import { Button } from "./ui/button";
import { Moon, Sun, Bookmark, Sparkles, X, Search, User, Settings, LogOut, HelpCircle, CreditCard, Heart } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { toast } from 'sonner';
import { books } from "@/data/books";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function EnhancedHeroSection({ 
  searchQuery, 
  setSearchQuery, 
  onRandomBook 
}: { 
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onRandomBook: () => void;
}) {
  // Force content to be visible
  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
    return () => {
      document.body.style.overflow = '';
      document.body.style.visibility = '';
      document.body.style.opacity = '';
    };
  }, []);
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  
  // Add comprehensive debugging logs for authentication state
  useEffect(() => {
    console.log('Authentication state changed:', { 
      isAuthenticated, 
      userId: user?.id,
      email: user?.email,
      metadata: user?.user_metadata,
      timestamp: new Date().toISOString()
    });
    
    // Welcome toast notification removed as requested
  }, [isAuthenticated, user]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof books>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // Handle search results in real-time
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      const results = books.filter(book => 
        book.title.toLowerCase().includes(query) || 
        book.author.toLowerCase().includes(query) ||
        book.genre.toLowerCase().includes(query)
      ).slice(0, 10); // Limit to 10 results for better performance
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);
  
  // Maintain header visibility during search interactions and hide bookmark dots
  useEffect(() => {
    // No need to prevent body scrolling with the new positioning
    // This ensures the header remains visible during search interactions
    
    // Add a class to the body to handle any global styling needed during search
    if (isSearchFocused && searchResults.length > 0) {
      document.body.classList.add('search-results-visible');
      
      // Hide bookmark dots when search results are shown
      const bookmarkDots = document.querySelectorAll('.bookmark-dots');
      bookmarkDots.forEach(dot => {
        (dot as HTMLElement).style.display = 'none';
      });
      
      return () => {
        document.body.classList.remove('search-results-visible');
        
        // Restore bookmark dots when search results are closed
        const bookmarkDots = document.querySelectorAll('.bookmark-dots');
        bookmarkDots.forEach(dot => {
          (dot as HTMLElement).style.display = '';
        });
      };
    }
  }, [isSearchFocused, searchResults.length]);

  // Handle click outside search container with improved user experience
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        // Don't immediately close if user is interacting with search results
        if (event.target instanceof Element) {
          const searchResultsContainer = document.querySelector('.search-results-container');
          if (searchResultsContainer && searchResultsContainer.contains(event.target)) {
            return;
          }
        }
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation for search results
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSearchFocused && searchResults.length > 0) {
        if (e.key === 'Escape') {
          setIsSearchFocused(false);
        } else if (e.key === 'Tab') {
          // Keep focus within the search results container when tabbing
          const searchResultsContainer = document.querySelector('.search-results-container');
          if (searchResultsContainer) {
            const focusableElements = searchResultsContainer.querySelectorAll(
              'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            if (focusableElements.length > 0) {
              const firstElement = focusableElements[0] as HTMLElement;
              const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
              
              if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
              } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
              }
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchFocused, searchResults.length]);

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchFocused(false);
    // Keep the search query and results, just collapse the expanded view
  };

  // Navigate to book page when clicking a search result
  const handleResultClick = (bookId: string) => {
    navigate(`/book/${bookId}`);
    setIsSearchFocused(false);
  };

  return (
    <>
      <div className={`relative transition-colors duration-500 overflow-visible ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
        {/* Background Image with Abstract Pattern */}
        <div className="absolute inset-0">
          <img 
            src="/placeholder.svg"
            alt="Abstract background"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Gradient Overlay */}
          <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-br from-cyan-900/95 via-blue-900/95 to-indigo-900/95' : 'bg-gradient-to-br from-cyan-200/90 via-blue-200/90 to-indigo-200/90'}`}></div>
          {/* Additional fade */}
          <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-t from-slate-950/50 to-transparent' : 'bg-gradient-to-t from-white/50 to-transparent'}`}></div>
          
          {/* Semi-transparent background when search is focused */}
          <div className={`fixed inset-0 bg-black/40 backdrop-blur-lg transition-all duration-300 ease-in-out z-10 ${isSearchFocused ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}></div>
        </div>
        
        {/* Top Navigation */}
        <nav className="relative flex items-center justify-between px-6 py-4 z-20">
          <div className="flex-1"></div>
          
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Profile Modal */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={`rounded-full overflow-hidden p-0 h-10 w-10 transition-all duration-300 ${theme === 'dark' ? 'hover:bg-white/20 bg-white/10 border-2 border-cyan-400/50' : 'hover:bg-white/60 bg-white/40 border-2 border-blue-300/70'} hover:scale-105 shadow-md`}
                      aria-label="Open profile menu"
                    >
                      <Avatar className="h-full w-full">
                        <AvatarImage 
                          src={user?.user_metadata?.avatar_url || user?.photoURL || ""} 
                          alt={user?.user_metadata?.full_name || user?.displayName || "User"} 
                          onError={(e) => console.log("Avatar image failed to load:", e)}
                        />
                        <AvatarFallback className={`text-lg font-medium ${theme === 'dark' ? 'bg-cyan-700 text-white' : 'bg-blue-100 text-blue-800'}`}>
                          {user?.user_metadata?.full_name 
                            ? user.user_metadata.full_name.charAt(0).toUpperCase() 
                            : user?.email
                              ? user.email.charAt(0).toUpperCase()
                              : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className={`w-56 ${theme === 'dark' ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-900 border-slate-200'}`}>
                    <div className={`p-2 ${theme === 'dark' ? 'bg-gradient-to-r from-cyan-900/50 to-blue-900/50' : 'bg-gradient-to-r from-cyan-100 to-blue-100'} rounded-t-md`}>
                      <div className="flex items-center gap-2 p-2">
                        <Avatar className="h-10 w-10 border border-white/50">
                          <AvatarImage src={user?.user_metadata?.avatar_url || user?.photoURL || ""} alt={user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"} />
                          <AvatarFallback className={`text-sm font-medium ${theme === 'dark' ? 'bg-cyan-700 text-white' : 'bg-blue-100 text-blue-800'}`}>
                            {user?.user_metadata?.full_name 
                              ? user.user_metadata.full_name.charAt(0).toUpperCase() 
                              : user?.email ? user.email.charAt(0).toUpperCase() : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <DropdownMenuLabel className="p-0 text-base font-semibold">
                            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"}
                          </DropdownMenuLabel>
                          <p className="text-xs opacity-70 truncate max-w-[180px]">
                            {user?.email || ""}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={() => {
                        console.log('Navigating to profile page');
                        navigate('/profile');
                      }} 
                      className="font-medium hover:bg-primary/10"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>View Profile</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => navigate('/donate')}>
                <Heart className="mr-2 h-4 w-4" />
                <span>Donate</span>
              </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => navigate('/help')}>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Help/Support</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <div className="p-2 flex justify-between items-center">
                      <Button 
                        variant="destructive" 
                        onClick={() => signOut()}
                        className="flex items-center text-xs h-8"
                        size="sm"
                      >
                        <LogOut className="mr-2 h-3 w-3" />
                        <span>Sign out</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={toggleTheme}
                        className="rounded-full h-8 w-8"
                      >
                        {theme === 'dark' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                variant="ghost" 
                size="sm"
                className={`backdrop-blur-md ${theme === 'dark' ? 'text-cyan-100 hover:bg-white/20 bg-white/10 border border-cyan-400/30' : 'text-blue-900 hover:bg-white/60 bg-white/40 border border-blue-300/50'} transition-all`}
                onClick={() => {
                  console.log('Opening auth modal for login');
                  openAuthModal('login');
                }}
              >
                Sign In
              </Button>
            )}
            
            <Button 
              className={`backdrop-blur-md ${theme === 'dark' ? 'bg-cyan-500/90 hover:bg-cyan-400 text-slate-900 border border-cyan-400/40' : 'bg-blue-500/90 hover:bg-blue-600 text-white border border-blue-300/50'} shadow-lg transition-all`}
              size="sm"
              onClick={() => navigate('/bookmarks')}
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Bookmarks
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleTheme}
              className={`rounded-full backdrop-blur-md ${theme === 'dark' ? 'bg-white/10 hover:bg-white/25 text-yellow-300 border border-cyan-400/30' : 'bg-white/40 hover:bg-white/60 text-blue-900 border border-blue-300/50'} transition-all`}
            >
              {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative flex flex-col items-center justify-center px-6 py-12 md:py-16 z-20">
          {/* Randomize Button with Sparkles Icon */}
          <button 
            onClick={onRandomBook}
            className={`mb-10 p-6 rounded-full backdrop-blur-xl transition-all hover:scale-110 shadow-2xl ${theme === 'dark' ? 'bg-cyan-500/30 hover:bg-cyan-400/40 border-2 border-cyan-400/50' : 'bg-white/40 hover:bg-white/60 border-2 border-blue-400/50'}`}
            title="Get a random book recommendation"
          >
            <Sparkles className={`h-6 w-6 ${theme === 'dark' ? 'text-cyan-300' : 'text-blue-600'}`} />
          </button>

          {/* Main Heading - Gradient Text */}
          <h1 className={`mb-4 text-center text-6xl md:text-7xl font-bold bg-gradient-to-r ${theme === 'dark' ? 'from-cyan-300 via-blue-300 to-indigo-300' : 'from-cyan-600 via-blue-600 to-indigo-600'} bg-clip-text text-transparent drop-shadow-2xl`}>
            GleamVerse
          </h1>
          
          <h2 className={`mb-5 text-center text-xl ${theme === 'dark' ? 'text-cyan-200' : 'text-blue-800'} drop-shadow-lg`}>
            Where Learning Never Stops
          </h2>
          
          <p className={`max-w-2xl text-center mb-8 ${theme === 'dark' ? 'text-blue-100' : 'text-blue-700'} drop-shadow-md`}>
            Explore a vibrant collection with a calmer, modern gradient theme. Free access to thousands of books - read online or download for offline reading.
          </p>

          {/* Animated Search Bar */}
          <div 
            ref={searchContainerRef}
            className={`relative w-full transition-all duration-300 ease-in-out ${isSearchFocused ? 'max-w-[90%] md:max-w-[80%]' : 'max-w-2xl'} z-20`}
          >
            <form onSubmit={handleSearchSubmit}>
              <div className={`flex items-center gap-3 rounded-full px-6 py-4 backdrop-blur-xl shadow-2xl border transition-all duration-300 ease-in-out ${
                theme === 'dark' 
                  ? `bg-slate-900/${isSearchFocused ? '70' : '50'} border-cyan-400/40` 
                  : `bg-white/${isSearchFocused ? '70' : '60'} border-blue-300/60`
              }`}>
                <svg 
                  className={`h-5 w-5 ${theme === 'dark' ? 'text-cyan-300' : 'text-blue-600'}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Search by title, author, or genre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className={`flex-1 bg-transparent outline-none ${theme === 'dark' ? 'text-white placeholder:text-cyan-200/50' : 'text-blue-900 placeholder:text-blue-600/60'}`}
                />
                {isSearchFocused && searchQuery && (
                  <button 
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className={`rounded-full p-1 ${theme === 'dark' ? 'hover:bg-white/20' : 'hover:bg-blue-100/60'}`}
                  >
                    <X className={`h-4 w-4 ${theme === 'dark' ? 'text-cyan-300' : 'text-blue-600'}`} />
                  </button>
                )}
              </div>
            </form>

            {/* Real-time Search Results - Positioned below search bar */}
            {isSearchFocused && searchResults.length > 0 && (
              <div 
                className="search-results-container absolute top-full left-0 right-0 mt-4 mx-auto w-full bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl max-h-[60vh] overflow-y-auto z-40 transition-all duration-300 ease-out animate-fadeIn"
                style={{ transformOrigin: 'top center' }}
              >
                <div className="sticky top-0 z-10 bg-slate-800/95 backdrop-blur-xl p-4 border-b border-slate-700 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-200">
                    Search Results ({searchResults.length})
                  </h3>
                  <button
                    onClick={() => setIsSearchFocused(false)}
                    className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-full"
                    aria-label="Close search results"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="p-4 sm:p-6 pt-2 sm:pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-3 md:p-4 md:gap-4">
                    {searchResults.map((book, index) => (
                      <div
                        key={index}
                        onClick={() => handleResultClick(book.id)}
                        className="flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-700/50 transition-colors focus-within:ring-2 focus-within:ring-slate-400"
                        role="button"
                        tabIndex={0}
                        aria-label={`View details for ${book.title} by ${book.author}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleResultClick(book.id);
                          }
                        }}
                      >
                        <div className="flex items-start gap-4">
                          {book.coverImage && (
                            <img 
                              src={book.coverImage} 
                              alt={book.title}
                              className="h-20 w-14 object-cover rounded shadow-md flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium group-hover:text-blue-400 transition-colors text-lg truncate">{book.title}</h4>
                            <p className="text-sm text-slate-300 mt-2 truncate">
                              {book.author} • {book.genre}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
}
