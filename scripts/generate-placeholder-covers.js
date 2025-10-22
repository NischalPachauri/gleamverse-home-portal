import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to generate a simple SVG cover
function generateSVGCover(title, author, genre) {
  const colors = {
    'Fantasy': '#8B5CF6',
    'Romance': '#EC4899',
    'Fiction': '#3B82F6',
    'Mystery': '#EF4444',
    'Biography': '#10B981',
    'Philosophy': '#F59E0B',
    'Children\'s': '#06B6D4',
    'Non-Fiction': '#84CC16'
  };
  
  const color = colors[genre] || '#6B7280';
  
  return `<svg width="200" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="300" fill="${color}" rx="8"/>
    <rect x="10" y="10" width="180" height="280" fill="white" rx="4"/>
    <text x="100" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#1F2937">${title.substring(0, 20)}${title.length > 20 ? '...' : ''}</text>
    <text x="100" y="80" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#6B7280">by ${author.substring(0, 25)}${author.length > 25 ? '...' : ''}</text>
    <rect x="20" y="100" width="160" height="2" fill="${color}"/>
    <text x="100" y="130" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="${color}">${genre}</text>
    <circle cx="100" cy="200" r="30" fill="${color}" opacity="0.2"/>
    <text x="100" y="210" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="${color}">📚</text>
  </svg>`;
}

// Function to update book data with cover filenames
function updateBookDataWithCovers() {
  const booksPath = path.join(__dirname, '..', 'src', 'data', 'all-books.ts');
  const booksContent = fs.readFileSync(booksPath, 'utf8');
  
  // Extract books array from the file
  const booksMatch = booksContent.match(/export const allBooks: Book\[\] = (\[[\s\S]*?\]);/);
  if (!booksMatch) {
    console.error('Could not find books array in all-books.ts');
    return;
  }
  
  const books = JSON.parse(booksMatch[1]);
  console.log(`Processing ${books.length} books...`);
  
  // Create covers directory if it doesn't exist
  const coversDir = path.join(__dirname, '..', 'src', 'assets', 'covers');
  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
  }
  
  // Generate covers and update book data
  const updatedBooks = books.map((book, index) => {
    const coverFilename = `book-${index + 1}.svg`;
    const svgContent = generateSVGCover(book.title, book.author, book.genre);
    
    // Save SVG file
    const filepath = path.join(coversDir, coverFilename);
    fs.writeFileSync(filepath, svgContent);
    
    return {
      ...book,
      coverImage: `book-${index + 1}`
    };
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

export const allBooks: Book[] = ${JSON.stringify(updatedBooks, null, 2)};
`;
  
  fs.writeFileSync(booksPath, updatedContent);
  
  console.log(`Generated ${updatedBooks.length} book covers!`);
  console.log(`Covers saved to: ${coversDir}`);
}

// Run the script
updateBookDataWithCovers();
