import { useState } from "react";
import { Search, X, Sun, Bookmark } from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Checkbox } from "./components/ui/checkbox";

const searchResults = [
  {
    id: 1,
    title: "Harry Potter and the Philosopher's Stone",
    author: "potter-4",
    genre: "philosopher-stone",
    category: "Fantasy",
  },
  {
    id: 2,
    title: "Harry Potter and the Chamber of Secrets",
    author: "potter-5",
    genre: "chamber-of-secrets",
    category: "Fantasy",
  },
  {
    id: 3,
    title: "Harry Potter and the Prisoner of Azkaban",
    author: "potter-3",
    genre: "prisoner-of-azkaban",
    category: "Fantasy",
  },
  {
    id: 4,
    title: "Harry Potter and the Goblet of Fire",
    author: "potter-4",
    genre: "goblet-of-fire",
    category: "Fantasy",
  },
  {
    id: 5,
    title: "Harry Potter and the Order of the Phoenix",
    author: "potter-5",
    genre: "order-of-phoenix",
    category: "Fantasy",
  },
  {
    id: 6,
    title: "Harry Potter and the Half-Blood Prince",
    author: "potter-6",
    genre: "half-blood-prince",
    category: "Fantasy",
  },
  {
    id: 7,
    title: "Harry Potter and the Deathly Hallows",
    author: "potter-7",
    genre: "deathly-hallows",
    category: "Fantasy",
  },
];

const hotReads = [
  {
    id: 1,
    status: "NOW READING",
    title: "Harry Potter and the Deathly...",
    author: "by potter-7",
    details: "deathly-hallows",
    bgColor: "bg-pink-500",
  },
  {
    id: 2,
    status: "NOW READING",
    title: "Harry Potter and the Cursed Child",
    author: "by potter-8",
    details: "cursed-child",
    bgColor: "bg-blue-600",
  },
  {
    id: 3,
    status: "NOW READING",
    title: "Harry Potter and the Philosopher's...",
    author: "by potter-1",
    details: "philosopher-stone",
    bgColor: "bg-pink-600",
  },
  {
    id: 4,
    status: "NOW READING",
    title: "Harry Potter and the Chamber of...",
    author: "by potter-2",
    details: "chamber-of-secrets",
    bgColor: "bg-purple-500",
  },
  {
    id: 5,
    status: "NOW READING",
    title: "Harry Potter and the Prisoner of...",
    author: "by potter-3",
    details: "prisoner-of-azkaban",
    bgColor: "bg-orange-500",
  },
  {
    id: 6,
    status: "NOW READING",
    title: "Harry Potter and the Goblet of Fire",
    author: "by potter-4",
    details: "goblet-of-fire",
    bgColor: "bg-slate-700",
  },
  {
    id: 7,
    status: "NOW READING",
    title: "Harry Potter and the Order of the Phoenix",
    author: "by potter-5",
    details: "order-of-phoenix",
    bgColor: "bg-teal-500",
  },
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState("harry");

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      {/* Header */}
      <header className="flex items-center justify-end gap-3 p-4">
        <Button variant="outline" className="bg-transparent border-slate-600 text-white hover:bg-slate-800">
          Sign In
        </Button>
        <Button className="bg-cyan-400 text-slate-900 hover:bg-cyan-300">
          <Bookmark className="w-4 h-4 mr-2" />
          Bookmarks
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full bg-orange-600 hover:bg-orange-500">
          <Sun className="w-5 h-5" />
        </Button>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for books..."
              className="w-full bg-[#0f1f35] border-slate-700 pl-12 pr-12 py-6 text-white placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Search Results - Inline */}
          {searchQuery && (
            <div className="absolute top-full mt-2 w-full bg-[#0f1f35] border border-slate-700 rounded-lg shadow-2xl z-50 max-h-[400px] overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm">Search Results ({searchResults.length})</h3>
                  <button
                    onClick={handleClearSearch}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-start gap-3 p-2 hover:bg-slate-800/50 rounded cursor-pointer"
                    >
                      <Checkbox className="mt-1 border-slate-600" />
                      <div className="flex-1">
                        <h4 className="text-white mb-1">{result.title}</h4>
                        <p className="text-sm text-cyan-400">
                          {result.author} • {result.genre} • {result.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hot Reads Right Now */}
        <div className="mt-32">
          <h2 className="mb-6">Hot Reads Right Now</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {hotReads.map((book) => (
              <div
                key={book.id}
                className={`${book.bgColor} rounded-xl p-6 min-w-[200px] flex-shrink-0`}
              >
                <div className="mb-4">
                  <span className="text-xs opacity-80">{book.status}</span>
                </div>
                <h3 className="mb-2">{book.title}</h3>
                <p className="text-sm opacity-90 mb-1">{book.author}</p>
                <p className="text-xs opacity-75">{book.details}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Search Results Heading at Bottom */}
        <div className="mt-12 pb-8">
          <h2>Search Results</h2>
        </div>
      </div>
    </div>
  );
}
