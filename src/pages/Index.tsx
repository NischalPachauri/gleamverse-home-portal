import { useState } from "react";
import { BookCard } from "@/components/BookCard";
import { books } from "@/data/books";
import { Search, Library } from "lucide-react";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/hero-library.jpg";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative h-[400px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-background" />
        </div>
        <div className="relative h-full container mx-auto px-4 flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 backdrop-blur-sm mb-6 animate-fade-in">
            <Library className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white animate-fade-in [animation-delay:100ms]">
            Free Public Library
          </h1>
          <p className="text-xl text-white/90 max-w-2xl animate-fade-in [animation-delay:200ms]">
            Discover, read, and download books from our ever-growing collection
          </p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="container mx-auto px-4 -mt-8 relative z-10 mb-12">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title, author, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg shadow-lg border-2 bg-card"
            />
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
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>Free Public Access Library • All books available for reading and download</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
