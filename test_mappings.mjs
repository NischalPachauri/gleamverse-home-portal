// Test script to verify book cover mappings
import { getBookCover } from './src/utils/bookCoverMapping.ts';

// Test a few book titles from the books.ts file
const testTitles = [
  "10 Books in 1",
  "10 Ways to Write More Effective Ads", 
  "100 years of the best American short stories",
  "2 States The story of my Marriage",
  "Harry Potter and the Chamber of Secrets",
  "The Alchemist",
  "Atomic Habits",
  "A book that doesn't exist"
];

console.log('Testing book cover mappings:');
console.log('=====================================');

testTitles.forEach(title => {
  const coverPath = getBookCover(title);
  console.log(`"${title}" -> ${coverPath}`);
});

console.log('\nTesting mapping completeness:');
console.log('=====================================');

// Read the books data
import fs from 'fs';
const booksContent = fs.readFileSync('src/data/books.ts', 'utf8');
const bookMatches = booksContent.match(/title:\s*"([^"]+)"/g) || [];
const bookTitles = bookMatches.map(match => {
  const titleMatch = match.match(/title:\s*"([^"]+)"/);
  return titleMatch ? titleMatch[1] : '';
}).filter(Boolean);

let mappedCount = 0;
let unmappedCount = 0;
const unmappedBooks = [];

bookTitles.forEach(title => {
  const coverPath = getBookCover(title);
  if (coverPath === "/BookCoversNew/default-book-cover.png") {
    unmappedCount++;
    unmappedBooks.push(title);
  } else {
    mappedCount++;
  }
});

console.log(`Total books: ${bookTitles.length}`);
console.log(`Mapped books: ${mappedCount}`);
console.log(`Unmapped books: ${unmappedCount}`);
console.log(`Mapping coverage: ${((mappedCount / bookTitles.length) * 100).toFixed(1)}%`);

if (unmappedBooks.length > 0) {
  console.log('\nUnmapped books:');
  unmappedBooks.slice(0, 10).forEach(title => console.log(`- ${title}`));
  if (unmappedBooks.length > 10) {
    console.log(`... and ${unmappedBooks.length - 10} more`);
  }
}