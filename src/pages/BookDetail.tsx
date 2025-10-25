import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
// Fixed: Import books and alias it as bookList
import { books as bookList } from '@/data/books';
import { PDFReader } from '@/components/PDFReader';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import supabase from '@/integrations/supabase/client';

// Function to get cover image path
const getCoverImage = (book: typeof bookList[0]) => {
  // For all books, use a placeholder for now
  return '/placeholder.svg';
};

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const book = bookList.find((b) => b.id === id);

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
        <PDFReader pdfPath={book.pdfPath} title={book.title} bookId={book.id} />
      </main>
    </div>
  );
};

export default BookDetail;
