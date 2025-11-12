import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read books data
const booksPath = path.join(__dirname, 'src/data/books.ts');
const booksContent = fs.readFileSync(booksPath, 'utf8');

// Extract PDF paths using regex
const pdfPathMatches = booksContent.match(/pdfPath:\s*"[^"]*"/g) || [];
const pdfPaths = pdfPathMatches.map(match => {
  const pathMatch = match.match(/"([^"]*)"/);
  return pathMatch ? pathMatch[1] : null;
}).filter(Boolean);

console.log(`Found ${pdfPaths.length} PDF paths in books data`);

// Check if PDF files exist
const publicDir = path.join(__dirname, 'public');
let missingPdfs = [];
let accessiblePdfs = [];

pdfPaths.forEach((pdfPath, index) => {
  if (!pdfPath) return;
  
  // Remove leading slash and convert to filesystem path
  const relativePath = pdfPath.startsWith('/') ? pdfPath.slice(1) : pdfPath;
  const fullPath = path.join(publicDir, relativePath);
  
  if (fs.existsSync(fullPath)) {
    accessiblePdfs.push(pdfPath);
    // Check file size to ensure it's not empty or corrupted
    const stats = fs.statSync(fullPath);
    if (stats.size === 0) {
      console.log(`⚠️  Empty PDF file: ${pdfPath}`);
    } else if (stats.size < 1024) {
      console.log(`⚠️  Very small PDF file (<1KB): ${pdfPath}`);
    }
  } else {
    missingPdfs.push(pdfPath);
    console.log(`❌ Missing PDF: ${pdfPath}`);
  }
});

console.log(`\nPDF Accessibility Report:`);
console.log(`✅ Accessible PDFs: ${accessiblePdfs.length}`);
console.log(`❌ Missing PDFs: ${missingPdfs.length}`);
console.log(`📊 Success Rate: ${((accessiblePdfs.length / pdfPaths.length) * 100).toFixed(1)}%`);

if (missingPdfs.length > 0) {
  console.log(`\nMissing PDF files:`);
  missingPdfs.forEach(pdf => console.log(`  - ${pdf}`));
}

// Test a specific PDF file to see if there are any issues
if (accessiblePdfs.length > 0) {
  const testPdfPath = accessiblePdfs[0];
  const relativePath = testPdfPath.startsWith('/') ? testPdfPath.slice(1) : testPdfPath;
  const fullPath = path.join(publicDir, relativePath);
  
  console.log(`\nTesting first accessible PDF: ${testPdfPath}`);
  try {
    const stats = fs.statSync(fullPath);
    console.log(`  File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Last modified: ${stats.mtime}`);
    
    // Check if file starts with PDF magic number
    const fd = fs.openSync(fullPath, 'r');
    const buffer = Buffer.alloc(5);
    fs.readSync(fd, buffer, 0, 5, 0);
    fs.closeSync(fd);
    
    const magicNumber = buffer.toString('hex');
    if (magicNumber.startsWith('25504446')) { // %PDF
      console.log(`  ✅ Valid PDF magic number found`);
    } else {
      console.log(`  ⚠️  Invalid PDF magic number: ${magicNumber}`);
    }
    
  } catch (error) {
    console.log(`  ❌ Error testing file: ${error.message}`);
  }
}