import { Link } from "react-router-dom";
import { 
  Download, BookOpen, MoreVertical, Check, Sparkles, Heart, BookMarked, Baby, 
  Landmark, FlaskConical, Globe, Scroll, Swords, Brain, Users, GraduationCap,
  Castle, Fingerprint, Scale, Briefcase, Rocket, TreePine, Palette, Music,
  Clock, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Book } from "@/data/books";
import { useState, useEffect, useRef } from "react";
import { getBookCover } from "@/utils/bookCoverMapping";
import { useLocalBookmarks } from "@/hooks/useLocalBookmarks";
import { toast } from "sonner";
import { ImageWithFallback } from "./ImageWithFallback";

const GenreIcon = ({ genre, title }: { genre: string; title: string }) => {
  const g = genre.toLowerCase();
  const t = title.toLowerCase();
  const cls = "w-10 h-10 md:w-12 md:h-12 text-primary";
  
  // Specific book/series icons
  if (t.includes('harry potter')) return <Sparkles className={cls} />;
  if (t.includes('crime') || t.includes('punishment')) return <Scale className={cls} />;
  if (t.includes('love') || t.includes('girlfriend') || t.includes('crush')) return <Heart className={cls} />;
  if (t.includes('wings of fire') || t.includes('rocket')) return <Rocket className={cls} />;
  if (t.includes('secret') || t.includes('mystery')) return <Fingerprint className={cls} />;
  if (t.includes('palace') || t.includes('castle')) return <Castle className={cls} />;
  if (t.includes('jungle book') || t.includes('grandma')) return <TreePine className={cls} />;
  if (t.includes('three musketeers') || t.includes('sword')) return <Swords className={cls} />;
  if (t.includes('philosophy') || t.includes('gita')) return <Scroll className={cls} />;
  if (t.includes('biography') || t.includes('life')) return <Users className={cls} />;
  if (t.includes('student') || t.includes('college') || t.includes('school')) return <GraduationCap className={cls} />;
  if (t.includes('business') || t.includes('job')) return <Briefcase className={cls} />;
  if (t.includes('art') || t.includes('paint')) return <Palette className={cls} />;
  if (t.includes('music') || t.includes('song')) return <Music className={cls} />;
  if (t.includes('mind') || t.includes('brain') || t.includes('think')) return <Brain className={cls} />;
  
  // Genre-based fallbacks
  if (g.includes('fantasy')) return <Sparkles className={cls} />;
  if (g.includes('romance')) return <Heart className={cls} />;
  if (g.includes("children")) return <Baby className={cls} />;
  if (g.includes('philosophy')) return <Landmark className={cls} />;
  if (g.includes('mystery')) return <FlaskConical className={cls} />;
  if (g.includes('non-fiction')) return <Globe className={cls} />;
  if (g.includes('biography')) return <BookMarked className={cls} />;
  
  return <BookOpen className={cls} />;
};

