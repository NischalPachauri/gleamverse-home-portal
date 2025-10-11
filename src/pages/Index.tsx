import { useState, useMemo } from "react";
import { BookCard } from "@/components/BookCard";
import { books } from "@/data/books";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/hero-library.jpg";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(books.map(book => book.genre)));
    return ["All", ...uniqueCategories.sort()];
  }, []);

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || book.genre === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative h-[450px] overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
        </div>
        <div className="relative h-full container mx-auto px-4 flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6 animate-fade-in">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white animate-fade-in [animation-delay:100ms]">
            Public Library
          </h1>
          <p className="text-2xl md:text-3xl font-semibold text-white/95 mb-2 animate-fade-in [animation-delay:200ms]">
            Where Learning Never Stops
          </p>
          <p className="text-lg text-white/80 max-w-2xl animate-fade-in [animation-delay:300ms]">
            Explore our vibrant collection of books, all free to read and download
          </p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="container mx-auto px-4 -mt-10 relative z-10 mb-12">
        <div className="max-w-3xl mx-auto">
          <div className="relative mb-6">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title, author, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 h-16 text-lg shadow-2xl border-0 bg-card rounded-2xl"
            />
          </div>
          
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <main className="container mx-auto px-4 pb-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {searchQuery ? "Search Results" : "Browse Collection"}
          </h2>
          <p className="text-muted-foreground">
            {filteredBooks.length} {filteredBooks.length === 1 ? "book" : "books"} available
          </p>
        </div>

        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">
              No books found matching "{searchQuery}"
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-lg font-semibold text-primary mb-2">Where Learning Never Stops</p>
          <p className="text-muted-foreground">Free Public Access Library • All books available for reading and download</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
