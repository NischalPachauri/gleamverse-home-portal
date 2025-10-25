import { useState, useMemo, useEffect, useRef } from "react";
import { BookCard } from "@/components/BookCard";
import { CategoryCard } from "@/components/CategoryCard";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TrendingBooks } from "@/components/TrendingBooks";
import { ReadingList } from "@/components/ReadingList";
import { HeroSection } from "@/components/HeroSection";
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
  
  try {

  const filteredBooks = useMemo(() => {
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
    
    // Sort to ensure Harry Potter books come first
    return filtered.sort((a, b) => {
      const aIsHarryPotter = a.title.toLowerCase().includes('harry potter');
      const bIsHarryPotter = b.title.toLowerCase().includes('harry potter');
      
      if (aIsHarryPotter && !bIsHarryPotter) return -1;
      if (!aIsHarryPotter && bIsHarryPotter) return 1;
      
      // If both are Harry Potter or both are not, sort by title
      return a.title.localeCompare(b.title);
    });
  }, [searchQuery, selectedCategory]);

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
  }, [searchQuery, selectedCategory]);

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
      {/* Header */}
      <Header />

      {/* Theme Toggle - Visible on all devices */}
      <div className={`fixed top-20 right-4 z-50 flex gap-2 transition-opacity duration-500 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <Button
          onClick={toggleTheme}
          size="sm"
          className="rounded-full w-10 h-10 shadow-2xl bg-gradient-to-br from-primary to-secondary hover:scale-105 transition-all duration-300"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>

      {/* New Hero Section with Gradient Background */}
      <HeroSection 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRandomBook={getRandomBook}
      />

      {/* Trending Books Section */}
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
        </div>

        {filteredBooks.length > 0 ? (
          <>
            <div 
              key={`page-${currentPage}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {paginatedBooks.slice(0, BOOKS_PER_PAGE).map((book, index) => (
                <BookCard key={`${book.id}-${currentPage}-${index}`} book={book} />
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
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage + 1} of {totalPages}
                  </span>
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
      <section ref={categoriesRef} id="categories" className="container mx-auto px-4 py-16">
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
  } catch (error) {
    console.error('Index component error:', error);
    return <IndexFallback />;
  }
};

export default Index;