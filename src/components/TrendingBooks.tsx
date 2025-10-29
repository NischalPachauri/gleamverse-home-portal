import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { books } from "@/data/books";
import { ImageWithFallback } from "./ImageWithFallback";
import { getBookCover } from "@/utils/bookCoverMapping";

export function TrendingBooks() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Get only Harry Potter books for trending section
  const harryPotterBooks = books.filter(book => 
    book.title.toLowerCase().includes('harry potter')
  );
  
  const trendingBooks = harryPotterBooks.slice(0, 16).map((book, index) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    bgColor: getGradientColor(index)
  }));

  // Duplicate books for seamless infinite scroll
  const duplicatedBooks = [...trendingBooks, ...trendingBooks];

  function getGradientColor(index: number): string {
    const gradients = [
      "bg-gradient-to-br from-pink-500 to-rose-600",
      "bg-gradient-to-br from-purple-500 to-violet-600",
      "bg-gradient-to-br from-amber-500 to-orange-600",
      "bg-gradient-to-br from-slate-600 to-gray-700",
      "bg-gradient-to-br from-emerald-500 to-teal-600",
      "bg-gradient-to-br from-yellow-400 to-amber-500",
      "bg-gradient-to-br from-rose-400 to-pink-500",
      "bg-gradient-to-br from-blue-500 to-indigo-600",
      "bg-gradient-to-br from-cyan-500 to-blue-600",
      "bg-gradient-to-br from-green-600 to-emerald-700",
      "bg-gradient-to-br from-red-500 to-orange-600",
      "bg-gradient-to-br from-lime-500 to-green-600",
      "bg-gradient-to-br from-stone-500 to-neutral-600",
      "bg-gradient-to-br from-sky-600 to-blue-700",
      "bg-gradient-to-br from-violet-500 to-purple-600",
      "bg-gradient-to-br from-fuchsia-500 to-pink-600"
    ];
    return gradients[index % gradients.length];
  }

  const handleBookClick = (bookId: string) => {
    navigate(`/book/${bookId}`);
  };

  return (
    <div className="w-full overflow-hidden mb-8 pt-6">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-10 dark:text-white text-black">
        🔥 Hot Reads Right Now
      </h2>
      
      {/* Infinite Scroll Container with 15% margins */}
      <div className="relative overflow-hidden mx-[10%] md:mx-[15%]">
        {/* Scrolling Books */}
        <div className="flex gap-4 md:gap-5 animate-scroll-seamless">
          {duplicatedBooks.map((book, index) => (
            <div
              key={`${book.id}-${index}`}
              className="flex-shrink-0 w-[140px] md:w-[150px] group cursor-pointer"
              onClick={() => handleBookClick(book.id)}
            >
              <div className={`${book.bgColor} rounded-lg p-4 md:p-5 h-[200px] md:h-[204px] flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-102 relative overflow-hidden`}>
                {/* Book Cover Image */}
                <div className="absolute inset-0 opacity-20 z-0">
                  <ImageWithFallback
                    src={getBookCover(book.title) || '/placeholder.svg'}
                    alt={`Cover of ${book.title}`}
                    fallbackSrc="/placeholder.svg"
                    className="w-full h-full object-cover"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                
                <div className="flex flex-col gap-2 relative z-10">
                  <div className="text-white text-xs uppercase tracking-wider font-medium leading-tight">
                    Now Reading
                  </div>
                  <div className="h-16 flex items-center">
                    <h3 className="text-white font-semibold line-clamp-3 leading-snug">
                      {book.title}
                    </h3>
                  </div>
                </div>
                <div className="text-white text-sm font-medium relative z-10">
                  by {book.author}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        /* Animation for seamless scrolling */
        @keyframes scroll-seamless {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll-seamless {
          animation: scroll-seamless 40s linear infinite;
          width: calc(200% + 2.5rem);
          will-change: transform;
        }

        .animate-scroll-seamless:hover {
          animation-play-state: paused;
        }

        /* Scale transformation for hover effect */
        .group-hover\\:scale-102 {
          transform: scale(1.02);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          h2 {
            font-size: 1.75rem;
            margin-bottom: 1rem;
          }
        }

        /* Optimize for high-DPI displays */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .rounded-lg {
            border-radius: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
