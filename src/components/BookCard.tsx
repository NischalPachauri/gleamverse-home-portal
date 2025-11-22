import { Link } from "react-router-dom";
import { Book } from "@/types/profile";
import { Card } from "@/components/ui/card";
import EnhancedImage from "./EnhancedImage";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Check, BookOpen, Download } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useUserHistory } from "@/hooks/useUserHistory";
import { useAuth } from "@/contexts/AuthContext";
import { applyMetadata } from "@/utils/bookMetadataRegistry";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BookCardProps {
  book: Book;
  compact?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onCoverLoad?: (id: string) => void;
}

export function BookCard({
  book,
  compact = false,
  selectable = false,
  selected = false,
  onSelect,
  onCoverLoad
}: BookCardProps) {
  const enriched = applyMetadata(book);
  const { bookmarks, bookmarkStatuses, addBookmark, removeBookmark, updateBookmarkStatus } = useBookmarks();
  const { getProgress } = useUserHistory();
  const { isAuthenticated } = useAuth();
  const [forcedVisible, setForcedVisible] = useState(false);
  const navigate = useNavigate();

  const progress = getProgress?.(book.id);
  const isBookmarked = bookmarks.includes(book.id);
  const currentStatus = bookmarkStatuses[book.id];

  const handleImageLoad = () => {
    if (onCoverLoad) {
      onCoverLoad(book.id);
    }
  };

  const handlePointerDown = () => {
    const timer = setTimeout(() => {
      setForcedVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  };

  const handleRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/book/${book.id}`);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (book.pdfPath) {
      const link = document.createElement('a');
      link.href = book.pdfPath;
      link.download = `${book.title}.pdf`;
      link.click();
    }
  };

  const genres = enriched.genres || (enriched.genre ? [enriched.genre] : []);

  // Map bookmark status to icon
  const getBookmarkIcon = () => {
    if (!isBookmarked) return null;

    const iconClass = "w-5 h-5";
    switch (currentStatus) {
      case 'Reading':
        return <BookOpen className={iconClass} />;
      case 'Completed':
        return <Check className={iconClass} />;
      case 'On Hold':
        return <Bookmark className={`${iconClass} fill-current`} />;
      case 'Planning to Read':
        return <Bookmark className={iconClass} />;
      case 'Favorites':
        return <span className="text-lg">❤️</span>;
      default:
        return <Bookmark className={iconClass} />;
    }
  };

  return (
    <Card
      className={`group relative overflow-hidden bg-card border-border hover:shadow-lg transition-all duration-300 hover:border-primary/50 ${compact ? 'p-3' : 'p-4'
        } ${selected ? 'ring-2 ring-primary' : ''}`}
      onPointerDown={handlePointerDown}
    >
      <Link to={`/book/${book.id}`} className="block">
        <div className={`relative overflow-hidden rounded-lg ${compact ? 'mb-2' : 'mb-3'}`}>
          <div className="aspect-[2/3]">
            <EnhancedImage
              bookTitle={book.title}
              alt={`Cover of ${book.title}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onLoad={handleImageLoad}
            />
          </div>

          {/* Read and Download buttons overlay */}
          {compact && (
            <div className="absolute inset-0 bg-slate-900/70 dark:bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
              <Button
                size="sm"
                onClick={handleRead}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
              >
                <BookOpen className="w-3 h-3 mr-1" />
                Read
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleDownload}
                className="bg-white/90 hover:bg-white text-slate-900 text-xs h-8"
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>
          )}

          {progress && progress.percentage > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${Math.min(100, progress.percentage)}%` }}
              />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className={`font-semibold line-clamp-2 text-foreground group-hover:text-primary transition-colors ${compact ? 'text-sm' : 'text-base'
            }`}>
            {book.title}
          </h3>

          {!compact && (
            <>
              <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>

              {genres.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {genres.slice(0, 2).map((genre, i) => (
                    <Badge
                      key={`${genre}-${i}`}
                      variant="secondary"
                      className="text-xs"
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Link>

      {/* Bookmark status icon - top left */}
      {compact && isAuthenticated && isBookmarked && (
        <div className="absolute top-2 left-2 z-10 h-8 w-8 rounded-full bg-purple-600/90 dark:bg-purple-500/90 text-white flex items-center justify-center shadow-lg">
          {getBookmarkIcon()}
        </div>
      )}

      {/* Bookmark dropdown - top right */}
      {compact && isAuthenticated && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Bookmark options"
              className={`absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-slate-900/70 dark:bg-slate-100/70 text-white dark:text-slate-900 flex items-center justify-center transition-all duration-200 ${forcedVisible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                } hover:scale-110`}
              onClick={(e) => e.preventDefault()}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
            {(['Planning to Read', 'Reading', 'On Hold', 'Completed', 'Favorites'] as const).map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={async (e) => {
                  e.preventDefault();
                  if (!isBookmarked) {
                    await addBookmark(book.id, status);
                  } else if (currentStatus === status) {
                    await removeBookmark(book.id);
                  } else {
                    await updateBookmarkStatus(book.id, status);
                  }
                }}
                className="justify-between cursor-pointer"
              >
                <span>{status}</span>
                {currentStatus === status && <Check className="w-3.5 h-3.5 opacity-80" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </Card>
  );
}
