// Book Cover Processing Script
// This script processes all book covers in the BookCoversNew directory
// and associates them with corresponding books based on matching file names.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const BOOK_COVERS_DIR = path.join(__dirname, 'public', 'BookCoversNew');
const BOOKS_DIR = path.join(__dirname, 'public', 'books');
const OUTPUT_FILE = path.join(__dirname, 'src', 'utils', 'generatedBookCoverMap.ts');
const DISCREPANCIES_FILE = path.join(__dirname, 'book_cover_matching_discrepancies.md');

// Function to normalize title for comparison
function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\b(the|a|an|and|or|but|in|on|at|by|for|with|about)\b/g, '') // Remove common words
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim();
}

// Main function to process book covers
async function processBookCovers() {
  console.log('Starting book cover processing...');
  
  // Get all book covers
  const coverFiles = fs.readdirSync(BOOK_COVERS_DIR);
  console.log(`Found ${coverFiles.length} book covers in BookCoversNew directory`);
  
  // Get all books
  const bookFiles = fs.readdirSync(BOOKS_DIR);
  console.log(`Found ${bookFiles.length} books in books directory`);
  
  // Extract book titles from filenames
  const bookTitles = bookFiles.map(filename => {
    // Remove file extension and replace underscores with spaces
    const title = path.basename(filename, path.extname(filename))
      .replace(/_/g, ' ')
      .replace(/-/g, ' ');
    return { filename, title };
  });
  
  // Extract cover titles from filenames
  const coverTitles = coverFiles.map(filename => {
    // Remove file extension
    const title = path.basename(filename, path.extname(filename));
    return { filename, title };
  });
  
  // Create mapping for normalized titles to original titles
  const normalizedBookTitles = {};
  bookTitles.forEach(({ filename, title }) => {
    const normalized = normalizeTitle(title);
    normalizedBookTitles[normalized] = { filename, title };
  });
  
  // Create mapping for normalized cover titles to filenames
  const normalizedCoverTitles = {};
  coverTitles.forEach(({ filename, title }) => {
    const normalized = normalizeTitle(title);
    normalizedCoverTitles[normalized] = { filename, title };
  });
  
  // Match books with covers
  const bookCoverMap = {};
  const usedCovers = new Set();
  const discrepancies = [];
  
  // First pass: exact matches
  Object.entries(normalizedBookTitles).forEach(([normalizedBookTitle, bookInfo]) => {
    if (normalizedCoverTitles[normalizedBookTitle] && !usedCovers.has(normalizedBookTitle)) {
      const coverFilename = normalizedCoverTitles[normalizedBookTitle].filename;
      bookCoverMap[bookInfo.title] = `/BookCoversNew/${coverFilename}`;
      usedCovers.add(normalizedBookTitle);
    }
  });
  
  // Second pass: partial matches for remaining books
  Object.entries(normalizedBookTitles).forEach(([normalizedBookTitle, bookInfo]) => {
    if (bookCoverMap[bookInfo.title]) return; // Skip if already matched
    
    // Find best partial match
    let bestMatch = null;
    let bestMatchScore = 0;
    
    Object.entries(normalizedCoverTitles).forEach(([normalizedCoverTitle, coverInfo]) => {
      if (usedCovers.has(normalizedCoverTitle)) return; // Skip if already used
      
      // Calculate similarity score (simple contains check)
      let score = 0;
      if (normalizedBookTitle.includes(normalizedCoverTitle)) {
        score = normalizedCoverTitle.length;
      } else if (normalizedCoverTitle.includes(normalizedBookTitle)) {
        score = normalizedBookTitle.length;
      }
      
      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatch = coverInfo;
      }
    });
    
    if (bestMatch) {
      const normalizedCoverTitle = normalizeTitle(bestMatch.title);
      bookCoverMap[bookInfo.title] = `/BookCoversNew/${bestMatch.filename}`;
      usedCovers.add(normalizedCoverTitle);
      
      // Record this as a partial match discrepancy
      discrepancies.push({
        book: bookInfo.title,
        cover: bestMatch.title,
        type: 'partial_match'
      });
    }
  });
  
  // Third pass: assign remaining covers to remaining books
  const remainingBooks = bookTitles
    .filter(({ title }) => !bookCoverMap[title])
    .map(({ title }) => title);
  
  const remainingCovers = coverTitles
    .filter(({ title }) => !usedCovers.has(normalizeTitle(title)))
    .map(({ filename, title }) => ({ filename, title }));
  
  console.log(`Remaining unmatched books: ${remainingBooks.length}`);
  console.log(`Remaining unused covers: ${remainingCovers.length}`);
  
  // Assign remaining covers to remaining books
  remainingBooks.forEach((bookTitle, index) => {
    if (index < remainingCovers.length) {
      const cover = remainingCovers[index];
      bookCoverMap[bookTitle] = `/BookCoversNew/${cover.filename}`;
      
      // Record this as a forced match discrepancy
      discrepancies.push({
        book: bookTitle,
        cover: cover.title,
        type: 'forced_match'
      });
    }
  });
  
  // Generate TypeScript file with the mapping
  const tsContent = `// Auto-generated book cover mapping
// Generated on: ${new Date().toISOString()}
// Total covers mapped: ${Object.keys(bookCoverMap).length}

/**
 * Map of book titles to cover image paths
 */
export const bookCoverMap: Record<string, string> = ${JSON.stringify(bookCoverMap, null, 2)};

/**
 * Gets the cover image path for a book title
 * @param title The book title to find a cover for
 * @returns The path to the cover image or a default image if not found
 */
export function getBookCover(title: string): string {
  if (!title) return '/placeholder.svg';
  
  // Try to find an exact match
  if (bookCoverMap[title]) {
    return bookCoverMap[title];
  }
  
  // Try case-insensitive match
  const lowerTitle = title.toLowerCase();
  const key = Object.keys(bookCoverMap).find(k => 
    k.toLowerCase() === lowerTitle
  );
  
  if (key) {
    return bookCoverMap[key];
  }
  
  // Default to placeholder
  return '/placeholder.svg';
}
`;

  // Write the TypeScript file
  fs.writeFileSync(OUTPUT_FILE, tsContent);
  console.log(`Generated mapping file at ${OUTPUT_FILE}`);
  
  // Generate discrepancies report
  const discrepanciesContent = `# Book Cover Matching Discrepancies

Generated on: ${new Date().toISOString()}

## Summary
- Total books: ${bookTitles.length}
- Total covers: ${coverFiles.length}
- Exact matches: ${Object.keys(bookCoverMap).length - discrepancies.length}
- Partial matches: ${discrepancies.filter(d => d.type === 'partial_match').length}
- Forced matches: ${discrepancies.filter(d => d.type === 'forced_match').length}

## Discrepancies

### Partial Matches
${discrepancies
  .filter(d => d.type === 'partial_match')
  .map(d => `- Book: "${d.book}" → Cover: "${d.cover}"`)
  .join('\n')}

### Forced Matches
${discrepancies
  .filter(d => d.type === 'forced_match')
  .map(d => `- Book: "${d.book}" → Cover: "${d.cover}"`)
  .join('\n')}
`;

  // Write the discrepancies file
  fs.writeFileSync(DISCREPANCIES_FILE, discrepanciesContent);
  console.log(`Generated discrepancies report at ${DISCREPANCIES_FILE}`);
  
  console.log('Book cover processing completed successfully!');
  return {
    totalBooks: bookTitles.length,
    totalCovers: coverFiles.length,
    matchedBooks: Object.keys(bookCoverMap).length,
    exactMatches: Object.keys(bookCoverMap).length - discrepancies.length,
    partialMatches: discrepancies.filter(d => d.type === 'partial_match').length,
    forcedMatches: discrepancies.filter(d => d.type === 'forced_match').length
  };
}

// Run the main function
processBookCovers()
  .then(results => {
    console.log('Processing completed with the following results:');
    console.log(results);
  })
  .catch(error => {
    console.error('Error processing book covers:', error);
  });