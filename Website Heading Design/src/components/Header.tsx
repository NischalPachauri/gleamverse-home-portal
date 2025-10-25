import { Button } from "./ui/button";
import { Moon, Sun, User, Bookmark, Sparkles } from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Header() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className={`relative transition-colors duration-500 overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1595411425732-e69c1abe2763?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdlb21ldHJpYyUyMHBhdHRlcm58ZW58MXx8fHwxNzYxMTg2NjE2fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Abstract background"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-cyan-900/95 via-blue-900/95 to-indigo-900/95' : 'bg-gradient-to-br from-cyan-200/90 via-blue-200/90 to-indigo-200/90'}`}></div>
        {/* Additional fade */}
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-t from-slate-950/50 to-transparent' : 'bg-gradient-to-t from-white/50 to-transparent'}`}></div>
      </div>
      
      {/* Top Navigation */}
      <nav className="relative flex items-center justify-between px-6 py-4">
        <div className="flex-1"></div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            className={`backdrop-blur-md ${isDark ? 'text-cyan-100 hover:bg-white/20 bg-white/10 border border-cyan-400/30' : 'text-blue-900 hover:bg-white/60 bg-white/40 border border-blue-300/50'} transition-all`}
          >
            <User className="h-4 w-4 mr-2" />
            Login
          </Button>
          
          <Button 
            className={`backdrop-blur-md ${isDark ? 'bg-cyan-500/90 hover:bg-cyan-400 text-slate-900 border border-cyan-400/40' : 'bg-blue-500/90 hover:bg-blue-600 text-white border border-blue-300/50'} shadow-lg transition-all`}
            size="sm"
          >
            <Bookmark className="h-4 w-4 mr-2" />
            Bookmarks
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleTheme}
            className={`rounded-full backdrop-blur-md ${isDark ? 'bg-white/10 hover:bg-white/25 text-yellow-300 border border-cyan-400/30' : 'bg-white/40 hover:bg-white/60 text-blue-900 border border-blue-300/50'} transition-all`}
          >
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
      </nav>

      {/* Hero Section - Reduced Height */}
      <div className="relative flex flex-col items-center justify-center px-6 py-12 md:py-16">
        {/* Randomize Button - Above GleamVerse with Sparkles Icon */}
        <button 
          className={`mb-10 p-6 rounded-full backdrop-blur-xl transition-all hover:scale-110 shadow-2xl ${isDark ? 'bg-cyan-500/30 hover:bg-cyan-400/40 border-2 border-cyan-400/50' : 'bg-white/40 hover:bg-white/60 border-2 border-blue-400/50'}`}
        >
          <Sparkles className={`h-6 w-6 ${isDark ? 'text-cyan-300' : 'text-blue-600'}`} />
        </button>

        {/* Main Heading - Gradient Text */}
        <h1 className={`mb-4 text-center text-6xl md:text-7xl bg-gradient-to-r ${isDark ? 'from-cyan-300 via-blue-300 to-indigo-300' : 'from-cyan-600 via-blue-600 to-indigo-600'} bg-clip-text text-transparent drop-shadow-2xl`}>
          GleamVerse
        </h1>
        
        <h2 className={`mb-5 text-center ${isDark ? 'text-cyan-200' : 'text-blue-800'} drop-shadow-lg`}>
          Where Learning Never Stops
        </h2>
        
        <p className={`max-w-2xl text-center mb-8 ${isDark ? 'text-blue-100' : 'text-blue-700'} drop-shadow-md`}>
          Explore a vibrant collection with a calmer, modern gradient theme. Free access to thousands of books - read online or download for offline reading.
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-2xl">
          <div className={`flex items-center gap-3 rounded-full px-6 py-4 backdrop-blur-xl shadow-2xl border ${isDark ? 'bg-slate-900/50 border-cyan-400/40' : 'bg-white/60 border-blue-300/60'}`}>
            <svg 
              className={`h-5 w-5 ${isDark ? 'text-cyan-300' : 'text-blue-600'}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search by title, author, or genre..."
              className={`flex-1 bg-transparent outline-none ${isDark ? 'text-white placeholder:text-cyan-200/50' : 'text-blue-900 placeholder:text-blue-600/60'}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}