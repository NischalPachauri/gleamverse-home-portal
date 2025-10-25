import { Search } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onRandomBook: () => void;
}

export function HeroSection({ searchQuery, setSearchQuery, onRandomBook }: HeroSectionProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="relative w-full bg-gradient-to-b from-blue-900 to-blue-700 text-white overflow-hidden">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col items-center justify-center">
        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl font-bold mb-2 text-center">
          GleamVerse
        </h1>
        
        <h2 className="text-xl md:text-2xl mb-6 text-center font-light">
          Where Learning Never Stops
        </h2>
        
        <p className="max-w-2xl text-center mb-10 text-lg text-gray-100">
          Explore a vibrant collection with a calmer, modern gradient theme. Free access to 
          thousands of books - read online or download for offline reading.
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-md">
          <div className="flex items-center rounded-md overflow-hidden bg-white/10 backdrop-blur-sm">
            <input 
              type="text" 
              placeholder="Search by title, author, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent px-4 py-3 outline-none text-white placeholder:text-gray-300"
            />
            <button className="bg-white/20 hover:bg-white/30 px-4 py-3 text-white">
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
