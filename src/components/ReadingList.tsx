import { useState, useEffect, useCallback } from "react";
import { BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { books } from "@/data/books";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
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

export const ReadingList = () => {
  const [readingList, setReadingList] = useState<string[]>([]);
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.2 });
  const [sessionId] = useState(() => {
    let id = localStorage.getItem("sessionId");
    if (!id) {
      id = Math.random().toString(36).substring(7);
      localStorage.setItem("sessionId", id);
    }
    return id;
  });

  const loadReadingList = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("user_library")
        .select("book_id")
        .eq("user_session_id", sessionId);

      if (error) {
        console.error("Error loading reading list:", error);
        setReadingList([]);
        return;
      }

      setReadingList(data?.map((item) => item.book_id) || []);
    } catch (error) {
      console.error("Error loading reading list:", error);
      setReadingList([]);
    }
  }, [sessionId]);

  useEffect(() => {
    loadReadingList();
  }, [loadReadingList]);

  const removeFromList = async (bookId: string) => {
    const { error } = await supabase
      .from("user_library")
      .delete()
      .eq("book_id", bookId)
      .eq("user_session_id", sessionId);

    if (error) {
      toast.error("Failed to remove book");
      return;
    }

    toast.success("Book removed from your library");
    loadReadingList();
  };

  const libraryBooks = books.filter((book) => readingList.includes(book.id));
  const statusMap: Record<string,string> = (() => {
    try { return JSON.parse(localStorage.getItem('bookStatus') || '{}'); } catch { return {}; }
  })();

  if (libraryBooks.length === 0) {
    return (
      <section ref={sectionRef} className={`py-12 bg-muted/30 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-8">
            <BookOpen className="w-8 h-8 text-primary" />
            <h2 className="text-4xl font-bold text-foreground">Your Library</h2>
          </div>
          <p className="text-center text-muted-foreground">
            Your library is empty. Start adding books to read later!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className={`py-12 bg-muted/30 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-8">
          <BookOpen className="w-8 h-8 text-primary" />
          <h2 className="text-4xl font-bold text-foreground">Your Library</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {libraryBooks.map((book, index) => (
            <div
              key={book.id}
              className={`group relative hover-scale transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Link to={`/book/${book.id}`}>
                <img
                  src={coverImages[book.coverImage] || getBookCover(book)}
                  alt={book.title}
                  className="w-full aspect-[2/3] object-cover rounded-lg shadow-lg transition-transform duration-300"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src=getBookCover(book); }}
                />
              </Link>
              {statusMap[book.id] && (
                <div className="mt-2 text-xs font-medium text-center rounded-full px-2 py-1 bg-primary/10 text-primary">
                  {statusMap[book.id]}
                </div>
              )}
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFromList(book.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
