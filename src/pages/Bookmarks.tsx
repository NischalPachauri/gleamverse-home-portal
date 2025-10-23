import { useMemo } from "react";
import { Link } from "react-router-dom";
import { books } from "@/data/books";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookMarked, BookOpen, Clock, Pause, CheckCircle2, ArrowLeft } from "lucide-react";
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
  "Planning to read": BookOpen,
  "Reading": BookMarked,
  "On hold": Clock,
  "Completed": CheckCircle2,
};

const statusConfig = {
  "Planning to read": {
    icon: BookOpen,
    color: "from-blue-500/30 to-blue-600/20",
    iconColor: "text-blue-300",
    borderColor: "border-blue-400/40",
    glowColor: "shadow-blue-500/20",
    oldColor: "text-blue-500"
  },
  "Reading": {
    icon: BookMarked,
    color: "from-violet-500/30 to-purple-600/20",
    iconColor: "text-violet-300",
    borderColor: "border-violet-400/40",
    glowColor: "shadow-violet-500/20",
    oldColor: "text-primary"
  },
  "On hold": {
    icon: Clock,
    color: "from-orange-500/30 to-amber-600/20",
    iconColor: "text-orange-300",
    borderColor: "border-orange-400/40",
    glowColor: "shadow-orange-500/20",
    oldColor: "text-amber-500"
  },
  "Completed": {
    icon: CheckCircle2,
    color: "from-teal-500/30 to-emerald-600/20",
    iconColor: "text-teal-300",
    borderColor: "border-teal-400/40",
    glowColor: "shadow-teal-500/20",
    oldColor: "text-green-500"
  }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white">
      {/* Animated background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - Aligned to left */}
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Library</span>
          </button>
        </div>
        {/* Title Section - Larger */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-violet-500/30 to-purple-600/20 border border-violet-400/40 rounded-xl backdrop-blur-sm shadow-lg shadow-violet-500/20">
              <BookMarked className="w-9 h-9 text-violet-300" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-violet-200 to-blue-200 bg-clip-text text-transparent mb-1">
                Your Bookmarks
              </h1>
              <p className="text-slate-300">Track and organize your reading journey</p>
            </div>
          </div>
        </div>

        {/* Stats Grid - Smaller boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-16">
          {groupOrder.map((section, index) => {
            const config = statusConfig[section];
            const Icon = config.icon;
            const count = grouped[section].length;
            return (
              <div
                key={section}
                className={`group relative bg-gradient-to-br ${config.color} backdrop-blur-sm border ${config.borderColor} rounded-xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-xl ${config.glowColor} cursor-pointer`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => scrollToSection(section)}
              >
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${config.color} rounded-xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300`} />
                
                <div className="relative flex items-center gap-3">
                  <div className={`p-2 bg-slate-900/60 rounded-lg ${config.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl mb-0.5 text-white">{count}</div>
                    <div className="text-slate-300 text-xs">{section}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content */}
        {totalBooks === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-8">
              {/* Animated rings */}
              <div className="absolute inset-0 bg-violet-500/20 rounded-full animate-ping" />
              <div className="absolute inset-0 bg-violet-500/10 rounded-full animate-pulse" />
              
              {/* Icon container */}
              <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-violet-500/30 rounded-3xl p-8 shadow-2xl shadow-violet-500/20">
                <div className="bg-gradient-to-br from-violet-500/40 to-blue-500/30 rounded-2xl p-6">
                  <BookMarked className="w-16 h-16 text-violet-200" />
                </div>
              </div>
            </div>

            <h2 className="mb-3 text-white">
              No bookmarks yet
            </h2>
            <p className="text-slate-300 mb-8 text-center max-w-md">
              Start adding books to your reading lists
            </p>

            <Button 
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-8 py-6 rounded-xl shadow-lg shadow-violet-500/40 hover:shadow-violet-500/60 transition-all duration-300 border-0"
            >
              Browse Books
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {groupOrder.map((section) => {
              const config = statusConfig[section];
              const Icon = config.icon;
              return (
                <div key={section} id={`section-${section.replace(/\s+/g, '-').toLowerCase()}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color} border ${config.borderColor} backdrop-blur-sm`}>
                      <Icon className={`w-6 h-6 ${config.iconColor}`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{section}</h2>
                      <p className="text-sm text-slate-300">
                        {grouped[section].length} {grouped[section].length === 1 ? 'book' : 'books'}
                      </p>
                    </div>
                  </div>
                  
                  {grouped[section].length === 0 ? (
                    <div className="p-8 text-center bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl">
                      <p className="text-sm text-slate-400">No books in this category yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {grouped[section].map((b) => (
                        <Link key={b.id} to={`/book/${b.id}`} className="group">
                          <div className="overflow-hidden bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-300 hover:-translate-y-1">
                            <div className="aspect-[2/3] w-full bg-slate-900/50 overflow-hidden">
                              <img 
                                src={coverImages[b.coverImage] || '/placeholder.svg'} 
                                alt={b.title} 
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src='/placeholder.svg'; }} 
                              />
                            </div>
                            <div className="p-3">
                              <div className="text-sm font-semibold line-clamp-2 mb-1 text-white group-hover:text-violet-300 transition-colors">{b.title}</div>
                              <div className="text-xs text-slate-400">{b.author}</div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


