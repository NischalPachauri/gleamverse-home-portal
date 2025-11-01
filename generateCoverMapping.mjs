// generateCoverMapping.js - ES Module version
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to your BookCoversNew folder
const COVERS_DIR = path.join(__dirname, 'public', 'BookCoversNew');
const OUTPUT_FILE = path.join(__dirname, 'src', 'utils', 'generatedBookCoverMap.ts');

/**
 * Clean filename to create a title key
 */
function cleanFilename(filename) {
  return filename
    .replace(/\.(png|jpeg|jpg|gif|webp)$/i, '') // Remove extension
    .trim();
}

/**
 * Generate the mapping
 */
function generateMapping() {
  try {
    // Check if directory exists
    if (!fs.existsSync(COVERS_DIR)) {
      console.error(`❌ Directory not found: ${COVERS_DIR}`);
      console.log('Please update COVERS_DIR path in the script');
      return;
    }

    // Read all files in the directory
    const files = fs.readdirSync(COVERS_DIR);
    
    // Filter image files
    const imageFiles = files.filter(file => 
      /\.(png|jpeg|jpg|gif|webp)$/i.test(file)
    );

    console.log(`📁 Found ${imageFiles.length} book covers in ${COVERS_DIR}`);

    // Generate mapping object
    const mapping = {};
    imageFiles.forEach(file => {
      const title = cleanFilename(file);
      const path = `/BookCoversNew/${file}`;
      mapping[title] = path;
    });

    // Sort alphabetically
    const sortedMapping = Object.keys(mapping)
      .sort()
      .reduce((obj, key) => {
        obj[key] = mapping[key];
        return obj;
      }, {});

    // Generate TypeScript code
    const tsCode = `// Auto-generated book cover mapping
// Generated on: ${new Date().toISOString()}
// Total covers: ${imageFiles.length}

export const bookCoverMap: Record<string, string> = ${JSON.stringify(sortedMapping, null, 2)};
`;

    // Write to file
    fs.writeFileSync(OUTPUT_FILE, tsCode);
    console.log(`✅ Generated mapping file: ${OUTPUT_FILE}`);
    console.log(`📊 Total covers: ${imageFiles.length}`);
    
    // Show sample entries
    console.log('\n📚 Sample entries:');
    Object.keys(sortedMapping).slice(0, 5).forEach(key => {
      console.log(`   "${key}": "${sortedMapping[key]}"`);
    });

    console.log('\n✨ Success! Now:');
    console.log('1. Open src/utils/generatedBookCoverMap.ts');
    console.log('2. Copy the bookCoverMap object');
    console.log('3. Paste it into your src/utils/bookCoverMapping.ts file');

  } catch (error) {
    console.error('❌ Error generating mapping:', error.message);
  }
}

// Run the generator
generateMapping();