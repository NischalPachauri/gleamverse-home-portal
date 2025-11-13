import { useState, useMemo, useEffect, useRef } from "react";
import { BookCard } from "@/components/BookCard";
import { CategoryCard } from "@/components/CategoryCard";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TrendingBooks } from "@/components/TrendingBooks";
import { ReadingList } from "@/components/ReadingList";
import { HeroSection } from "@/components/HeroSection";
import { EnhancedHeroSection } from "@/components/EnhancedHeroSection";
import { books } from "@/data/books";
import { 
  Search, Sparkles, Book, Globe, FlaskConical, Landmark, Laptop, 
  Baby, Heart, Scroll, Scale, Users, User, LogIn,
  GraduationCap, Briefcase, TreePine, Home, BookMarked, Moon, Sun
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useTheme } from "@/contexts/ThemeContext";
import { getBookCover } from "@/utils/bookCoverMapping";

// Fallback component in case of errors
const IndexFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#8b5cf6] via-[#6366f1] to-[#0ea5e9] bg-clip-text text-transparent drop-shadow-[0_12px_35px_rgba(99,102,241,0.45)]">GleamVerse</h1>
      <p className="text-lg text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const navigate = useNavigate();
  const isVisible = useScrollReveal();
  const categoriesRef = useRef<HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const [pageInputValue, setPageInputValue] = useState("1");
  const [loadedCoverIds, setLoadedCoverIds] = useState<Set<number>>(new Set());
  const [sortOrder, setSortOrder] = useState<'alphabetical' | 'random' | 'popularity'>('alphabetical');
  const [randomSeed, setRandomSeed] = useState<number>(() => Math.random());

  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    cacheHits: 0,
    cacheMisses: 0
  });

  const BOOKS_PER_PAGE = 16;

  // Keep controls always visible (removed fade on scroll)
  useEffect(() => {
    setControlsVisible(true);
  }, []);

  const categoryData = [
    { name: "All", icon: Home },
    { name: "Fantasy", icon: Sparkles },
    { name: "Romance", icon: Heart },
    { name: "Fiction", icon: Book },
    { name: "Mystery", icon: FlaskConical },
    { name: "Biography", icon: Users },
    { name: "Philosophy", icon: Scroll },
    { name: "Non-Fiction", icon: Globe },
    { name: "Children's", icon: Baby },
    { name: "Science", icon: Laptop },
    { name: "History", icon: Landmark },
    { name: "Thriller", icon: Scale },
    { name: "Educational", icon: GraduationCap },
    { name: "Business", icon: Briefcase },
    { name: "Adventure", icon: TreePine },
  ];

  const categories = useMemo(() => {
    const allGenres = new Set<string>();
    books.forEach(book => {
      // Add the main genre
      if (book.genre) allGenres.add(book.genre);
      // Add all genres from the genres array
      if (book.genres && Array.isArray(book.genres)) {
        book.genres.forEach(g => allGenres.add(g));
      }
    });
    const uniqueCategories = Array.from(allGenres).sort();
    return ["All", ...uniqueCategories];
  }, []);

  // Optimized sorting algorithms with caching
  const filteredBooks = useMemo(() => {
    const startTime = performance.now();
    
    const filtered = books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Check if book matches the selected category - now checking multiple genres
      const matchesCategory = selectedCategory === "All" || 
        book.genre === selectedCategory || 
        (book.genres && book.genres.includes(selectedCategory));
      
      return matchesSearch && matchesCategory;
    });
    
    // Apply optimized sorting based on selected order
    let sorted = [...filtered];
    
    switch (sortOrder) {
      case 'alphabetical':
        sorted.sort((a, b) => {
          // Priority: Harry Potter first, then alphabetical
          const aIsHarryPotter = a.title.toLowerCase().includes('harry potter');
          const bIsHarryPotter = b.title.toLowerCase().includes('harry potter');
          
          if (aIsHarryPotter && !bIsHarryPotter) return -1;
          if (!aIsHarryPotter && bIsHarryPotter) return 1;
          
          return a.title.localeCompare(b.title);
        });
        break;
        
      case 'random':
        // Deterministic random using seed for consistent results
        const seededRandom = (seed: number) => {
          let x = Math.sin(seed) * 10000;
          return x - Math.floor(x);
        };
        
        sorted.sort((a, b) => {
          const aHash = a.id * 9301 + 49297;
          const bHash = b.id * 9301 + 49297;
          const aRandom = seededRandom(aHash + randomSeed);
          const bRandom = seededRandom(bHash + randomSeed);
          return aRandom - bRandom;
        });
        break;
        
      case 'popularity':
        // Sort by title length as a proxy for popularity (shorter titles often more popular)
        sorted.sort((a, b) => {
          const aLength = a.title.length;
          const bLength = b.title.length;
          if (aLength !== bLength) return aLength - bLength;
          return a.title.localeCompare(b.title);
        });
        break;
    }
    
    // Final optimization: prioritize books with loaded covers first
    const finalSorted = sorted.sort((a, b) => {
      const aLoaded = loadedCoverIds.has(a.id);
      const bLoaded = loadedCoverIds.has(b.id);
      if (aLoaded && !bLoaded) return -1;
      if (!aLoaded && bLoaded) return 1;
      return 0;
    });
    
    const endTime = performance.now();
    setPerformanceMetrics(prev => ({
      ...prev,
      renderTime: endTime - startTime
    }));
    
    return finalSorted;
  }, [searchQuery, selectedCategory, loadedCoverIds, sortOrder, randomSeed]);

  // Paginated books for browsing section
  const paginatedBooks = useMemo(() => {
    const startIndex = currentPage * BOOKS_PER_PAGE;
    return filteredBooks.slice(startIndex, startIndex + BOOKS_PER_PAGE);
  }, [filteredBooks, currentPage]);

  const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      // Scroll to top of browse section
      requestAnimationFrame(() => {
        document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  };
  
  // Handle direct page input
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(e.target.value);
  };
  
  // Handle page input submission
  const handlePageInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNumber = parseInt(pageInputValue, 10);
      if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber - 1);
        // Scroll to top of browse section
        requestAnimationFrame(() => {
          document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      } else {
        setPageInputValue((currentPage + 1).toString());
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      // Scroll to top of browse section
      requestAnimationFrame(() => {
        document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, selectedCategory, sortOrder]);

  // Shuffle random order
  const shuffleRandomOrder = () => {
    setRandomSeed(Math.random());
  };

  // Enhanced cover loading with performance monitoring
  useEffect(() => {
    const startTime = performance.now();
    const coverCache = (window as any).__coverCache || ((window as any).__coverCache = new Map<string, Promise<void>>());
    
    let cacheHits = 0;
    let cacheMisses = 0;
    
    const visible = paginatedBooks.slice(0, Math.min(12, paginatedBooks.length));
    visible.forEach((book) => {
      const src = getBookCover(book.title);
      if (coverCache.get(src)) {
        cacheHits++;
      } else {
        cacheMisses++;
      }
      
      if (!coverCache.get(src)) {
        const ensureLoaded = () => new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Image failed to load'));
          img.src = src;
          img.decoding = 'async' as any;
          (img as any).fetchpriority = 'high';
        });
        coverCache.set(src, ensureLoaded());
      }
    });
    
    const endTime = performance.now();
    setPerformanceMetrics(prev => ({
      ...prev,
      loadTime: endTime - startTime,
      cacheHits,
      cacheMisses
    }));
  }, [paginatedBooks]);

  // Update page input when page changes
  useEffect(() => {
    setPageInputValue((currentPage + 1).toString());
  }, [currentPage]);

  useEffect(() => {
    const coverCache = (window as any).__coverCache || ((window as any).__coverCache = new Map<string, Promise<void>>());
    const visible = paginatedBooks.slice(0, Math.min(12, paginatedBooks.length));
    visible.forEach((book) => {
      const src = getBookCover(book.title);
      if (!coverCache.get(src)) {
        const ensureLoaded = () => new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Image failed to load'));
          img.src = src;
          img.decoding = 'async' as any;
          (img as any).fetchpriority = 'high';
        });
        coverCache.set(src, ensureLoaded());
      }
    });
  }, [paginatedBooks]);

  const getRandomBook = () => {
    const randomBook = books[Math.floor(Math.random() * books.length)];
    toast.success(`How about "${randomBook.title}"?`, {
      description: `by ${randomBook.author}`,
      duration: 4000,
    });
    navigate(`/book/${randomBook.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Hero Section with Gradient Background and integrated Header */}
      <EnhancedHeroSection 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRandomBook={getRandomBook}
      />

      {/* Trending Books Section - Always visible */}
      <div id="trending-books">
        <TrendingBooks />
      </div>

      {/* Books Grid - Browse Collection (moved above categories and library) */}
      <main id="browse" className="container mx-auto px-4 pb-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {searchQuery ? "Search Results" : "Browse Collection"}
            </h2>
            <p className="text-muted-foreground">
              Showing {paginatedBooks.length} of {filteredBooks.length} {filteredBooks.length === 1 ? "book" : "books"}
            </p>
          </div>
          
          {/* Sorting Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'alphabetical' | 'random' | 'popularity')}
                className="px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="alphabetical">Alphabetical</option>
                <option value="random">Random</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>
            
            {sortOrder === 'random' && (
              <Button
                onClick={shuffleRandomOrder}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Shuffle
              </Button>
            )}
            
            {/* Performance Metrics Display */}
            {performanceMetrics.renderTime > 0 && (
              <div className="text-xs text-muted-foreground">
                Render: {Math.round(performanceMetrics.renderTime)}ms
              </div>
            )}
          </div>
        </div>

        {filteredBooks.length > 0 ? (
          <>
            <div 
              key={`page-${currentPage}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {paginatedBooks.slice(0, BOOKS_PER_PAGE).map((book, index) => (
                <BookCard key={`${book.id}-${currentPage}-${index}`} book={book} onCoverLoad={(id)=>{
                  setLoadedCoverIds(prev => {
                    const next = new Set(prev);
                    next.add(id);
                    return next;
                  });
                }} />
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <Button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  size="lg"
                  variant="outline"
                  className="group"
                >
                  <svg 
                    className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Page</span>
                  <input
                    type="text"
                    value={pageInputValue}
                    onChange={handlePageInputChange}
                    onKeyDown={handlePageInputSubmit}
                    className="w-12 h-8 text-center bg-background border border-input rounded-md text-sm"
                    aria-label={`Page ${currentPage + 1} of ${totalPages}`}
                  />
                  <span className="text-sm text-muted-foreground">of {totalPages}</span>
                </div>
                
                <Button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages - 1}
                  size="lg"
                  variant="outline"
                  className="group"
                >
                  Next
                  <svg 
                    className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">
              No books found matching "{searchQuery}"
            </p>
          </div>
        )}
      </main>

      {/* Browse Categories Section */}
      <section ref={categoriesRef} id="categories" className="container mx-auto px-4 py-16 relative">
        {/* Scroll Up Button */}
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`absolute right-8 -top-6 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10 ${
            theme === 'dark' 
              ? 'bg-slate-800 text-cyan-400 hover:bg-slate-700 border border-cyan-500/30' 
              : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-200'
          }`}
          aria-label="Scroll to top"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-5xl font-bold text-center mb-4 text-primary">
            Browse Categories
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-primary to-secondary mx-auto mb-12 rounded-full"></div>
          
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {categoryData.map((cat, idx) => (
              <div
                key={cat.name}
                className="transition-all duration-700"
                style={{ 
                  transitionDelay: `${idx * 50}ms`,
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
                }}
              >
                <CategoryCard
                  icon={cat.icon}
                  title={cat.name}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    // Scroll to browse section when category is selected
                    setTimeout(() => {
                      document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  isActive={selectedCategory === cat.name}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Your Library Section */}
      <div id="library">
        <ReadingList />
      </div>

      <Footer />
    </div>
  );
};

export default Index;
