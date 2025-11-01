// syncBookCovers.mjs
// Script to synchronize book cover mappings with renamed PDF files
import fs from 'fs';
import path from 'path';

// Configuration
const PDF_DIR = './public/books';
const COVERS_DIR = './public/BookCoversNew';
const OUTPUT_FILE = './src/utils/bookCoverMapping.ts';
const BACKUP_FILE = './src/utils/bookCoverMapping.backup.ts';

// Utility functions for string normalization and comparison
const normalizeString = (str) => {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\b(the|a|an|and|or|but|in|on|at|by|for|with|about)\b/g, '') // Remove common words
    .trim();
};

const extractTitleFromFilename = (filename) => {
  // Remove file extension
  let title = filename.replace(/\.[^/.]+$/, '');
  
  // Remove numbering patterns (like 01_, 02_, etc.)
  title = title.replace(/^\d+[_-]/, '');
  
  // Replace underscores and hyphens with spaces
  title = title.replace(/[_-]/g, ' ');
  
  return title;
};

// Main function
async function syncBookCovers() {
  console.log('Starting book cover synchronization...');
  
  try {
    // Backup existing mapping file if it exists
    if (fs.existsSync(OUTPUT_FILE)) {
      console.log('Backing up existing mapping file...');
      fs.copyFileSync(OUTPUT_FILE, BACKUP_FILE);
    }
    
    // Read PDF files and cover images
    const pdfFiles = fs.readdirSync(PDF_DIR).filter(file => file.toLowerCase().endsWith('.pdf'));
    const coverFiles = fs.readdirSync(COVERS_DIR);
    
    console.log(`Found ${pdfFiles.length} PDF files and ${coverFiles.length} cover images.`);
    
    // Create mapping between PDFs and covers
    const bookCoverMap = {};
    const unmatchedPDFs = [];
    const unmatchedCovers = new Set(coverFiles);
    
    // Process each PDF file
    for (const pdfFile of pdfFiles) {
      const pdfTitle = extractTitleFromFilename(pdfFile);
      const normalizedPdfTitle = normalizeString(pdfTitle);
      
      let bestMatch = null;
      let bestMatchScore = 0;
      
      // Find the best matching cover
      for (const coverFile of coverFiles) {
        const coverTitle = coverFile.replace(/\.[^/.]+$/, '');
        const normalizedCoverTitle = normalizeString(coverTitle);
        
        // Calculate match score (simple algorithm)
        let score = 0;
        
        // Exact match
        if (normalizedPdfTitle === normalizedCoverTitle) {
          score = 100;
        } 
        // Partial match - one contains the other
        else if (normalizedPdfTitle.includes(normalizedCoverTitle) || 
                 normalizedCoverTitle.includes(normalizedPdfTitle)) {
          // Calculate percentage of overlap
          const minLength = Math.min(normalizedPdfTitle.length, normalizedCoverTitle.length);
          const maxLength = Math.max(normalizedPdfTitle.length, normalizedCoverTitle.length);
          score = (minLength / maxLength) * 80; // Max 80 points for partial match
        }
        // Word-by-word match
        else {
          const pdfWords = normalizedPdfTitle.split(/\s+/);
          const coverWords = normalizedCoverTitle.split(/\s+/);
          
          // Count matching words
          const matchingWords = pdfWords.filter(word => coverWords.includes(word)).length;
          const totalWords = new Set([...pdfWords, ...coverWords]).size;
          
          if (matchingWords > 0) {
            score = (matchingWords / totalWords) * 60; // Max 60 points for word match
          }
        }
        
        // Update best match if this score is higher
        if (score > bestMatchScore) {
          bestMatchScore = score;
          bestMatch = coverFile;
        }
      }
      
      // If we found a good match (score > 40), add it to the mapping
      if (bestMatch && bestMatchScore > 40) {
        bookCoverMap[pdfTitle] = `/${path.relative('./public', path.join(COVERS_DIR, bestMatch)).replace(/\\/g, '/')}`;
        unmatchedCovers.delete(bestMatch);
      } else {
        unmatchedPDFs.push(pdfFile);
      }
    }
    
    // Generate the TypeScript file
    const timestamp = new Date().toISOString();
    const totalCovers = Object.keys(bookCoverMap).length;
    
    let tsContent = `// Auto-generated book cover mapping
// Generated on: ${timestamp}
// Total covers: ${totalCovers}

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
  
  // Try partial match (if title contains or is contained in a key)
  const partialMatch = Object.keys(bookCoverMap).find(k => 
    k.toLowerCase().includes(lowerTitle) || 
    lowerTitle.includes(k.toLowerCase())
  );
  
  if (partialMatch) {
    console.log(\`Found partial match for "\${title}": using cover for "\${partialMatch}"\`);
    return bookCoverMap[partialMatch];
  }
  
  // Try matching by removing common words and punctuation
  const simplifiedTitle = lowerTitle
    .replace(/[^\\w\\s]/g, '') // Remove punctuation
    .replace(/\\b(the|a|an|and|or|but|in|on|at|by|for|with|about)\\b/g, '') // Remove common words
    .trim();
  
  if (simplifiedTitle) {
    const simplifiedMatch = Object.keys(bookCoverMap).find(k => {
      const simplifiedKey = k.toLowerCase()
        .replace(/[^\\w\\s]/g, '')
        .replace(/\\b(the|a|an|and|or|but|in|on|at|by|for|with|about)\\b/g, '')
        .trim();
      return simplifiedKey === simplifiedTitle || 
             simplifiedKey.includes(simplifiedTitle) || 
             simplifiedTitle.includes(simplifiedKey);
    });
    
    if (simplifiedMatch) {
      console.log(\`Found simplified match for "\${title}": using cover for "\${simplifiedMatch}"\`);
      return bookCoverMap[simplifiedMatch];
    }
  }
  
  // Log missing cover for debugging
  console.warn(\`No cover found for book: "\${title}"\`);
  
  // Return placeholder if no match found
  return '/placeholder.svg';
}

export const bookCoverMap: Record<string, string> = ${JSON.stringify(bookCoverMap, null, 2)};
`;

    // Write the TypeScript file
    fs.writeFileSync(OUTPUT_FILE, tsContent);
    
    // Generate report
    console.log(`\nSynchronization complete!`);
    console.log(`Total PDFs: ${pdfFiles.length}`);
    console.log(`Total covers: ${coverFiles.length}`);
    console.log(`Matched: ${totalCovers}`);
    console.log(`Unmatched PDFs: ${unmatchedPDFs.length}`);
    console.log(`Unmatched covers: ${unmatchedCovers.size}`);
    
    // Write detailed report to file
    const reportContent = `# Book Cover Mapping Synchronization Report
Generated on: ${timestamp}

## Summary
- Total PDFs: ${pdfFiles.length}
- Total covers: ${coverFiles.length}
- Successfully matched: ${totalCovers}
- Unmatched PDFs: ${unmatchedPDFs.length}
- Unmatched covers: ${unmatchedCovers.size}

## Unmatched PDFs
${unmatchedPDFs.map(pdf => `- ${pdf}`).join('\n')}

## Unmatched Covers
${Array.from(unmatchedCovers).map(cover => `- ${cover}`).join('\n')}
`;
    
    fs.writeFileSync('./book_cover_sync_report.md', reportContent);
    
    console.log('\nDetailed report saved to book_cover_sync_report.md');
    
  } catch (error) {
    console.error('Error during synchronization:', error);
  }
}

// Run the synchronization
syncBookCovers().catch(console.error);