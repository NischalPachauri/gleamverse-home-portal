const fs = require('fs');
const path = require('path');

console.log('=== FINAL VERIFICATION REPORT ===');

// Read books.ts
const booksContent = fs.readFileSync('src/data/books.ts', 'utf8');
const coverReport = fs.readFileSync('book_cover_match_report.md', 'utf8');

// Extract book entries using a simpler regex
const bookRegex = /{\s*id: "(\d+)",\s*title: "([^"]*)",\s*author: "([^"]*)",\s*genre: "([^"]*)",\s*description: "([^"]*)",(?:\s*coverImage: "([^"]*)",)?\s*pdfPath: "([^"]*)",\s*publishYear: (\d+),\s*pages: (\d+),\s*rating: ([\d.]+),\s*language: "([^"]*)",\s*tags: \[([^\]]*)\]\s*}/g;

const books = [];
let match;
while ((match = bookRegex.exec(booksContent)) !== null) {
  const [, id, title, author, genre, description, coverImage, pdfPath, publishYear, pages, rating, language, tags] = match;
  books.push({
    id,
    title,
    author,
    genre,
    description,
    coverImage: coverImage || null,
    pdfPath,
    publishYear: parseInt(publishYear),
    pages: parseInt(pages),
    rating: parseFloat(rating),
    language,
    tags: tags.split(',').map(tag => tag.trim().replace(/"/g, ''))
  });
}

// Extract cover mappings from report
const coverMappings = new Map();
const coverLines = coverReport.split('\n');
for (const line of coverLines) {
  if (line.includes('→')) {
    const [pdfName, coverName] = line.split('→').map(s => s.trim());
    if (pdfName && coverName) {
      coverMappings.set(pdfName.replace('.pdf', ''), coverName);
    }
  }
}

// Check PDF files
const pdfFiles = fs.readdirSync('public/books').filter(file => file.endsWith('.pdf'));
const pdfSet = new Set(pdfFiles.map(f => f.replace('.pdf', '')));

// Verification results
let titlePdfMatches = 0;
let titlePdfMismatches = 0;
let correctCovers = 0;
let incorrectCovers = 0;
let missingCovers = 0;
let existingPdfs = 0;
let missingPdfs = 0;

console.log(`Total books found: ${books.length}`);
console.log(`Total PDF files: ${pdfFiles.length}`);
console.log(`Total cover mappings: ${coverMappings.size}`);
console.log('');

// Check each book
for (const book of books) {
  const pdfFilename = book.pdfPath.replace('/books/', '').replace('.pdf', '');
  
  // Check title-PDF match
  if (book.title === pdfFilename) {
    titlePdfMatches++;
  } else {
    titlePdfMismatches++;
    console.log(`❌ Title-PDF mismatch: "${book.title}" vs "${pdfFilename}"`);
  }
  
  // Check cover mapping
  if (book.coverImage) {
    const expectedCover = coverMappings.get(book.title);
    if (expectedCover && book.coverImage === expectedCover) {
      correctCovers++;
    } else {
      incorrectCovers++;
      console.log(`❌ Cover mismatch: "${book.title}" has "${book.coverImage}", expected "${expectedCover}"`);
    }
  } else {
    missingCovers++;
    console.log(`⚠️  Missing cover: "${book.title}"`);
  }
  
  // Check PDF existence
  if (pdfSet.has(pdfFilename)) {
    existingPdfs++;
  } else {
    missingPdfs++;
    console.log(`❌ Missing PDF: "${pdfFilename}.pdf" for book "${book.title}"`);
  }
}

console.log('');
console.log('=== VERIFICATION RESULTS ===');
console.log(`Title-PDF Matches: ${titlePdfMatches}`);
console.log(`Title-PDF Mismatches: ${titlePdfMismatches}`);
console.log(`Correct Covers: ${correctCovers}`);
console.log(`Incorrect Covers: ${incorrectCovers}`);
console.log(`Missing Covers: ${missingCovers}`);
console.log(`Existing PDFs: ${existingPdfs}`);
console.log(`Missing PDFs: ${missingPdfs}`);
console.log('');

// Sample verification of first 5 books
console.log('=== SAMPLE VERIFICATION (First 5 Books) ===');
for (let i = 0; i < Math.min(5, books.length); i++) {
  const book = books[i];
  const pdfFilename = book.pdfPath.replace('/books/', '').replace('.pdf', '');
  const expectedCover = coverMappings.get(book.title);
  
  console.log(`\nBook ${i + 1}: "${book.title}"`);
  console.log(`  PDF Path: ${book.pdfPath}`);
  console.log(`  Title matches PDF: ${book.title === pdfFilename ? '✅' : '❌'}`);
  console.log(`  Cover Image: ${book.coverImage || 'none'}`);
  console.log(`  Expected Cover: ${expectedCover || 'none'}`);
  console.log(`  Cover matches: ${book.coverImage === expectedCover ? '✅' : '❌'}`);
}

console.log('\n=== FINAL SUMMARY ===');
const allTestsPassed = titlePdfMismatches === 0 && incorrectCovers === 0 && missingPdfs === 0;
console.log(allTestsPassed ? '✅ ALL REQUIREMENTS MET!' : '❌ Some issues found');
console.log(`✅ Total books processed: ${books.length}`);
console.log(`✅ All titles match PDF filenames: ${titlePdfMismatches === 0}`);
console.log(`✅ All covers correctly mapped: ${incorrectCovers === 0}`);
console.log(`✅ All PDFs exist: ${missingPdfs === 0}`);