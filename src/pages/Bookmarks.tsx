import { useMemo } from "react";
import { Link } from "react-router-dom";
import { books } from "@/data/books";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookMarked, BookOpen, Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

const statusIcons = {
  "Planning to read": BookMarked,
  "Reading": BookOpen,
  "On hold": Clock,
  "Completed": CheckCircle2,
};

const statusColors = {
  "Planning to read": "text-blue-500",
  "Reading": "text-primary",
  "On hold": "text-amber-500",
  "Completed": "text-green-500",
};

export default function Bookmarks() {
  const navigate = useNavigate();
  const statusMap: Record<string, string> = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("bookStatus") || "{}"); } catch { return {}; }
  }, []);

  const scrollToSection = (section: string) => {
    const id = `section-${section.replace(/\s+/g, '-').toLowerCase()}`;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

  const totalBooks = Object.values(grouped).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-primary/20 via-primary/5 to-background border-b border-border/50 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary-rgb),0.1),transparent_50%)]"></div>
        <div className="container mx-auto px-4 py-12 relative">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="sm"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-md">
              <BookMarked className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Your Bookmarks
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">Track and organize your reading journey</p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {groupOrder.map((section) => {
              const Icon = statusIcons[section];
              const count = grouped[section].length;
              return (
                <Card
                  key={section}
                  className="p-5 bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
                  onClick={() => scrollToSection(section)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToSection(section); } }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm`}>
                      <Icon className={`w-6 h-6 ${statusColors[section]}`} />
                    </div>
                    <div>
                      <p className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">{count}</p>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">{section}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-10">
        {totalBooks === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
              <BookMarked className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No bookmarks yet</h2>
            <p className="text-muted-foreground mb-6">Start adding books to your reading lists</p>
            <Button onClick={() => navigate('/')}>Browse Books</Button>
          </div>
        ) : (
          groupOrder.map((section) => {
            const Icon = statusIcons[section];
            return (
              <div key={section} id={`section-${section.replace(/\s+/g, '-').toLowerCase()}`} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className={`w-6 h-6 ${statusColors[section]}`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{section}</h2>
                    <p className="text-sm text-muted-foreground">
                      {grouped[section].length} {grouped[section].length === 1 ? 'book' : 'books'}
                    </p>
                  </div>
                </div>
                
                {grouped[section].length === 0 ? (
                  <Card className="p-8 text-center bg-muted/30 border-dashed">
                    <p className="text-sm text-muted-foreground">No books in this category yet</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {grouped[section].map((b) => (
                      <Link key={b.id} to={`/book/${b.id}`} className="group">
                        <Card className="overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
                          <div className="aspect-[2/3] w-full bg-muted overflow-hidden">
                            <img 
                              src={coverImages[b.coverImage] || '/placeholder.svg'} 
                              alt={b.title} 
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src='/placeholder.svg'; }} 
                            />
                          </div>
                          <div className="p-3">
                            <div className="text-sm font-semibold line-clamp-2 mb-1 group-hover:text-primary transition-colors">{b.title}</div>
                            <div className="text-xs text-muted-foreground">{b.author}</div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}


