import { useMemo } from "react";
import { books as localBooks } from "@/data/books";
import { Link } from "react-router-dom";
import { getBookCover } from "@/utils/bookCoverGenerator";

// Import cover images
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

interface BookItem {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  genre?: string;
}

export const TopBooks = () => {
  // Get top trending books immediately from local data
  const trendingBooks = useMemo(() => {
    // Create a diverse selection of trending books
    const popularAuthors = ['Chetan Bhagat', 'Durjoy Datta', 'J.K. Rowling', 'Dan Brown', 'Ravinder Singh'];
    const popularGenres = ['Romance', 'Mystery', 'Fantasy', 'Fiction', 'Thriller'];
    
    // Get Harry Potter books first (always trending)
    const harryPotterBooks = localBooks.filter(book => 
      book.title.toLowerCase().includes('harry potter')
    );
    
    // Get popular author books
    const popularAuthorBooks = localBooks.filter(book => 
      popularAuthors.some(author => book.author.toLowerCase().includes(author.toLowerCase())) &&
      !book.title.toLowerCase().includes('harry potter')
    );
    
    // Get books from popular genres
    const genreBooks = localBooks.filter(book => 
      popularGenres.includes(book.genre) &&
      !popularAuthors.some(author => book.author.toLowerCase().includes(author.toLowerCase())) &&
      !book.title.toLowerCase().includes('harry potter')
    );
    
    // Combine and shuffle for variety
    const allTrending = [...harryPotterBooks, ...popularAuthorBooks.slice(0, 10), ...genreBooks.slice(0, 10)];
    
    // Shuffle the array for variety
    const shuffled = allTrending.sort(() => Math.random() - 0.5);
    
    // Return top 24 books
    return shuffled.slice(0, 24).map(b => ({
      id: b.id,
      title: b.title,
      author: b.author,
      coverImage: b.coverImage,
      genre: b.genre
    }));
  }, []);

  // Select 8 books for the carousel (will be duplicated for seamless loop)
  const displayBooks = useMemo(() => {
    // Take first 8 books for display
    return trendingBooks.slice(0, 8);
  }, [trendingBooks]);

  const coverSrc = (b: BookItem) => {
    // For Harry Potter books, use the imported covers
    if (b.coverImage && coverImages[b.coverImage]) {
      return coverImages[b.coverImage];
    }
    // For all other books, generate beautiful covers
    return getBookCover(b);
  };

  // Build duplicated list for a seamless continuous loop
  const loopBooks = useMemo(() => {
    if (displayBooks.length === 0) return [];
    return [...displayBooks, ...displayBooks];
  }, [displayBooks]);

  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-4xl font-bold text-center mb-8 text-primary">Trending books right now</h2>
      <div className="relative rounded-2xl overflow-hidden">
        <div className="topbooks-loop">
          {loopBooks.map((b, idx) => (
            <div key={`${b.id}-${idx}`} className="px-3">
              <Link
                to={`/book/${b.id}`}
                className="group block rounded-2xl bg-card shadow-md hover:shadow-xl transition-all duration-500 w-[280px] md:w-[320px]"
              >
                <div className="flex items-center gap-3 md:gap-4 p-4 md:p-6">
                  <div className="w-16 h-20 md:w-20 md:h-24 rounded-lg bg-muted overflow-hidden flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <img
                      src={coverSrc(b)}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 text-lg leading-tight">
                      {b.title}
                    </p>
                    {b.author && (
                      <p className="text-sm text-muted-foreground mt-1 group-hover:text-foreground/80 transition-colors duration-300">
                        by {b.author}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .topbooks-loop { display: flex; gap: 12px; width: max-content; animation: topbooks-loop 32s linear infinite; will-change: transform; }
        .topbooks-loop:hover { animation-play-state: paused; }
        @keyframes topbooks-loop { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}} />
    </section>
  );
};


