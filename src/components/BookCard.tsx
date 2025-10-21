import { Link } from "react-router-dom";
import { Download, BookOpen, MoreVertical, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Book } from "@/data/books";
import { useState, useEffect } from "react";

// Import all cover images
import hp1 from "@/assets/covers/hp1.jpg";
import hp2 from "@/assets/covers/hp2.jpg";
import hp3 from "@/assets/covers/hp3.jpg";
import hp4 from "@/assets/covers/hp4.jpg";
import hp5 from "@/assets/covers/hp5.jpg";
import hp6 from "@/assets/covers/hp6.jpg";
import hp7 from "@/assets/covers/hp7.jpg";
import hp8 from "@/assets/covers/hp8.jpg";

const coverImages: Record<string, string> = {
  hp1, hp2, hp3, hp4, hp5, hp6, hp7, hp8
};

interface BookCardProps {
  book: Book;
}

export const BookCard = ({ book }: BookCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [status, setStatus] = useState<string>(() => {
    try {
      const raw = localStorage.getItem('bookStatus');
      if (!raw) return '';
      const map = JSON.parse(raw) as Record<string,string>;
      return map[book.id] || '';
    } catch { return ''; }
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`[data-book-id="${book.id}"]`)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen, book.id]);

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

  const setBookStatus = (newStatus: string) => {
    try {
      const raw = localStorage.getItem('bookStatus');
      const map: Record<string,string> = raw ? JSON.parse(raw) : {};
      if (newStatus) {
        map[book.id] = newStatus;
      } else {
        delete map[book.id];
      }
      localStorage.setItem('bookStatus', JSON.stringify(map));
      setStatus(newStatus);
      setMenuOpen(false);
    } catch {}
  };
  const handleMenuToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Close all other menus first
    window.dispatchEvent(new CustomEvent('bookMenuOpen'));
    
    // Then open this one
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

  return (
    <Card className="group relative overflow-hidden bg-card border-2 transition-all duration-500 hover:shadow-[var(--shadow-hover)] hover:-translate-y-2">
      <Link to={`/book/${book.id}`} className="block">
        <div className="relative overflow-hidden aspect-[2/3] bg-gradient-to-br from-primary/5 to-secondary/5">
          <img
            src={coverImages[book.coverImage] || '/placeholder.svg'}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {/* Three-dot status menu */}
          <div className="absolute top-2 right-2 z-30" data-book-id={book.id}>
            <button
              className="h-8 w-8 rounded-full bg-background/70 hover:bg-background/90 border border-border shadow flex items-center justify-center"
              onClick={handleMenuToggle}
              aria-label="Book options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="mt-2 right-0 absolute z-20 w-44 rounded-md border bg-card shadow-xl">
                {['Planning to read','Reading','On hold','Completed'].map(opt => (
                  <button
                    key={opt}
                    onClick={(e)=>{ e.preventDefault(); setBookStatus(opt); }}
                    className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-2"
                  >
                    {status===opt && <Check className="w-4 h-4" />}<span>{opt}</span>
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
          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
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
        </div>
        
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
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
          {status && (
            <div className="text-xs font-medium inline-flex items-center gap-2 rounded-full px-2 py-1 bg-primary/10 text-primary">
              Status: {status}
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
};
