// Script to automatically add missing book cover mappings
import fs from 'fs';
import path from 'path';

// Read the current mapping file
const mappingContent = fs.readFileSync('src/utils/bookCoverMapping.ts', 'utf8');
const booksContent = fs.readFileSync('src/data/books.ts', 'utf8');

// Extract existing mappings
const mappingMatches = mappingContent.match(/"([^"]+)":\s*"\/BookCoversNew\/[^"]+"/g) || [];
const existingMappings = mappingMatches.map(match => {
  const titleMatch = match.match(/"([^"]+)":/);
  return titleMatch ? titleMatch[1] : '';
}).filter(Boolean);

// Extract book titles
const bookMatches = booksContent.match(/title:\s*"([^"]+)"/g) || [];
const bookTitles = bookMatches.map(match => {
  const titleMatch = match.match(/title:\s*"([^"]+)"/);
  return titleMatch ? titleMatch[1] : '';
}).filter(Boolean);

// Get available image files
const imageDir = 'public/BookCoversNew';
const imageFiles = fs.readdirSync(imageDir).filter(file => 
  file.match(/\.(jpg|jpeg|png|gif)$/i)
);

// Function to find best image match for a book title
function findBestImageMatch(bookTitle, imageFiles) {
  const bookTitleLower = bookTitle.toLowerCase();
  
  // Try exact match first
  let bestMatch = imageFiles.find(file => {
    const fileName = path.parse(file).name.toLowerCase();
    return fileName === bookTitleLower;
  });
  
  if (bestMatch) return bestMatch;
  
  // Try normalized match
  bestMatch = imageFiles.find(file => {
    const fileName = path.parse(file).name.toLowerCase().replace(/[^\w\s]/g, '');
    const normalizedTitle = bookTitleLower.replace(/[^\w\s]/g, '');
    return fileName === normalizedTitle;
  });
  
  if (bestMatch) return bestMatch;
  
  // Try partial match
  const titleWords = bookTitleLower.split(' ').filter(word => word.length > 2);
  
  let bestScore = 0;
  let bestPartialMatch = null;
  
  imageFiles.forEach(file => {
    const fileName = path.parse(file).name.toLowerCase();
    const fileWords = fileName.split(' ').filter(word => word.length > 2);
    
    // Count matching words
    const matchingWords = titleWords.filter(word => 
      fileWords.some(fileWord => 
        fileWord.includes(word) || word.includes(fileWord)
      )
    ).length;
    
    const score = matchingWords / Math.max(titleWords.length, fileWords.length);
    
    if (score > bestScore && score >= 0.5) {
      bestScore = score;
      bestPartialMatch = file;
    }
  });
  
  return bestPartialMatch;
}

// Find books without mappings
const missingBooks = bookTitles.filter(title => !existingMappings.includes(title));
console.log(`Found ${missingBooks.length} books without mappings`);

// Generate new mappings
const newMappings = [];
missingBooks.forEach(bookTitle => {
  const bestMatch = findBestImageMatch(bookTitle, imageFiles);
  if (bestMatch) {
    newMappings.push(`  "${bookTitle}": "/BookCoversNew/${bestMatch}"`);
    console.log(`✓ Found match for "${bookTitle}" -> "${bestMatch}"`);
  } else {
    console.log(`✗ No match found for "${bookTitle}"`);
  }
});

// Update the mapping file
if (newMappings.length > 0) {
  // Find the position to insert new mappings (before the closing brace)
  const closingBraceIndex = mappingContent.lastIndexOf('}');
  const beforeClosingBrace = mappingContent.substring(0, closingBraceIndex);
  const afterClosingBrace = mappingContent.substring(closingBraceIndex);
  
  // Add comma if needed
  const needsComma = !beforeClosingBrace.trim().endsWith(',');
  const separator = needsComma ? ',\n' : '\n';
  
  // Create updated content
  const updatedContent = beforeClosingBrace + separator + newMappings.join(',\n') + '\n' + afterClosingBrace;
  
  // Write the updated file
  fs.writeFileSync('src/utils/bookCoverMapping.ts', updatedContent);
  console.log(`\n✓ Added ${newMappings.length} new mappings to bookCoverMapping.ts`);
} else {
  console.log('No new mappings to add');
}

console.log(`\nSummary:`);
console.log(`- Total books: ${bookTitles.length}`);
console.log(`- Existing mappings: ${existingMappings.length}`);
console.log(`- New mappings added: ${newMappings.length}`);
console.log(`- Total mappings after update: ${existingMappings.length + newMappings.length}`);