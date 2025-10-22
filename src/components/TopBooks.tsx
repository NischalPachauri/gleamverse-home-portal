import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { books as localBooks } from "@/data/books";
import { Link } from "react-router-dom";

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
  const [six, setSix] = useState<BookItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("books")
          .select("id,title,author,cover_url")
          .order("read_count", { ascending: false })
          .limit(24);
        if (!error && data && data.length > 0) {
          // Randomize then take 7
          const shuffled = [...data].sort(() => Math.random() - 0.5);
          setTop(shuffled as BookItem[]);
          return;
        }
      } catch (error) {
        console.error('Error loading top books:', error);
      }
      // fallback to local books - ensure we always have content
      const fallbackBooks = [...localBooks]
        .sort(()=> Math.random() - 0.5)
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

  // Utility to pick 6 random unique books
  const pickSix = (pool: BookItem[]) => {
    if (pool.length === 0) return [] as BookItem[];
    const copy = [...pool];
    const result: BookItem[] = [];
    for (let i = 0; i < 6; i++) {
      if (copy.length === 0) break;
      const idx = Math.floor(Math.random() * copy.length);
      result.push(copy.splice(idx, 1)[0]);
    }
    // If fewer than 6 available, loop from start
    while (result.length < 6 && pool.length > 0) {
      result.push(pool[result.length % pool.length]);
    }
    return result;
  };

  // Choose six once when data arrives
  useEffect(() => {
    if (top.length > 0) {
      setSix(pickSix(top));
    }
  }, [top]);

  const coverSrc = (b: BookItem) => {
    if (b.cover_url) return b.cover_url;
    return coverImages[b.coverImage || ""] || "";
  };

  // Build duplicated list for a seamless continuous loop
  const loopBooks = useMemo(() => {
    if (six.length === 0) return [] as BookItem[];
    return [...six, ...six];
  }, [six]);

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
        .topbooks-loop { display: flex; gap: 12px; width: max-content; animation: topbooks-loop 28s linear infinite; will-change: transform; }
        .topbooks-loop:hover { animation-play-state: paused; }
        @keyframes topbooks-loop { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}} />
    </section>
  );
};


