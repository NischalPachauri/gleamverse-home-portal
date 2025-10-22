import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to get the correct cover image for Harry Potter books
function getHarryPotterCover(title) {
  if (title.includes("Philosopher's Stone")) return "hp1";
  if (title.includes("Chamber of Secrets")) return "hp2";
  if (title.includes("Prisoner of Azkaban")) return "hp3";
  if (title.includes("Goblet of Fire")) return "hp4";
  if (title.includes("Order of the Phoenix")) return "hp5";
  if (title.includes("Half-Blood Prince")) return "hp6";
  if (title.includes("Deathly Hallows")) return "hp7";
  if (title.includes("Cursed Child")) return "hp8";
  return "placeholder";
}

// Read the current all-books.ts file
const booksPath = path.join(__dirname, '..', 'src', 'data', 'all-books.ts');
const booksContent = fs.readFileSync(booksPath, 'utf8');

// Extract books array from the file
const booksMatch = booksContent.match(/export const allBooks: Book\[\] = (\[[\s\S]*?\]);/);
if (!booksMatch) {
  console.error('Could not find books array in all-books.ts');
  process.exit(1);
}

const books = JSON.parse(booksMatch[1]);

// Update Harry Potter books with correct cover images
const updatedBooks = books.map(book => {
  if (book.title.toLowerCase().includes('harry potter')) {
    return {
      ...book,
      coverImage: getHarryPotterCover(book.title)
    };
  }
  return book;
});

// Update the all-books.ts file
const updatedContent = `export interface Book {
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

// Function to get the correct cover image for Harry Potter books
const getHarryPotterCover = (title: string) => {
  if (title.includes("Philosopher's Stone")) return "hp1";
  if (title.includes("Chamber of Secrets")) return "hp2";
  if (title.includes("Prisoner of Azkaban")) return "hp3";
  if (title.includes("Goblet of Fire")) return "hp4";
  if (title.includes("Order of the Phoenix")) return "hp5";
  if (title.includes("Half-Blood Prince")) return "hp6";
  if (title.includes("Deathly Hallows")) return "hp7";
  if (title.includes("Cursed Child")) return "hp8";
  return "placeholder";
};

export const allBooks: Book[] = ${JSON.stringify(updatedBooks, null, 2)};
`;

fs.writeFileSync(booksPath, updatedContent);

console.log('Updated Harry Potter book covers!');
console.log('Harry Potter books with covers:');
updatedBooks.filter(book => book.title.toLowerCase().includes('harry potter')).forEach(book => {
  console.log(`- ${book.title} -> ${book.coverImage}`);
});
