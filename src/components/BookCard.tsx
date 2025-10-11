import { Link } from "react-router-dom";
import { Download, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Book } from "@/data/books";

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
            src={coverImages[book.coverImage]}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
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
        </div>
      </Link>
    </Card>
  );
};
