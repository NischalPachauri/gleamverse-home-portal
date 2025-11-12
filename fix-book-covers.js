import fs from 'fs';
import path from 'path';

// Read the bookCoverMapping.ts file
const mappingFile = fs.readFileSync('src/utils/bookCoverMapping.ts', 'utf8');

// Extract all the image paths from the mapping
const imagePaths = [];
const lines = mappingFile.split('\n');

for (const line of lines) {
  if (line.includes('/BookCoversNew/')) {
    const match = line.match(/"\/BookCoversNew\/[^"]+"/g);
    if (match) {
      imagePaths.push(...match.map(m => m.replace(/"/g, '')));
    }
  }
}

console.log(`Found ${imagePaths.length} mapped image paths`);

// Check which files actually exist
const missingFiles = [];
const wrongExtensions = [];

for (const imagePath of imagePaths) {
  const fullPath = `public${imagePath}`;
  
  if (!fs.existsSync(fullPath)) {
    // Check if file exists with different extension
    const dir = path.dirname(fullPath);
    const basename = path.basename(fullPath, path.extname(fullPath));
    
    let found = false;
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file.startsWith(basename)) {
          wrongExtensions.push({
            expected: imagePath,
            actual: `/BookCoversNew/${file}`,
            basename: basename
          });
          found = true;
          break;
        }
      }
    }
    
    if (!found) {
      missingFiles.push(imagePath);
    }
  }
}

console.log(`\nMissing files: ${missingFiles.length}`);
missingFiles.forEach(file => console.log(`  ${file}`));

console.log(`\nWrong extensions: ${wrongExtensions.length}`);
wrongExtensions.forEach(({expected, actual}) => console.log(`  Expected: ${expected}`));
wrongExtensions.forEach(({expected, actual}) => console.log(`  Actual:   ${actual}`));

// Create a fixed mapping
let fixedMapping = mappingFile;

for (const {expected, actual} of wrongExtensions) {
  fixedMapping = fixedMapping.replace(expected, actual);
}

fs.writeFileSync('src/utils/bookCoverMapping_fixed.ts', fixedMapping);
console.log('\nFixed mapping written to src/utils/bookCoverMapping_fixed.ts');