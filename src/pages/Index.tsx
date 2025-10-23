import { useState, useMemo, useEffect, useRef } from "react";
import { BookCard } from "@/components/BookCard";
import { CategoryCard } from "@/components/CategoryCard";
import { Footer } from "@/components/Footer";
import { TopBooks } from "@/components/TopBooks";
import { ReadingList } from "@/components/ReadingList";
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
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import libraryBg from "@/assets/library-background.jpg";

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
  const { user, signOut, isAuthenticated } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const BOOKS_PER_PAGE = 16;

  // Fade controls on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setControlsVisible(scrollPosition < 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'U';
  };

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
      {/* Theme Toggle, Sign In/Profile and Bookmarks - Visible on all devices with fade on scroll */}
      <div className={`fixed top-4 right-4 z-50 flex gap-2 transition-opacity duration-500 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-background/80 backdrop-blur-sm"
              >
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/bookmarks')}>
                <BookMarked className="mr-2 h-4 w-4" />
                My Bookmarks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/reading-history')}>
                <Book className="mr-2 h-4 w-4" />
                Reading History
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={() => {
              setAuthModalMode('login');
              setAuthModalOpen(true);
            }}
            variant="outline"
            size="sm"
            className="bg-background/80 backdrop-blur-sm"
          >
            <span className="hidden sm:inline">Sign In</span>
            <LogIn className="w-4 h-4 sm:hidden" />
          </Button>
        )}
        <Button
          onClick={() => navigate('/bookmarks')}
          size="sm"
          className="bg-primary/80 backdrop-blur-sm"
        >
          <span className="hidden sm:inline">Bookmarks</span>
          <BookMarked className="w-4 h-4 sm:hidden" />
        </Button>
        <Button
          onClick={toggleTheme}
          size="sm"
          className="rounded-full w-10 h-10 shadow-2xl bg-gradient-to-br from-primary to-secondary hover:scale-105 transition-all duration-300"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Hero Section with Library Background */}
      <header className="relative h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={libraryBg}
            alt="Library shelves background"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#5b21b6]/40 via-[#4338ca]/35 to-[#1e1b4b]/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10"></div>

        <div className="relative h-full container mx-auto px-4 flex flex-col items-center justify-center text-center">
          <Button
            onClick={getRandomBook}
            size="lg"
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6 animate-fade-in hover:scale-110 transition-all duration-300 hover:bg-white/30"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </Button>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 animate-fade-in [animation-delay:100ms] relative inline-block"
            style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.5)" }}
          >
            <span className="relative z-10 whitespace-nowrap animate-pulse-slow">
              <span className="bg-gradient-to-r from-[#8b5cf6] via-[#6366f1] to-[#4338ca] bg-clip-text text-transparent drop-shadow-[0_12px_35px_rgba(99,102,241,0.45)]">Gleam</span>
              <span className="bg-gradient-to-r from-[#4338ca] via-[#2563eb] to-[#0ea5e9] bg-clip-text text-transparent drop-shadow-[0_12px_35px_rgba(59,130,246,0.45)]">Verse</span>
            </span>
            <div className="pointer-events-none absolute -inset-3 bg-gradient-to-r from-[#8b5cf6]/35 via-[#4338ca]/20 to-[#0ea5e9]/30 rounded-[2.25rem] blur-[58px] opacity-60 animate-pulse"></div>
          </h1>
          <p
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-2 animate-fade-in [animation-delay:200ms]"
            style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.5)" }}
          >
            Where Learning Never Stops
          </p>
          <p
            className="text-lg text-slate-100 max-w-2xl animate-fade-in [animation-delay:300ms]"
            style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.5)" }}
          >
            Explore a vibrant collection with a calmer, modern gradient theme
          </p>
        </div>
      </header>

      {/* Search Bar */}
      <div id="search" className="container mx-auto px-4 -mt-10 relative z-10 mb-12">
        <div className="max-w-3xl mx-auto">
          <div className="relative mb-6">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title, author, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 h-16 text-lg shadow-2xl border-0 bg-card rounded-2xl"
            />
          </div>
          
          {/* Category Filters removed per requirements */}
        </div>
      </div>

      {/* Top Books Carousel */}
      <div id="top-books">
        <TopBooks />
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

      {/* Upload Section removed as per requirement */}

      <Footer />
    </div>
  );
  } catch (error) {
    console.error('Index component error:', error);
    return <IndexFallback />;
  }
};

export default Index;
