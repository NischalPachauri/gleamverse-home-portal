import { useState, useMemo, useEffect, useRef } from "react";
import { BookCard } from "@/components/BookCard";
// Replaced native category section by enhanced design components
import { Footer } from "@/components/Footer";
import EnhancedImage from "@/components/EnhancedImage";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Header } from "@/components/Header";
import { TrendingBooks } from "@/components/TrendingBooks";
type ContinueReadingItem = { id: string; title: string; author: string; coverImage: string; gradient: string };
const BrowseCategories = ({ onSelect, activeId }: { onSelect: (id: string) => void; activeId: string }) => {
  // Category metadata and icon mapping
  const cats = [
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

  // Gradient palette aligned with the reference components
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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
      {cats.map(({ name, icon: Icon }) => (
        <button
          key={name}
          onClick={() => onSelect(name)}
          className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
            bg-card border border-border shadow-sm hover:shadow-lg
            dark:bg-card dark:border-border`}
          aria-pressed={activeId === name}
          data-testid={`category-${name}`}
        >
          {/* Hover gradient wash */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradients[name]} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

          {/* Icon bubble */}
          <div className={`relative mb-4 w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[name]} shadow-md mx-auto transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>

          {/* Label */}
          <div className="relative text-center">
            <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">
              {name}
            </span>
          </div>

          {/* Active state border glow */}
          <div className={`${activeId === name ? 'absolute inset-0 ring-2 ring-primary/40 rounded-2xl' : ''}`} />

          {/* Shine sweep */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </button>
      ))}
    </div>
  );
};
const ContinueReadingDesign = ({ books, onRemove }: { books: ContinueReadingItem[]; onRemove: (id: string) => void }) => {
  const visible = books.slice(0, 6); // Limit to 6 books as requested
  return (
    <div className="relative w-full overflow-x-auto snap-x snap-mandatory scroll-smooth">
      <div className="flex gap-4 min-w-full">
        {visible.map((b) => (
          <div
            key={b.id}
            className="group relative rounded-2xl bg-card border border-border p-4 transition-all duration-300 hover:shadow-lg overflow-hidden dark:bg-card dark:border-border snap-start shrink-0 basis-[calc((100%-16px)/2)] sm:basis-[calc((100%-32px)/3)] md:basis-[calc((100%-48px)/4)] lg:basis-[calc((100%-80px)/6)]"
          >
            {/* Hover wash */}
            <div className={`absolute inset-0 bg-gradient-to-br ${b.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

            {/* Cover */}
            <div className="relative mb-4 rounded-xl overflow-hidden aspect-[3/4] bg-muted">
              <EnhancedImage
                bookTitle={b.title}
                alt={b.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Remove button */}
              <button
                aria-label="Remove from continue reading"
                onClick={() => onRemove(b.id)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-red-500/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center shadow-xl hover:bg-red-600 hover:shadow-red-500/50"
              >
                ×
              </button>
            </div>

            {/* Info */}
            <div className="relative space-y-1">
              <div className="text-sm md:text-base font-semibold line-clamp-2 text-foreground group-hover:text-foreground/90 transition-colors">{b.title}</div>
              <div className="text-xs md:text-sm text-muted-foreground line-clamp-1">{b.author}</div>
            </div>

            {/* Shine sweep */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
};
import { useUserHistory } from "@/hooks/useUserHistory";
import { useBookmarks } from "@/hooks/useBookmarks";
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
import { useTheme } from "@/contexts/ThemeContext";
import { getBookCover } from "@/utils/bookCoverMapping";
declare global {
  interface Window {
    __coverCache?: Map<string, Promise<void>>;
  }
}

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
  const categoriesRef = useRef<HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const [pageInputValue, setPageInputValue] = useState("1");
  const [loadedCoverIds, setLoadedCoverIds] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState(false);
  const { history, removeFromHistory } = useUserHistory();
  const { updateBookmarkStatus, bookmarkStatuses } = useBookmarks();

  const categoriesReveal = useScrollReveal({ threshold: 0.15 });
  const continueReveal = useScrollReveal({ threshold: 0.15 });
  const footerReveal = useScrollReveal({ threshold: 0.1 });

  const BOOKS_PER_PAGE = 15;

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
    const seen = new Set<string>();
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
    const coverCache = window.__coverCache ?? (window.__coverCache = new Map<string, Promise<void>>());
    const visible = paginatedBooks.slice(0, Math.min(12, paginatedBooks.length));
    visible.forEach((book) => {
      const src = getBookCover(book.title);
      if (!coverCache.get(src)) {
        const ensureLoaded = () => new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = src;
          img.decoding = 'async';
          img.setAttribute('fetchpriority', 'high');
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

  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(new Set());
  const toggleSelect = (id: string) => {
    setSelectedBookIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className={`${theme === 'dark' ? 'min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white' : 'min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-amber-50 text-slate-900'}`}>
      {/* Enhanced Hero Section with Gradient Background and integrated Header */}
      <EnhancedHeroSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRandomBook={getRandomBook}
      />

      <div className="w-full">
        <main id="browse" className="pb-0 mx-[5%]">
          <div id="trending-books" className="mb-0" aria-label="Hot Reads">
            <TrendingBooks />
          </div>

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                {searchQuery ? "Search Results" : "Browse Our Collection"}
              </h2>
              <p className="sr-only">Browse available books</p>
            </div>
            <div className="flex gap-2" />
          </div>



          {filteredBooks.length > 0 ? (
            <>
              <div
                key={`page-${currentPage}`}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              >
                {paginatedBooks.slice(0, BOOKS_PER_PAGE).map((book, index) => (
                  <BookCard key={`${book.id}-${currentPage}-${index}`} book={book} compact selectable selected={selectedBookIds.has(book.id)} onSelect={toggleSelect} onCoverLoad={(id) => {
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
                <div className="flex items-center justify-center gap-4 mt-3 pt-[14px]">
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

          <section aria-labelledby="categories-title" ref={categoriesReveal.ref} className={`py-6 mt-12 transition-all duration-700 ${categoriesReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
            <div className="text-center mb-8">
              <h2 id="categories-title" className="relative inline-block text-3xl md:text-4xl mb-3">
                <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  Explore by Category
                </span>
                <div className="h-1 mt-3 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 rounded-full" />
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-sm md:text-lg">
                Discover your next favorite book from our carefully curated collection across diverse genres
              </p>
            </div>
            <BrowseCategories
              onSelect={(id) => {
                setSelectedCategory(id);
                setTimeout(() => {
                  document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              activeId={selectedCategory}
            />
          </section>
          <div ref={continueReveal.ref} className={`transition-all duration-700 mt-10 ${continueReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-2.5 shadow-lg">
                  <BookMarked className="w-full h-full text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl">
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Continue Your Journey
                  </span>
                </h3>
              </div>
              <p className="text-muted-foreground text-sm md:text-lg mt-2">Pick up where you left off and complete your reading goals</p>
            </div>
            {(() => {
              try {
                const items = (history || [])
                  .filter((h: { last_read_page?: number }) => (h.last_read_page || 0) > 1)
                  .sort((a: { last_read_at: string }, b: { last_read_at: string }) => new Date(b.last_read_at).getTime() - new Date(a.last_read_at).getTime())
                  .slice(0, 6)
                  .map((h: { book_id: string; last_read_at: string; last_read_page?: number }) => {
                    const b = books.find(bb => bb.id.toString() === h.book_id);
                    return {
                      id: h.book_id,
                      title: b?.title || 'Untitled',
                      author: b?.author || 'Unknown Author',
                      coverImage: getBookCover(b?.title || '') || '/placeholder.svg',
                      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
                    } as ContinueReadingItem;
                  });
                if (items.length === 0) {
                  return (
                    <div className="text-center text-muted-foreground py-6">
                      No recent reading activity. Start a book to see it here.
                    </div>
                  );
                }
                return (
                  <ContinueReadingDesign
                    books={items}
                    onRemove={(id) => {
                      removeFromHistory(id);
                      const current = bookmarkStatuses[id];
                      if (current === 'Reading') {
                        updateBookmarkStatus(id, 'Planning to Read');
                      }
                    }}
                  />
                );
              } catch (e) {
                console.error('Continue section render failed', e);
                return (
                  <div className="text-center text-destructive py-6">Failed to load recent books.</div>
                );
              }
            })()}
          </div>
        </main>
      </div>



      <div ref={footerReveal.ref} className={`transition-all duration-700 ${footerReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
