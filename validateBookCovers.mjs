// validateBookCovers.mjs
// Script to validate book cover mappings and prevent future mismatches
import fs from 'fs';
import path from 'path';

// Configuration
const PDF_DIR = './public/books';
const COVERS_DIR = './public/BookCoversNew';
const MAPPING_FILE = './src/utils/bookCoverMapping.ts';

// Validation function
async function validateBookCovers() {
  console.log('Starting book cover validation...');
  
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
    
    // Validation checks
    const issues = [];
    
    // 1. Check for broken image links
    for (const [title, coverPath] of Object.entries(bookCoverMap)) {
      const fullPath = path.join('./public', coverPath);
      if (!fs.existsSync(fullPath)) {
        issues.push(`Broken image link: "${title}" -> "${coverPath}"`);
      }
    }
    
    // 2. Check for orphaned cover images
    const mappedCovers = new Set(Object.values(bookCoverMap).map(p => path.basename(p)));
    const orphanedCovers = coverFiles.filter(cover => !mappedCovers.has(cover));
    
    if (orphanedCovers.length > 0) {
      issues.push(`Found ${orphanedCovers.length} orphaned cover images:`);
      orphanedCovers.slice(0, 10).forEach(cover => {
        issues.push(`  - ${cover}`);
      });
      if (orphanedCovers.length > 10) {
        issues.push(`  - ... and ${orphanedCovers.length - 10} more`);
      }
    }
    
    // 3. Check for PDFs without covers
    const pdfTitles = pdfFiles.map(file => file.replace(/\.[^/.]+$/, ''));
    const unmappedPDFs = pdfTitles.filter(title => {
      // Check if any key in bookCoverMap matches this title
      return !Object.keys(bookCoverMap).some(key => {
        const normalizedKey = key.toLowerCase().replace(/[^\w\s]/g, '').trim();
        const normalizedTitle = title.toLowerCase().replace(/[^\w\s]/g, '').trim();
        return normalizedKey.includes(normalizedTitle) || normalizedTitle.includes(normalizedKey);
      });
    });
    
    if (unmappedPDFs.length > 0) {
      issues.push(`Found ${unmappedPDFs.length} PDFs without mapped covers:`);
      unmappedPDFs.slice(0, 10).forEach(pdf => {
        issues.push(`  - ${pdf}`);
      });
      if (unmappedPDFs.length > 10) {
        issues.push(`  - ... and ${unmappedPDFs.length - 10} more`);
      }
    }
    
    // 4. Check for duplicate mappings
    const coverCounts = {};
    for (const coverPath of Object.values(bookCoverMap)) {
      coverCounts[coverPath] = (coverCounts[coverPath] || 0) + 1;
    }
    
    const duplicates = Object.entries(coverCounts)
      .filter(([_, count]) => count > 1)
      .map(([path, count]) => ({ path, count }));
    
    if (duplicates.length > 0) {
      issues.push(`Found ${duplicates.length} covers used multiple times:`);
      duplicates.forEach(({ path, count }) => {
        issues.push(`  - ${path} (used ${count} times)`);
      });
    }
    
    // Generate report
    if (issues.length === 0) {
      console.log('\n✅ Validation passed! No issues found.');
    } else {
      console.log(`\n❌ Validation failed! Found ${issues.length} issues:`);
      issues.forEach(issue => console.log(`- ${issue}`));
      
      // Write detailed report to file
      const reportContent = `# Book Cover Validation Report
Generated on: ${new Date().toISOString()}

## Summary
- Total PDFs: ${pdfFiles.length}
- Total covers: ${coverFiles.length}
- Total mappings: ${Object.keys(bookCoverMap).length}
- Issues found: ${issues.length}

## Issues
${issues.map(issue => `- ${issue}`).join('\n')}
`;
      
      fs.writeFileSync('./book_cover_validation_report.md', reportContent);
      console.log('\nDetailed report saved to book_cover_validation_report.md');
    }
    
  } catch (error) {
    console.error('Error during validation:', error);
  }
}

// Run the validation
validateBookCovers().catch(console.error);