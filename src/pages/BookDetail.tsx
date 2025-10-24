import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFReader } from "@/components/PDFReader";
import { books } from "@/data/books";
import { getBookCover } from "@/utils/bookCoverGenerator";

// Import Harry Potter covers
import hp1 from "@/assets/covers/hp1.jpg";
import hp2 from "@/assets/covers/hp2.jpg";
import hp3 from "@/assets/covers/hp3.jpg";
import hp4 from "@/assets/covers/hp4.jpg";
import hp5 from "@/assets/covers/hp5.jpg";
import hp6 from "@/assets/covers/hp6.jpg";
import hp7 from "@/assets/covers/hp7.jpg";
import hp8 from "@/assets/covers/hp8.jpg";

const harryPotterCovers: Record<string, string> = {
  hp1, hp2, hp3, hp4, hp5, hp6, hp7, hp8
};

// Function to get cover image path
const getCoverImage = (book: typeof books[0]) => {
  // For Harry Potter covers, use the imported images
  if (harryPotterCovers[book.coverImage]) {
    return harryPotterCovers[book.coverImage];
  }
  
  // For all other books, generate beautiful covers
  return getBookCover(book);
};

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const book = books.find((b) => b.id === id);

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Book Not Found</h1>
          <Link to="/">
            <Button>Return to Library</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
          </Link>
          <div className="flex items-center gap-4 flex-1">
            <img
              src={getCoverImage(book)}
              alt={book.title}
              className="h-16 w-auto rounded shadow-md"
            />
            <div>
              <h1 className="text-xl font-bold text-foreground">{book.title}</h1>
              <p className="text-sm text-muted-foreground">{book.author}</p>
            </div>
          </div>
        </div>
      </header>

      {/* PDF Reader */}
      <main className="flex-1 overflow-hidden">
        <PDFReader pdfPath={book.pdfPath} title={book.title} />
      </main>
    </div>
  );
};

export default BookDetail;
