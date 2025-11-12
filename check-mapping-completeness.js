import fs from 'fs';

// Read books data
const booksFile = fs.readFileSync('src/data/books.ts', 'utf8');
const mappingFile = fs.readFileSync('src/utils/bookCoverMapping.ts', 'utf8');

// Extract book titles
const bookTitles = [];
const lines = booksFile.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('title:')) {
    const titleMatch = line.match(/title:\s*"([^"]+)"/);
    if (titleMatch) {
      bookTitles.push(titleMatch[1]);
    }
  }
}

// Extract mapping keys
const mappingKeys = [];
const mappingLines = mappingFile.split('\n');

for (const line of mappingLines) {
  if (line.includes('": "/BookCoversNew/')) {
    const keyMatch = line.match(/^\s*"([^"]+)"/);
    if (keyMatch) {
      mappingKeys.push(keyMatch[1]);
    }
  }
}

console.log(`Total books: ${bookTitles.length}`);
console.log(`Total mappings: ${mappingKeys.length}`);

// Find books without mappings
const unmappedBooks = bookTitles.filter(title => !mappingKeys.includes(title));

console.log(`\nBooks without mappings (${unmappedBooks.length}):`);
unmappedBooks.forEach((title, index) => {
  console.log(`${index + 1}. ${title}`);
});

// Find mappings without books (orphaned mappings)
const orphanedMappings = mappingKeys.filter(key => !bookTitles.includes(key));

console.log(`\nOrphaned mappings (${orphanedMappings.length}):`);
orphanedMappings.forEach((key, index) => {
  console.log(`${index + 1}. ${key}`);
});