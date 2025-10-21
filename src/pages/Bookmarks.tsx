import { useMemo } from "react";
import { Link } from "react-router-dom";
import { books } from "@/data/books";
import { Card } from "@/components/ui/card";
// Import cover images used across the app
import hp1 from "@/assets/covers/hp1.jpg";
import hp2 from "@/assets/covers/hp2.jpg";
import hp3 from "@/assets/covers/hp3.jpg";
import hp4 from "@/assets/covers/hp4.jpg";
import hp5 from "@/assets/covers/hp5.jpg";
import hp6 from "@/assets/covers/hp6.jpg";
import hp7 from "@/assets/covers/hp7.jpg";
import hp8 from "@/assets/covers/hp8.jpg";

const coverImages: Record<string, string> = { hp1, hp2, hp3, hp4, hp5, hp6, hp7, hp8 };

const groupOrder = ["Planning to read", "Reading", "On hold", "Completed"] as const;

export default function Bookmarks() {
  const statusMap: Record<string, string> = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("bookStatus") || "{}"); } catch { return {}; }
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, typeof books> = {
      "Planning to read": [],
      "Reading": [],
      "On hold": [],
      "Completed": [],
    };
    for (const b of books) {
      const s = statusMap[b.id];
      if (s && map[s]) map[s] = [...map[s], b];
    }
    return map;
  }, [statusMap]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold mb-6">Bookmarks</h1>
        <p className="text-muted-foreground mb-8">Your books organized by status</p>

        {groupOrder.map((section) => (
          <div key={section} className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">{section}</h2>
            {grouped[section].length === 0 ? (
              <p className="text-sm text-muted-foreground">No books here yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {grouped[section].map((b) => (
                  <Link key={b.id} to={`/book/${b.id}`}>
                    <Card className="p-3 hover:shadow-lg transition-shadow">
                      <div className="aspect-[2/3] w-full bg-muted rounded mb-2 overflow-hidden">
                        <img src={coverImages[b.coverImage] || '/placeholder.svg'} alt={b.title} className="w-full h-full object-cover" onError={(e)=>{ (e.currentTarget as HTMLImageElement).src='/placeholder.svg'; }} />
                      </div>
                      <div className="text-sm font-medium line-clamp-2">{b.title}</div>
                      <div className="text-xs text-muted-foreground">{b.author}</div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


