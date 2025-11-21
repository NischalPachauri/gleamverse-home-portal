import { Link } from "react-router-dom";
import {
  Download, Check, Sparkles, Heart, BookMarked, Baby,
  Landmark, FlaskConical, Globe, Scroll, Swords, Brain, Users, GraduationCap,
  Castle, Fingerprint, Scale, Briefcase, Rocket, TreePine, Palette, Music,
  Clock, CheckCircle2, BookOpen, X
} from "lucide-react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Book } from "@/data/books";
import { applyMetadata } from "@/utils/bookMetadataRegistry";
import { useState, useEffect, useRef } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useBookmarks, type BookmarkStatusType } from "@/hooks/useBookmarks";
import { useAuth } from "@/contexts/AuthContext";
import { useUserHistory } from "@/hooks/useUserHistory";
import { toast } from "sonner";
import EnhancedImage from "./EnhancedImage";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const GenreIcon = ({ genre, title }: { genre: string; title: string }) => {
  const g = genre.toLowerCase();
  const t = title.toLowerCase();
  const cls = "w-10 h-10 md:w-12 md:h-12 text-white";

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

export function BookCard({ book, onCoverLoad, hideFavoriteOverlay = false, compact = false, selectable = false, selected = false, onSelect }: { book: Book; onCoverLoad?: (id: string) => void; hideFavoriteOverlay?: boolean; compact?: boolean; selectable?: boolean; selected?: boolean; onSelect?: (id: string) => void }) {
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
  const setBookStatus = async (newStatus: BookmarkStatusType) => {
    try {
      if (!isAuthenticated) {
        toast.error('Please sign in to add or update bookmarks');
        setMenuOpen(false);
        return;
      }
      if (!isBookmarked) {
        await addBookmark(book.id, newStatus);
        toast.success(`Added to ${newStatus}`);
      } else if (bookStatus === newStatus) {
        await removeBookmark(book.id);
        toast.success('Removed bookmark');
      } else {
        await updateBookmarkStatus(book.id, newStatus);
        toast.success(`Updated to ${newStatus}`);
      }
      setMenuOpen(false);
    } catch (error) {
      console.error("Failed to update book status:", error);
      toast.error("Could not update book status. Please try again.");
    }
  };

  const handleMenuToggle = (e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('bookMenuOpen'));
    setMenuOpen((v) => !v);
  };

  const handleDownload = (e: ReactMouseEvent) => {
    e.preventDefault();
    const link = document.createElement('a');
    link.href = book.pdfPath;
    const safeTitle = book.title.replace(/[^A-Za-z0-9 _().,-]/g, ' ').replace(/\s+/g, ' ').trim();
    link.download = `${safeTitle}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRemoveBookmark = async (e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isAuthenticated && isBookmarked) {
        await removeBookmark(book.id);
        toast.success('Removed from bookmarks');
      }
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
      toast.error("Could not remove bookmark. Please try again.");
    }
  };

  return (
    <Card className={`group relative overflow-hidden rounded-2xl ${selected ? 'ring-2 ring-purple-400' : ''} bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 transition-all duration-300 hover:border-transparent hover:shadow-2xl hover:shadow-purple-500/20`}>
      <div className="block" onClick={(e) => {
        if (compact && selectable) {
          e.preventDefault();
          e.stopPropagation();
          if (onSelect) onSelect(b.id);
        }
      }}>
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-violet-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="relative overflow-hidden aspect-[2/3] md:aspect-[2/3] bg-slate-800/50">
          <EnhancedImage
            bookTitle={b.title}
            alt={`Cover of ${b.title} by ${b.author}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ objectFit: 'cover' }}
            onLoad={() => {
              if (onCoverLoad) onCoverLoad(b.id);
            }}
          />

          {/* Status indicator icon - top left corner */}
          {bookStatus && (
            <div className="absolute top-3 left-3 z-10 p-2 rounded-xl bg-slate-900/80 backdrop-blur-sm shadow-xl border border-slate-700/50">
              {bookStatus === 'Planning to Read' && (
                <BookOpen className="w-4 h-4 text-blue-400" />
              )}
              {bookStatus === 'Reading' && (
                <BookMarked className="w-4 h-4 text-green-400" />
              )}
              {bookStatus === 'On Hold' && (
                <Clock className="w-4 h-4 text-amber-400" />
              )}
              {bookStatus === 'Completed' && (
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
              )}
            </div>
          )}

          {/* Bookmark dropdown overlay - top right */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Bookmark options"
                className={`absolute top-3 right-3 z-20 h-9 w-9 rounded-full bg-slate-900/80 text-white flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 hover:scale-110`}
              >
                <Bookmark className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[154px] -translate-y-[10px] transition-transform">
              {(['Planning to Read', 'Reading', 'On Hold', 'Completed', 'Favorites'] as const).map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={async () => {
                    const current = bookmarkStatuses[book.id];
                    if (!isBookmarked) {
                      await addBookmark(book.id, status);
                    } else if (current === status) {
                      await removeBookmark(book.id);
                    } else {
                      await updateBookmarkStatus(book.id, status);
                    }
                  }}
                  className="justify-between"
                >
                  <span>{status}</span>
                  {bookmarkStatuses[book.id] === status && <Check className="w-3.5 h-3.5 opacity-80" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Read / Download actions - centered */}
          <div className="absolute inset-0 m-[15px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-2">
              <Link to={`/book/${b.id}`} className="inline-flex">
                <Button
                  size="sm"
                  className="h-7 px-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 active:scale-[0.98] text-white backdrop-blur-sm shadow-lg"
                  aria-label="Read"
                >
                  <BookOpen className="w-3.5 h-3.5 mr-2" />
                  Read
                </Button>
              </Link>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleDownload}
                className="h-7 px-3 backdrop-blur-sm bg-slate-700/70 hover:bg-slate-700 active:scale-[0.98] border border-slate-600/60 shadow-lg text-white"
                aria-label="Download"
              >
                <Download className="w-3.5 h-3.5 mr-2" />
                Download
              </Button>
            </div>
          </div>

          {/* Progress bar (overlay bottom) */}
          {progress && typeof progress.percentage === 'number' && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-900/50">
              <div className="h-full bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500" style={{ width: `${Math.max(0, Math.min(100, progress.percentage))}%` }} />
            </div>
          )}

          {/* Hover overlay baseline */}
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Shine effect on hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
        </div>


        <div className={compact ? "p-3 relative z-10" : "p-4 space-y-2 relative z-10"}>
          <h3 className={compact ? "font-semibold text-sm leading-tight line-clamp-1 text-foreground whitespace-normal" : "font-semibold text-lg leading-tight line-clamp-2 text-foreground group-hover:text-purple-400 transition-colors whitespace-normal"}>
            {b.title}
          </h3>
          {!compact && (
            <>
              {/* Details removed as per request */}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
