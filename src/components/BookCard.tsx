import { Link } from "react-router-dom";
import { 
  Download, Check, Sparkles, Heart, BookMarked, Baby, 
  Landmark, FlaskConical, Globe, Scroll, Swords, Brain, Users, GraduationCap,
  Castle, Fingerprint, Scale, Briefcase, Rocket, TreePine, Palette, Music,
  Clock, CheckCircle2
} from "lucide-react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Book } from "@/data/books";
import { applyMetadata } from "@/utils/bookMetadataRegistry";
import { useState, useEffect, useRef } from "react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useAuth } from "@/contexts/AuthContext";
import { useUserHistory } from "@/hooks/useUserHistory";
import { toast } from "sonner";
import EnhancedImage from "./EnhancedImage";

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

import { BookOpen } from 'lucide-react';

export function BookCard({ book, onCoverLoad, hideFavoriteOverlay = false, compact = false }: { book: Book; onCoverLoad?: (id: number) => void; hideFavoriteOverlay?: boolean; compact?: boolean }) {
  const b = applyMetadata(book);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { bookmarks, addBookmark, removeBookmark, bookmarkStatuses, updateBookmarkStatus } = useBookmarks();
  const isBookmarked = bookmarks.includes(b.id.toString());
  const bookStatus = bookmarkStatuses[b.id];
  const [favorites, setFavorites] = useState<string[]>([]);
  const { getProgress } = useUserHistory();
  const progress = getProgress(book.id);
  
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

  const { isAuthenticated } = useAuth();
  const setBookStatus = async (newStatus: string) => {
    try {
      if (!isAuthenticated) {
        toast.error('Please sign in to add or update bookmarks');
        setMenuOpen(false);
        return;
      }
      if (!isBookmarked) {
        await addBookmark(book.id, newStatus as any);
        toast.success(`Added to ${newStatus}`);
      } else if (bookStatus === newStatus) {
        await removeBookmark(book.id);
        toast.success('Removed bookmark');
      } else {
        await updateBookmarkStatus(book.id, newStatus as 'Planning to Read' | 'Reading' | 'On Hold' | 'Completed');
        toast.success(`Updated to ${newStatus}`);
      }
      setMenuOpen(false);
    } catch (error) {
      console.error("Failed to update book status:", error);
      toast.error("Could not update book status. Please try again.");
    }
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
    const safeTitle = book.title.replace(/[^A-Za-z0-9 _().,-]/g, ' ').replace(/\s+/g, ' ').trim();
    link.download = `${safeTitle}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="group relative overflow-hidden bg-card border border-border/50 transition-all duration-300 hover:shadow-[var(--shadow-hover)] hover:border-primary/30 hover:-translate-y-1">
      <Link to={`/book/${b.id}`} className="block">
        <div className="relative overflow-hidden aspect-[2/3] md:aspect-[2/3] bg-gradient-to-br from-primary/5 to-secondary/5">
          <EnhancedImage
            bookTitle={b.title}
            alt={`Cover of ${b.title} by ${b.author}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            style={{ objectFit: 'cover' }}
            onLoad={() => {
                if (onCoverLoad) onCoverLoad(b.id);
            }}
            onError={() => {
              console.error(`❌ Image failed to load: ${b.title}`);
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
          {progress && typeof progress.percentage === 'number' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
              <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400" style={{ width: `${Math.max(0, Math.min(100, progress.percentage))}%` }} />
            </div>
          )}
          
          {/* Unified browsing bar */}
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 shadow flex items-center gap-2"
            role="toolbar"
            aria-label="Browsing options"
          >
            <button
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent/40 transition-colors"
              onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); handleMenuToggle(e as any); }}
              aria-label="Bookmark options"
              aria-pressed={isBookmarked}
              title="Bookmark options"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <div className="h-6 w-px bg-border/70" aria-hidden="true" />
            {['Reading','Planning to Read','On Hold','Completed'].map(opt => (
              <button
                key={opt}
                onClick={async (e)=>{ e.preventDefault(); e.stopPropagation(); await setBookStatus(opt); }}
                className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${bookStatus===opt ? 'bg-primary/20 text-primary' : 'hover:bg-accent/40'}`}
                aria-pressed={bookStatus===opt}
                title={opt}
              >
                {opt}
              </button>
            ))}
            <div className="h-6 w-px bg-border/70" aria-hidden="true" />
            <button
              className="h-8 w-8 rounded-full flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-100/40 transition-colors"
              aria-label="Favorite"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const bookId = book.id.toString();
                let favs: string[] = [];
                try { favs = JSON.parse(localStorage.getItem('gleamverse_favorites') || '[]'); } catch {}
                if (favs.includes(bookId)) {
                  favs = favs.filter(id => id !== bookId);
                  toast.success('Removed from favorites');
                } else {
                  favs.push(bookId);
                  toast.success('Added to favorites');
                }
                try { localStorage.setItem('gleamverse_favorites', JSON.stringify(favs)); } catch {}
              }}
              title="Favorite"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 18 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </button>
            {menuOpen && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 w-56 rounded-md border bg-card shadow-xl">
                {['Planning to Read','Reading','On Hold','Completed'].map(opt => (
                  <button
                    key={opt}
                    onClick={async (e)=>{ e.preventDefault(); await setBookStatus(opt); }}
                    className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-2"
                  >
                    {bookStatus===opt && <Check className="w-4 h-4" />}<span>{opt}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Hover overlay with actions */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
          <div className="flex items-center justify-center gap-3">
              <Button 
                size="sm" 
                className="bg-primary/90 hover:bg-primary text-primary-foreground backdrop-blur-sm scale-75 h-8 px-2 text-xs"
                aria-label="Read"
              >
                <BookOpen className="w-3 h-3 mr-1" />
                Read
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={handleDownload}
                className="backdrop-blur-sm scale-75 h-8 px-2 text-xs"
                aria-label="Download"
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
              {/* Favorites moved to unified bar */}
          </div>
            
            {/* Favorite overlay removed; handled via bookmark menu */}
          </div>
        </div>
        
        <div className={compact ? "p-3" : "p-4 space-y-2"}>
          <h3 className={compact ? "font-semibold text-sm leading-tight line-clamp-1 text-foreground whitespace-normal" : "font-semibold text-lg leading-tight line-clamp-1 text-foreground group-hover:text-primary transition-colors whitespace-normal"}>
            {b.title}
          </h3>
          {!compact && (
            <>
              <p className="text-sm text-muted-foreground">{b.author === 'Unknown Author' ? '' : b.author}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{b.year}</span>
                <span>•</span>
                <span>{b.pages ? `${b.pages} pages` : ''}</span>
                <span>•</span>
                <span>{b.genre === 'General' ? '' : b.genre}</span>
              </div>
              {bookStatus && (
                <div className="text-xs font-medium inline-flex items-center gap-2 rounded-full px-2 py-1 bg-primary/10 text-primary">
                  Status: {bookStatus}
                </div>
              )}
            </>
          )}
          {!compact && (
            <div className="text-xs text-muted-foreground">
              { (b.pages || progress?.totalPages) ? `${(b.pages || progress.totalPages)} pages` : '' }
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
}
