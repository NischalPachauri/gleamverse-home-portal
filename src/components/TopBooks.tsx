import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { books as localBooks } from "@/data/books";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  author?: string;
  coverImage?: string; // key into assets for local fallback
  cover_url?: string;  // url from db
}

export const TopBooks = () => {
  const [top, setTop] = useState<BookItem[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("books")
          .select("id,title,author,cover_url")
          .order("read_count", { ascending: false })
          .limit(7);
        if (!error && data && data.length > 0) {
          setTop(data as BookItem[]);
          return;
        }
      } catch (error) {
        console.error('Error loading top books:', error);
      }
      // fallback to local books
      try {
        setTop(localBooks.slice(0, 7).map((b: { id: string; title: string; author: string; coverImage: string }) => ({ id: b.id, title: b.title, author: b.author, coverImage: b.coverImage })));
      } catch (error) {
        console.error('Error loading local books:', error);
        // If even local books fail, set empty array
        setTop([]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (top.length === 0) return;
    const i = setInterval(() => {
      setIndex((prev) => (prev + 1) % Math.min(7, top.length));
    }, 3500);
    return () => clearInterval(i);
  }, [top]);

  const visible = useMemo(() => {
    if (top.length === 0) return [] as BookItem[];
    const arr: BookItem[] = [];
    for (let i = 0; i < 3; i++) {
      arr.push(top[(index + i) % top.length]);
    }
    return arr;
  }, [top, index]);

  const coverSrc = (b: BookItem) => {
    if (b.cover_url) return b.cover_url;
    return coverImages[b.coverImage || ""] || "";
  };

  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-4xl font-bold text-center mb-4 text-primary">Top Books</h2>
      <p className="text-center text-muted-foreground mb-8">Most read books right now</p>
      
      {/* Smooth Sliding Carousel */}
      <div className="relative overflow-hidden rounded-2xl">
        <div 
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${index * (100 / 3)}%)`,
            width: `${(top.length * 100) / 3}%`
          }}
        >
          {top.map((b, idx) => (
            <div key={`${b.id}-${idx}`} className="w-1/3 px-3">
              <Link 
                to={`/book/${b.id}`} 
                className="group block rounded-2xl bg-card shadow-md hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
              >
                <div className="flex items-center gap-4 p-6">
                  <div className="w-20 h-24 rounded-lg bg-muted overflow-hidden flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
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
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <span className="text-xs text-muted-foreground">Trending</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
        
        {/* Navigation Arrows */}
        <button
          onClick={() => setIndex(Math.max(0, index - 1))}
          disabled={index === 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 hover:bg-background border border-border shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
          aria-label="Previous books"
        >
          <ChevronLeft className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
        </button>
        
        <button
          onClick={() => setIndex(Math.min(Math.ceil(top.length / 3) - 1, index + 1))}
          disabled={index >= Math.ceil(top.length / 3) - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 hover:bg-background border border-border shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
          aria-label="Next books"
        >
          <ChevronRight className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
        </button>
        
        {/* Navigation Indicators */}
        <div className="flex justify-center mt-6 gap-2">
          {top.slice(0, Math.ceil(top.length / 3)).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setIndex(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                idx === index 
                  ? 'bg-primary scale-125' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};


