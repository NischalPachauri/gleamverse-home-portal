export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  pdfPath: string;
  year: number;
  pages: string;
  genre: string;
}

// Import all books from the generated file
import { allBooks } from './all-books';

export const books: Book[] = allBooks;