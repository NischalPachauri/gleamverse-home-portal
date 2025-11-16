import { BookOpen, X } from 'lucide-react';
import React, { useRef } from 'react';
import ImageWithFallback from '@/components/ImageWithFallback';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  gradient: string;
}

export interface ContinueReadingProps {
  books: Book[];
  onRemove?: (id: string) => void;
}

export default function ContinueReading({ books, onRemove }: ContinueReadingProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.2 });

  const handleRemoveBook = (bookId: string) => {
    onRemove?.(bookId);
  };

  return (
    <section ref={sectionRef as any} className="w-full py-16 px-4 relative overflow-hidden">
      {/* Background gradient decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className={`text-center mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-2.5 shadow-lg">
              <BookOpen className="w-full h-full text-white" />
            </div>
            <h2 className="relative text-4xl">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Continue Your Journey
              </span>
            </h2>
          </div>
          <p className="text-muted-foreground text-lg mt-6">
            Pick up where you left off and complete your reading goals
          </p>
        </div>

        {/* Books Grid */}
        {books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {books.map((book, index) => (
              <div
                key={book.id}
                className={`group transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 p-4 transition-all duration-300 hover:border-transparent hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden h-full">
                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${book.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  {/* Book Cover */}
                  <div className="relative mb-4 rounded-xl overflow-hidden aspect-[3/4] bg-slate-800/50">
                    <ImageWithFallback
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Remove Button on Book Cover */}
                    <button
                      onClick={() => handleRemoveBook(book.id)}
                      className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-red-500/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center shadow-xl hover:bg-red-600 hover:shadow-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label="Remove book"
                    >
                      <X className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Book Info */}
                  <div className="relative space-y-2">
                    <h3 className="text-foreground group-hover:text-foreground/90 transition-colors line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {book.author}
                    </p>
                  </div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 mx-auto mb-6 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-muted-foreground text-xl mb-2">No books in your reading list</h3>
            <p className="text-muted-foreground">Start exploring to add new books to continue reading</p>
          </div>
        )}
      </div>
    </section>
  );
}
