import { useParams, Link, useNavigate } from 'react-router-dom';
import { books as bookList } from '@/data/books';
import { PDFReader } from '@/components/PDFReader';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getBookCover } from '@/utils/bookCoverMapping';

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
      <main className="flex-1 overflow-hidden">
        <PDFReader 
          pdfPath={book.pdfPath} 
          title={book.title} 
          author={book.author}
          bookCoverSrc={getBookCover(book.title) || '/placeholder.svg'}
          onBack={() => { navigate('/'); }}
        />
      </main>
    </div>
  );
};

export default BookDetail;
