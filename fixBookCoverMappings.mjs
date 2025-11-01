// fixBookCoverMappings.mjs
// Script to fix orphaned covers and duplicate mappings
import fs from 'fs';
import path from 'path';

// Configuration
const PDF_DIR = './public/books';
const COVERS_DIR = './public/BookCoversNew';
const MAPPING_FILE = './src/utils/bookCoverMapping.ts';
const FIXED_MAPPING_FILE = './src/utils/bookCoverMapping.fixed.ts';

// Fix function
async function fixBookCoverMappings() {
  console.log('Starting book cover mapping fixes...');
  
  try {
    // Check if mapping file exists
    if (!fs.existsSync(MAPPING_FILE)) {
      console.error('Error: Mapping file does not exist!');
      return;
    }
    
    // Read PDF files and cover images
    const pdfFiles = fs.readdirSync(PDF_DIR).filter(file => file.toLowerCase().endsWith('.pdf'));
    const coverFiles = fs.readdirSync(COVERS_DIR);
    
    console.log(`Found ${pdfFiles.length} PDF files and ${coverFiles.length} cover images.`);
    
    // Read mapping file content
    const mappingContent = fs.readFileSync(MAPPING_FILE, 'utf8');
    
    // Extract bookCoverMap from the file content using regex
    const mapMatch = mappingContent.match(/export const bookCoverMap: Record<string, string> = ({[\s\S]*?});/);
    if (!mapMatch) {
      console.error('Error: Could not extract bookCoverMap from mapping file!');
      return;
    }
    
    // Parse the bookCoverMap
    const bookCoverMapStr = mapMatch[1];
    const bookCoverMap = eval(`(${bookCoverMapStr})`);
    
    // Fix 1: Handle duplicate mappings
    const coverToTitles = {};
    const duplicateMappings = {};
    
    // Identify duplicate mappings
    for (const [title, coverPath] of Object.entries(bookCoverMap)) {
      if (!coverToTitles[coverPath]) {
        coverToTitles[coverPath] = [];
      }
      coverToTitles[coverPath].push(title);
      
      if (coverToTitles[coverPath].length > 1) {
        duplicateMappings[coverPath] = coverToTitles[coverPath];
      }
    }
    
    // Fix duplicate mappings by finding alternative covers for duplicates
    const fixedDuplicates = [];
    for (const [coverPath, titles] of Object.entries(duplicateMappings)) {
      // Keep the first title with the original cover
      const primaryTitle = titles[0];
      
      // For other titles, try to find alternative covers
      for (let i = 1; i < titles.length; i++) {
        const title = titles[i];
        const normalizedTitle = title.toLowerCase().replace(/[^\w\s]/g, '').trim();
        
        // Find alternative cover
        let alternativeCover = null;
        let bestMatchScore = 0;
        
        for (const coverFile of coverFiles) {
          // Skip if this cover is already mapped
          const coverFullPath = `/${path.relative('./public', path.join(COVERS_DIR, coverFile)).replace(/\\/g, '/')}`;
          if (Object.values(bookCoverMap).includes(coverFullPath)) {
            continue;
          }
          
          const coverTitle = coverFile.replace(/\.[^/.]+$/, '');
          const normalizedCoverTitle = coverTitle.toLowerCase().replace(/[^\w\s]/g, '').trim();
          
          // Calculate match score
          let score = 0;
          
          if (normalizedCoverTitle === normalizedTitle) {
            score = 100;
          } else if (normalizedCoverTitle.includes(normalizedTitle) || normalizedTitle.includes(normalizedCoverTitle)) {
            score = 70;
          } else {
            const titleWords = normalizedTitle.split(/\s+/);
            const coverWords = normalizedCoverTitle.split(/\s+/);
            const matchingWords = titleWords.filter(word => coverWords.includes(word)).length;
            if (matchingWords > 0) {
              score = (matchingWords / titleWords.length) * 50;
            }
          }
          
          if (score > bestMatchScore) {
            bestMatchScore = score;
            alternativeCover = coverFile;
          }
        }
        
        if (alternativeCover && bestMatchScore > 30) {
          const alternativePath = `/${path.relative('./public', path.join(COVERS_DIR, alternativeCover)).replace(/\\/g, '/')}`;
          bookCoverMap[title] = alternativePath;
          fixedDuplicates.push({
            title,
            oldCover: coverPath,
            newCover: alternativePath
          });
        }
      }
    }
    
    // Fix 2: Map orphaned covers to PDFs without covers
    const mappedCovers = new Set(Object.values(bookCoverMap).map(p => path.basename(p)));
    const orphanedCovers = coverFiles.filter(cover => !mappedCovers.has(cover));
    
    // Get PDFs without covers
    const mappedPDFs = new Set();
    for (const title of Object.keys(bookCoverMap)) {
      for (const pdfFile of pdfFiles) {
        const pdfTitle = pdfFile.replace(/\.[^/.]+$/, '');
        const normalizedPdfTitle = pdfTitle.toLowerCase().replace(/[^\w\s]/g, '').trim();
        const normalizedTitle = title.toLowerCase().replace(/[^\w\s]/g, '').trim();
        
        if (normalizedPdfTitle === normalizedTitle || 
            normalizedPdfTitle.includes(normalizedTitle) || 
            normalizedTitle.includes(normalizedPdfTitle)) {
          mappedPDFs.add(pdfFile);
        }
      }
    }
    
    const unmappedPDFs = pdfFiles.filter(pdf => !mappedPDFs.has(pdf));
    
    // Match orphaned covers to unmapped PDFs
    const newMappings = [];
    for (const pdfFile of unmappedPDFs) {
      const pdfTitle = pdfFile.replace(/\.[^/.]+$/, '');
      const normalizedPdfTitle = pdfTitle.toLowerCase().replace(/[^\w\s]/g, '').trim();
      
      let bestMatch = null;
      let bestMatchScore = 0;
      
      for (const coverFile of orphanedCovers) {
        const coverTitle = coverFile.replace(/\.[^/.]+$/, '');
        const normalizedCoverTitle = coverTitle.toLowerCase().replace(/[^\w\s]/g, '').trim();
        
        // Calculate match score
        let score = 0;
        
        if (normalizedCoverTitle === normalizedPdfTitle) {
          score = 100;
        } else if (normalizedCoverTitle.includes(normalizedPdfTitle) || normalizedPdfTitle.includes(normalizedCoverTitle)) {
          score = 70;
        } else {
          const pdfWords = normalizedPdfTitle.split(/\s+/);
          const coverWords = normalizedCoverTitle.split(/\s+/);
          const matchingWords = pdfWords.filter(word => coverWords.includes(word)).length;
          if (matchingWords > 0) {
            score = (matchingWords / pdfWords.length) * 50;
          }
        }
        
        if (score > bestMatchScore) {
          bestMatchScore = score;
          bestMatch = coverFile;
        }
      }
      
      if (bestMatch && bestMatchScore > 30) {
        const coverPath = `/${path.relative('./public', path.join(COVERS_DIR, bestMatch)).replace(/\\/g, '/')}`;
        bookCoverMap[pdfTitle] = coverPath;
        newMappings.push({
          title: pdfTitle,
          cover: coverPath,
          score: bestMatchScore
        });
        
        // Remove from orphaned covers
        orphanedCovers.splice(orphanedCovers.indexOf(bestMatch), 1);
      }
    }
    
    // Generate the fixed TypeScript file
    const timestamp = new Date().toISOString();
    const totalCovers = Object.keys(bookCoverMap).length;
    
    let tsContent = `// Auto-generated book cover mapping (fixed version)
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

    // Write the fixed TypeScript file
    fs.writeFileSync(FIXED_MAPPING_FILE, tsContent);
    
    // Generate report
    console.log(`\nFixes complete!`);
    console.log(`Fixed ${fixedDuplicates.length} duplicate mappings`);
    console.log(`Added ${newMappings.length} new mappings for previously unmapped PDFs`);
    console.log(`Remaining orphaned covers: ${orphanedCovers.length}`);
    
    // Write detailed report to file
    const reportContent = `# Book Cover Mapping Fix Report
Generated on: ${timestamp}

## Summary
- Total PDFs: ${pdfFiles.length}
- Total covers: ${coverFiles.length}
- Total mappings after fixes: ${totalCovers}
- Fixed duplicate mappings: ${fixedDuplicates.length}
- New mappings added: ${newMappings.length}
- Remaining orphaned covers: ${orphanedCovers.length}

## Fixed Duplicate Mappings
${fixedDuplicates.map(fix => `- "${fix.title}": Changed from "${fix.oldCover}" to "${fix.newCover}"`).join('\n')}

## New Mappings Added
${newMappings.map(mapping => `- "${mapping.title}" -> "${mapping.cover}" (match score: ${mapping.score.toFixed(2)})`).join('\n')}

## Remaining Orphaned Covers
${orphanedCovers.slice(0, 20).map(cover => `- ${cover}`).join('\n')}
${orphanedCovers.length > 20 ? `- ... and ${orphanedCovers.length - 20} more` : ''}
`;
    
    fs.writeFileSync('./book_cover_fix_report.md', reportContent);
    
    console.log('\nDetailed report saved to book_cover_fix_report.md');
    console.log('Fixed mapping saved to src/utils/bookCoverMapping.fixed.ts');
    console.log('\nTo apply the fixes, rename bookCoverMapping.fixed.ts to bookCoverMapping.ts');
    
  } catch (error) {
    console.error('Error during fix process:', error);
  }
}

// Run the fix process
fixBookCoverMappings().catch(console.error);