export function BookCard({ book }: { book: Book }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { bookmarkedBooks, addBookmark, removeBookmark, bookmarkStatuses, updateBookmarkStatus } = useLocalBookmarks();
  const isBookmarked = bookmarkedBooks.includes(book.id.toString());
  const bookStatus = bookmarkStatuses[book.id];
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Load favorites from localStorage
  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('gleamverse_favorites') || '[]');
    setFavorites(storedFavorites);
  }, []);
  
  // Handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Close menu when another menu opens (global state)
  useEffect(() => {
    const handleGlobalMenuOpen = () => {
      setMenuOpen(false);
    };

    if (menuOpen) {
      window.addEventListener('bookMenuOpen', handleGlobalMenuOpen);
      return () => window.removeEventListener('bookMenuOpen', handleGlobalMenuOpen);
    }
  }, [menuOpen]);

  const setBookStatus = async (newStatus: string) => {
    try {
      const raw = localStorage.getItem('bookStatus');
      const map: Record<string,string> = raw ? JSON.parse(raw) : {};
      if (newStatus) {
        map[book.id] = newStatus;
        if (!isBookmarked) {
          await addBookmark(book.id);
          toast.success(`Added to ${newStatus}`);
        }
      } else {
        delete map[book.id];
        if (isBookmarked) {
          await removeBookmark(book.id);
          toast.success('Removed from bookmarks');
        }
      }
      localStorage.setItem('bookStatus', JSON.stringify(map));
      updateBookmarkStatus(book.id, newStatus as any);
      setMenuOpen(false);
    } catch {}
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('bookMenuOpen'));
    setMenuOpen((v) => !v);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    const link = document.createElement('a');
    link.href = book.pdfPath;
    link.download = `${book.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get book cover using the updated getBookCover function
  const bookCover = getBookCover(book.title);
  
  // Enhanced debug logging for cover resolution
  useEffect(() => {
    if (bookCover === '/placeholder.svg') {
      console.warn(`Using placeholder for book: "${book.title}" with path: ${book.pdfPath}`);
    }
  }, [book.title, book.pdfPath, bookCover]);

  return (
    <Card className="group relative overflow-hidden bg-card border border-border/50 transition-all duration-300 hover:shadow-[var(--shadow-hover)] hover:border-primary/30 hover:-translate-y-1">
      <Link to={`/book/${book.id}`} className="block">
        <div className="relative overflow-hidden aspect-[2/3] md:aspect-[2/3] bg-gradient-to-br from-primary/5 to-secondary/5">
          <ImageWithFallback
            src={bookCover || '/placeholder.svg'}
            alt={`Cover of ${book.title} by ${book.author}`}
            fallbackSrc="/placeholder.svg"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            style={{ objectFit: 'cover' }}
            onLoad={() => {
              if (bookCover) {
                console.log(`✅ Image loaded successfully: ${book.title}`);
              }
            }}
            onError={() => {
              console.error(`❌ Image failed to load: ${book.title}`, bookCover);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Section indicator icon - top left corner */}
          {bookStatus && (
            <div className="absolute top-2 left-2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm shadow-md border border-primary/20">
              {bookStatus === 'Planning to Read' && (
                <BookOpen className="w-4 h-4 text-blue-500" />
              )}
              {bookStatus === 'Reading' && (
                <BookMarked className="w-4 h-4 text-green-500" />
              )}
              {bookStatus === 'On Hold' && (
                <Clock className="w-4 h-4 text-amber-500" />
              )}
              {bookStatus === 'Completed' && (
                <CheckCircle2 className="w-4 h-4 text-purple-500" />
              )}
            </div>
          )}
          
          {/* Three-dot status menu */}
          <div className="absolute top-2 right-2 z-30 bookmark-dots" ref={menuRef} data-book-id={book.id}>
            <button
              className="h-8 w-8 rounded-full bg-background/70 hover:bg-background/90 border border-border shadow flex items-center justify-center"
              onClick={handleMenuToggle}
              aria-label="Book options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="mt-2 right-0 absolute z-20 w-44 rounded-md border bg-card shadow-xl">
                {['Planning to Read','Reading','On Hold','Completed'].map(opt => (
                  <button
                    key={opt}
                    onClick={async (e)=>{ e.preventDefault(); await setBookStatus(opt); }}
                    className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-2"
                  >
                    {bookStatus===opt && <Check className="w-4 h-4" />}<span>{opt}</span>
                  </button>
                ))}
                <div className="h-px bg-border" />
                <button
                  onClick={(e)=>{ e.preventDefault(); setBookStatus(''); }}
                  className="w-full text-left px-3 py-2 hover:bg-accent"
                >
                  Clear status
                </button>
              </div>
            )}
          </div>
          
          {/* Hover overlay with actions */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
            <div className="flex items-center justify-center gap-3">
              <Button 
                size="sm" 
                className="bg-primary/90 hover:bg-primary text-primary-foreground backdrop-blur-sm"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Read
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={handleDownload}
                className="backdrop-blur-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
            
            {/* Favorite button */}
            <Button
              size="sm"
              variant="ghost"
              className="mt-2 bg-background/80 hover:bg-background/90 backdrop-blur-sm transition-all duration-300"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const bookId = book.id.toString();
                
                if (favorites.includes(bookId)) {
                  const updatedFavorites = favorites.filter(id => id !== bookId);
                  localStorage.setItem('gleamverse_favorites', JSON.stringify(updatedFavorites));
                  setFavorites(updatedFavorites);
                  toast.success('Removed from favorites');
                } else {
                  const updatedFavorites = [...favorites, bookId];
                  localStorage.setItem('gleamverse_favorites', JSON.stringify(updatedFavorites));
                  setFavorites(updatedFavorites);
                  toast.success('Added to favorites');
                }
              }}
              aria-label={favorites.includes(book.id.toString()) ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart 
                className={`w-5 h-5 ${
                  favorites.includes(book.id.toString()) 
                    ? "fill-red-500 text-red-500" 
                    : "text-gray-600 hover:text-red-500 hover:fill-red-500/50"
                } transition-all duration-300 transform hover:scale-110`} 
              />
            </Button>
          </div>
        </div>
        
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-1 text-foreground group-hover:text-primary transition-colors whitespace-normal">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground">{book.author}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{book.year}</span>
            <span>•</span>
            <span>{book.pages} pages</span>
            <span>•</span>
            <span>{book.genre}</span>
          </div>
          {bookStatus && (
            <div className="text-xs font-medium inline-flex items-center gap-2 rounded-full px-2 py-1 bg-primary/10 text-primary">
              Status: {bookStatus}
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
}