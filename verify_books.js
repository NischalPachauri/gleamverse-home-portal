import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the updated books.ts
const booksTsPath = path.join(__dirname, 'src/data/books.ts');
const booksContent = fs.readFileSync(booksTsPath, 'utf8');

// Read the book cover match report
const reportPath = path.join(__dirname, 'book_cover_match_report.md');
const reportContent = fs.readFileSync(reportPath, 'utf8');

// Get list of actual PDF files
const booksDir = path.join(__dirname, 'public/books');
const pdfFiles = fs.readdirSync(booksDir).filter(file => file.endsWith('.pdf'));

// Parse the book cover mapping from the report
const coverMapping = {};
const bookMatches = reportContent.match(/- Book: "([^"]+)" → Cover: "([^"]+)" /g);

if (bookMatches) {
  bookMatches.forEach(match => {
    const bookTitle = match.match(/- Book: "([^"]+)"/)[1];
    const coverTitle = match.match(/Cover: "([^"]+)"/)[1];
    coverMapping[bookTitle] = coverTitle;
  });
}

// Extract books from books.ts
const bookRegex = /{\s*id: "(\d+)",\s*title: "([^"]*)",\s*author: "([^"]*)",\s*genre: "([^"]*)",\s*description: "([^"]*)",(?:\s*coverImage: "([^"]*)",)?\s*pdfPath: "([^"]*)",\s*publishYear: (\d+),\s*pages: (\d+),\s*rating: ([\d.]+),\s*language: "([^"]*)",\s*tags: \[([^\]]*)\]\s*}/gm;

const books = [];
let match;
while ((match = bookRegex.exec(booksContent)) !== null) {
  const [, id, title, author, genre, description, coverImage, pdfPath, publishYear, pages, rating, language, tagsStr] = match;
  
  const book = {
    id,
    title,
    author,
    genre,
    description,
    pdfPath,
    publishYear: parseInt(publishYear),
    pages: parseInt(pages),
    rating: parseFloat(rating),
    language,
    tags: tagsStr ? tagsStr.split(',').map(tag => tag.trim().replace(/"/g, '')) : []
  };
  
  if (coverImage) {
    book.coverImage = coverImage;
  }
  
  books.push(book);
}

console.log(`=== VERIFICATION REPORT ===`);
console.log(`Total books in books.ts: ${books.length}`);
console.log(`Total PDF files: ${pdfFiles.length}`);
console.log(`Total book-cover mappings: ${Object.keys(coverMapping).length}`);
console.log();

// Verify 1: Title-PDF filename matching
console.log(`1. TITLE-PDF FILENAME MATCHING:`);
let titlePdfMatches = 0;
let titlePdfMismatches = 0;

books.forEach(book => {
  const expectedPdfFilename = `${book.title}.pdf`;
  const actualPdfPath = book.pdfPath;
  
  if (actualPdfPath === `/books/${expectedPdfFilename}`) {
    titlePdfMatches++;
  } else {
    titlePdfMismatches++;
    console.log(`  MISMATCH: Book "${book.title}" has pdfPath "${actualPdfPath}" but should be "/books/${expectedPdfFilename}"`);
  }
});

console.log(`   ✓ Matches: ${titlePdfMatches}`);
console.log(`   ✗ Mismatches: ${titlePdfMismatches}`);
console.log();

// Verify 2: Book cover mappings
console.log(`2. BOOK COVER MAPPINGS:`);
let coverMatches = 0;
let coverMismatches = 0;
let booksWithoutCovers = 0;

books.forEach(book => {
  const expectedCover = coverMapping[book.title];
  
  if (expectedCover) {
    if (book.coverImage === expectedCover) {
      coverMatches++;
    } else {
      coverMismatches++;
      console.log(`  MISMATCH: Book "${book.title}" has coverImage "${book.coverImage}" but should be "${expectedCover}"`);
    }
  } else {
    if (book.coverImage) {
      console.log(`  UNEXPECTED: Book "${book.title}" has coverImage "${book.coverImage}" but no mapping exists`);
    } else {
      booksWithoutCovers++;
    }
  }
});

console.log(`   ✓ Correct covers: ${coverMatches}`);
console.log(`   ✗ Incorrect covers: ${coverMismatches}`);
console.log(`   - Books without covers: ${booksWithoutCovers}`);
console.log();

// Verify 3: PDF file existence
console.log(`3. PDF FILE EXISTENCE:`);
let existingPdfs = 0;
let missingPdfs = 0;

books.forEach(book => {
  const pdfFilename = book.pdfPath.replace('/books/', '');
  if (pdfFiles.includes(pdfFilename)) {
    existingPdfs++;
  } else {
    missingPdfs++;
    console.log(`  MISSING: PDF file "${pdfFilename}" not found for book "${book.title}"`);
  }
});

console.log(`   ✓ Existing PDFs: ${existingPdfs}`);
console.log(`   ✗ Missing PDFs: ${missingPdfs}`);
console.log();

// Summary
console.log(`=== SUMMARY ===`);
const allTestsPassed = titlePdfMismatches === 0 && coverMismatches === 0 && missingPdfs === 0;
console.log(`Overall result: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
console.log();

if (allTestsPassed) {
  console.log(`✅ All book titles exactly match their PDF filenames`);
  console.log(`✅ All book cover mappings are correct`);
  console.log(`✅ All PDF files exist in the public/books directory`);
  console.log(`✅ Total books processed: ${books.length}`);
} else {
  console.log(`❌ Please review the mismatches above and fix them.`);
}