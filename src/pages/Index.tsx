import { useState, useMemo } from "react";
import { BookCard } from "@/components/BookCard";
import { CategoryCard } from "@/components/CategoryCard";
import { Footer } from "@/components/Footer";
import { ReadingList } from "@/components/ReadingList";
import { books } from "@/data/books";
import { Search, Sparkles, Book, Globe, FlaskConical, Landmark, User, Laptop, Palette, Baby, Moon, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import libraryBg from "@/assets/library-background.jpg";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const categoryData = [
    { name: "Fiction", icon: Book },
    { name: "Non-Fiction", icon: Globe },
    { name: "Science", icon: FlaskConical },
    { name: "History", icon: Landmark },
    { name: "Biography", icon: User },
    { name: "Technology", icon: Laptop },
    { name: "Art & Design", icon: Palette },
    { name: "Children's", icon: Baby },
  ];

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

  const getRandomBook = () => {
    const randomBook = books[Math.floor(Math.random() * books.length)];
    toast.success(`How about "${randomBook.title}"?`, {
      description: `by ${randomBook.author}`,
      duration: 4000,
    });
    navigate(`/book/${randomBook.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={toggleTheme}
          size="lg"
          className="rounded-full w-14 h-14 shadow-2xl bg-gradient-to-br from-primary to-secondary hover:scale-110 transition-all duration-300"
        >
          {theme === "dark" ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </Button>
      </div>

      {/* Hero Section with Library Background */}
      <header className="relative h-[500px] overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${libraryBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-background"></div>
        </div>
        
        <div className="relative h-full container mx-auto px-4 flex flex-col items-center justify-center text-center">
          <Button
            onClick={getRandomBook}
            size="lg"
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6 animate-fade-in hover:scale-110 transition-all duration-300 hover:bg-white/30"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </Button>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white animate-fade-in [animation-delay:100ms] drop-shadow-2xl">
            Public Library
          </h1>
          <p className="text-2xl md:text-3xl font-semibold text-white/95 mb-2 animate-fade-in [animation-delay:200ms] drop-shadow-lg">
            Where Learning Never Stops
          </p>
          <p className="text-lg text-white/80 max-w-2xl animate-fade-in [animation-delay:300ms] drop-shadow-md">
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

      {/* Browse Categories Section */}
      <section id="categories" className="container mx-auto px-4 py-16">
        <h2 className="text-5xl font-bold text-center mb-4 text-primary animate-fade-in">
          Browse Categories
        </h2>
        <div className="h-1 w-24 bg-gradient-to-r from-primary to-secondary mx-auto mb-12 rounded-full"></div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categoryData.map((cat, idx) => (
            <CategoryCard
              key={cat.name}
              icon={cat.icon}
              title={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              isActive={selectedCategory === cat.name}
            />
          ))}
        </div>
      </section>

      {/* Your Library Section */}
      <ReadingList />

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

      {/* Upload Section */}
      <section id="upload" className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Upload Your Books</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Want to add your own PDFs to the library? Access the Cloud backend to upload books that will automatically appear on this website.
          </p>
          <p className="text-sm text-muted-foreground">
            Navigate to Settings → Backend to manage your book collection
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
