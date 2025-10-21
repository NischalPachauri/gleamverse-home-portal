import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { books as localBooks } from "@/data/books";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

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
  const [loading, setLoading] = useState(true);
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.2 });

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("books")
          .select("id,title,author,cover_url")
          .order("read_count", { ascending: false })
          .limit(7);
        if (!error && data && data.length > 0) {
          // Randomize then take 7
          const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0,7);
          setTop(shuffled as BookItem[]);
          return;
        }
      } catch (error) {
        console.error('Error loading top books:', error);
      }
      // fallback to local books - ensure we always have content
      const fallbackBooks = [...localBooks]
        .sort(()=> Math.random() - 0.5)
        .slice(0, 7)
        .map((b: { id: string; title: string; author: string; coverImage: string }) => ({ 
        id: b.id, 
        title: b.title, 
        author: b.author, 
        coverImage: b.coverImage 
      }));
      setTop(fallbackBooks);
      setLoading(false);
    };
    load();
  }, []);

  // No timer-based scrolling; animation is pure CSS marquee

  // Build a 7-item list, looping if needed
  const sevenBooks = useMemo(() => {
    if (top.length === 0) return [] as BookItem[];
    const base = top.length >= 7 ? top.slice(0,7) : Array.from({length:7}, (_,i)=> top[i % top.length]);
    return base;
  }, [top]);

  const coverSrc = (b: BookItem) => {
    if (b.cover_url) return b.cover_url;
    return coverImages[b.coverImage || ""] || "";
  };

  // Duplicate list for seamless marquee (hooks must be before any return)
  const marqueeBooks = useMemo(() => {
    if (sevenBooks.length === 0) return [] as BookItem[];
    return [...sevenBooks, ...sevenBooks];
  }, [sevenBooks]);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-center mb-4 text-primary">Top Books</h2>
        <p className="text-center text-muted-foreground mb-8">Most read books right now</p>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className={`container mx-auto px-4 py-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <h2 className="text-4xl font-bold text-center mb-4 text-primary">Top Books</h2>
      <p className="text-center text-muted-foreground mb-8">Most read books right now</p>
      <div className="relative overflow-hidden rounded-2xl">
        <div className="topbooks-marquee">
          {marqueeBooks.map((b, idx) => (
            <div key={`${b.id}-${idx}`} className="px-3">
              <Link
                to={`/book/${b.id}`}
                className="group block rounded-2xl bg-card shadow-md hover:shadow-xl transition-all duration-500 w-[320px]"
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
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Local styles for continuous marquee */}
      <style dangerouslySetInnerHTML={{__html: `
        .topbooks-marquee {
          display: flex;
          gap: 12px;
          width: max-content;
          animation: topbooks-marquee 30s linear infinite;
          will-change: transform;
        }
        .topbooks-marquee:hover { animation-play-state: paused; }
        @keyframes topbooks-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </section>
  );
};


