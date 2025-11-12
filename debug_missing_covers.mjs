// Debug script to find missing book cover mappings
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the bookCoverMapping.ts file
const mappingContent = fs.readFileSync('src/utils/bookCoverMapping.ts', 'utf8');
const booksContent = fs.readFileSync('src/data/books.ts', 'utf8');

// Extract mappings
const mappingMatches = mappingContent.match(/"([^"]+)":\s*"\/BookCoversNew\/[^"]+"/g) || [];
const mappings = mappingMatches.map(match => {
  const titleMatch = match.match(/"([^"]+)":/);
  return titleMatch ? titleMatch[1] : '';
}).filter(Boolean);

// Extract book titles
const bookMatches = booksContent.match(/title:\s*"([^"]+)"/g) || [];
const bookTitles = bookMatches.map(match => {
  const titleMatch = match.match(/title:\s*"([^"]+)"/);
  return titleMatch ? titleMatch[1] : '';
}).filter(Boolean);

console.log(`Total books: ${bookTitles.length}`);
console.log(`Total mappings: ${mappings.length}`);
console.log(`Missing mappings: ${bookTitles.length - mappings.length}`);

// Find books without mappings
const missingBooks = bookTitles.filter(title => !mappings.includes(title));
console.log('\nBooks without mappings:');
missingBooks.forEach((book, index) => {
  console.log(`${index + 1}. ${book}`);
});

// Check if mapping function exists
const hasGetBookCoverFunction = mappingContent.includes('export function getBookCover');
console.log(`\nHas getBookCover function: ${hasGetBookCoverFunction}`);

// Check available image files
const imageDir = 'public/BookCoversNew';
const imageFiles = fs.readdirSync(imageDir).filter(file => 
  file.match(/\.(jpg|jpeg|png|gif)$/i)
);
console.log(`\nAvailable image files: ${imageFiles.length}`);

// Find potential matches for missing books
console.log('\nPotential image matches for missing books:');
missingBooks.slice(0, 10).forEach(bookTitle => {
  const potentialMatches = imageFiles.filter(file => {
    const fileName = path.parse(file).name.toLowerCase();
    const bookName = bookTitle.toLowerCase();
    return fileName.includes(bookName) || bookName.includes(fileName) || 
           fileName.split(' ').some(word => bookName.includes(word));
  });
  
  if (potentialMatches.length > 0) {
    console.log(`\n"${bookTitle}" could match:`);
    potentialMatches.forEach(match => console.log(`  - ${match}`));
  }
});