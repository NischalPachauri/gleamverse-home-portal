import { Book } from "./BookCarousel";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Badge } from "./ui/badge";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl border border-purple-500/20 hover:border-purple-400/60 transition-all duration-300 hover:shadow-purple-500/30 hover:shadow-2xl group hover:-translate-y-2 relative">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:via-pink-500/5 group-hover:to-purple-500/10 transition-all duration-500 pointer-events-none"></div>
      
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={book.coverImage}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
        <div className="absolute top-3 left-3">
          <span className="text-purple-300 text-xs px-3 py-1 bg-purple-900/80 backdrop-blur-sm rounded-full border border-purple-400/30 shadow-lg shadow-purple-500/30">
            {book.status}
          </span>
        </div>
        {/* Shimmer effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>
      </div>
      
      <div className="p-4 space-y-2 relative">
        <h3 className="text-white line-clamp-1 group-hover:text-purple-300 transition-colors">
          {book.title}
        </h3>
        
        <p className="text-slate-300 text-sm line-clamp-2">
          {book.description}
        </p>
        
        <div className="flex flex-wrap gap-1.5 pt-1">
          {book.genres.map((genre) => (
            <Badge 
              key={genre} 
              variant="secondary"
              className="bg-purple-900/40 text-purple-200 hover:bg-purple-800/60 border border-purple-500/30 text-xs shadow-lg shadow-purple-500/20"
            >
              {genre}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}