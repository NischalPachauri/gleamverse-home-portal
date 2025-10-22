import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to search for book covers using Open Library API
async function searchBookCover(title, author) {
  try {
    const searchQuery = encodeURIComponent(`${title} ${author}`);
    const response = await fetch(`https://openlibrary.org/search.json?title=${searchQuery}&limit=1`);
    const data = await response.json();
    
    if (data.docs && data.docs.length > 0) {
      const book = data.docs[0];
      if (book.cover_i) {
        return `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
      }
    }
  } catch (error) {
    console.error(`Error searching for ${title}:`, error);
  }
  
  return null;
}

// Function to download and save cover image
async function downloadCover(url, filename) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      const filepath = path.join(__dirname, '..', 'src', 'assets', 'covers', filename);
      fs.writeFileSync(filepath, Buffer.from(buffer));
      return true;
    }
  } catch (error) {
    console.error(`Error downloading cover for ${filename}:`, error);
  }
  
  return false;
}

// Function to generate cover filename
function generateCoverFilename(title, author) {
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 30);
  
  const cleanAuthor = author
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 20);
  
  return `${cleanTitle}-${cleanAuthor}.jpg`;
}

// Main function to process books and download covers
async function downloadBookCovers() {
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
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < Math.min(books.length, 50); i++) { // Limit to first 50 books for testing
    const book = books[i];
    console.log(`Processing ${i + 1}/${Math.min(books.length, 50)}: ${book.title}`);
    
    const coverUrl = await searchBookCover(book.title, book.author);
    if (coverUrl) {
      const filename = generateCoverFilename(book.title, book.author);
      const success = await downloadCover(coverUrl, filename);
      if (success) {
        successCount++;
        console.log(`✓ Downloaded cover for: ${book.title}`);
      } else {
        failCount++;
        console.log(`✗ Failed to download cover for: ${book.title}`);
      }
    } else {
      failCount++;
      console.log(`✗ No cover found for: ${book.title}`);
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\nDownload complete!`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

// Run the script
downloadBookCovers().catch(console.error);
