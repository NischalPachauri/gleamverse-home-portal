import { useState, useMemo, useEffect, useRef } from "react";
import { BookCard } from "@/components/BookCard";
// Replaced native category section by enhanced design components
import BrowseCategories from "../../Enhance Browsing Section Design/src/components/BrowseCategories";
import ContinueReadingDesign, { ContinueReadingProps } from "../../Enhance Browsing Section Design/src/components/ContinueReading";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TrendingBooks } from "@/components/TrendingBooks";
import { useUserHistory } from "@/hooks/useUserHistory";
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
  const [expandedCategories, setExpandedCategories] = useState(false);
  const { history, removeFromHistory } = useUserHistory();

  const BOOKS_PER_PAGE = 20;

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

  const gradients: Record<string, string> = {
    "All": "from-indigo-500 via-purple-500 to-pink-500",
    "Fantasy": "from-fuchsia-500 via-purple-500 to-pink-500",
    "Romance": "from-rose-500 via-pink-500 to-red-400",
    "Fiction": "from-blue-500 via-indigo-500 to-purple-500",
    "Mystery": "from-cyan-500 via-blue-500 to-indigo-500",
    "Biography": "from-teal-500 via-cyan-500 to-blue-500",
    "Philosophy": "from-violet-500 via-purple-500 to-indigo-500",
    "Non-Fiction": "from-emerald-500 via-green-500 to-teal-500",
    "Children's": "from-lime-500 via-green-500 to-emerald-500",
    "Science": "from-sky-500 via-blue-500 to-indigo-500",
    "History": "from-amber-500 via-yellow-500 to-orange-500",
    "Thriller": "from-slate-500 via-gray-500 to-zinc-500",
    "Educational": "from-green-500 via-emerald-500 to-teal-500",
    "Business": "from-slate-500 via-gray-500 to-zinc-500",
    "Adventure": "from-orange-500 via-amber-500 to-yellow-500",
  };

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

  const filteredBooks = useMemo(() => {
    const seen = new Set<number>();
    const filtered = books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Check if book matches the selected category - now checking multiple genres
      const matchesCategory = selectedCategory === "All" || 
        book.genre === selectedCategory || 
        (book.genres && book.genres.includes(selectedCategory));
      
      const ok = matchesSearch && matchesCategory;
      if (!ok) return false;
      if (seen.has(book.id)) return false;
      seen.add(book.id);
      return true;
    });
    
    // Sort to ensure Harry Potter books come first
    const baseSorted = filtered.sort((a, b) => {
      const aIsHarryPotter = a.title.toLowerCase().includes('harry potter');
      const bIsHarryPotter = b.title.toLowerCase().includes('harry potter');
      
      if (aIsHarryPotter && !bIsHarryPotter) return -1;
      if (!aIsHarryPotter && bIsHarryPotter) return 1;
      
      // If both are Harry Potter or both are not, sort by title
      return a.title.localeCompare(b.title);
    });
    // Reorder to prioritize books with loaded covers first
    return baseSorted.sort((a, b) => {
      const aLoaded = loadedCoverIds.has(a.id);
      const bLoaded = loadedCoverIds.has(b.id);
      if (aLoaded && !bLoaded) return -1;
      if (!aLoaded && bLoaded) return 1;
      return 0;
    });
  }, [searchQuery, selectedCategory, loadedCoverIds]);

  // Paginated books for browsing section
  const paginatedBooks = useMemo(() => {
    const startIndex = currentPage * BOOKS_PER_PAGE;
    return filteredBooks.slice(startIndex, startIndex + BOOKS_PER_PAGE);
  }, [filteredBooks, currentPage]);

  const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
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
        setLoadedCoverIds(new Set());
      } else {
        setPageInputValue((currentPage + 1).toString());
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, selectedCategory]);

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
            <p className="sr-only">Browse available books</p>
          </div>
          <div className="flex gap-2" />
        </div>

        {filteredBooks.length > 0 ? (
          <>
            <div 
              key={`page-${currentPage}`}
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6"
            >
              {paginatedBooks.slice(0, BOOKS_PER_PAGE).map((book, index) => (
                <BookCard key={`${book.id}-${currentPage}-${index}`} book={book} compact onCoverLoad={(id)=>{
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

      {/* Enhanced Browsing Section (Design Components) */}
      <section ref={categoriesRef} id="categories" className="container mx-auto px-4 py-16 relative">
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

        <BrowseCategories
          onSelect={(id) => {
            setSelectedCategory(id);
            setTimeout(() => {
              document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }}
          activeId={selectedCategory}
        />

        <div className="mt-16">
          <ContinueReadingDesign
            books={(history || [])
              .filter(h => (h.last_read_page || 0) > 1)
              .sort((a: any, b: any) => new Date(b.last_read_at).getTime() - new Date(a.last_read_at).getTime())
              .slice(0, 5)
              .map((h: any) => {
                const b = books.find(bb => bb.id.toString() === h.book_id);
                return {
                  id: h.book_id,
                  title: b?.title || 'Untitled',
                  author: b?.author || 'Unknown Author',
                  coverImage: getBookCover(b?.title || '') || '/placeholder.svg',
                  gradient: 'from-indigo-500 via-purple-500 to-pink-500',
                };
              })}
            onRemove={(id) => removeFromHistory(id)}
          />
        </div>
      </section>

      

      <Footer />
    </div>
  );
};

export default Index;
