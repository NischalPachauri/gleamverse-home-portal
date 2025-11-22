
const fs = require('fs');
const path = require('path');

const booksPath = path.join(__dirname, '../src/data/books.ts');
const mappingPath = path.join(__dirname, '../src/utils/bookCoverMapping.ts');
const coversDir = path.join(__dirname, '../public/BookCoversNew');

// Helper to extract books from books.ts
function getBooks() {
    const content = fs.readFileSync(booksPath, 'utf8');
    const titleRegex = /title:\s*"([^"]+)"/g;
    const books = [];
    let match;
    while ((match = titleRegex.exec(content)) !== null) {
        books.push(match[1]);
    }
    return books;
}

// Helper to extract mapping
function getMapping() {
    const content = fs.readFileSync(mappingPath, 'utf8');
    const map = {};
    const lineRegex = /"([^"]+)":\s*"([^"]+)"/g;
    let match;
    while ((match = lineRegex.exec(content)) !== null) {
        map[match[1]] = match[2];
    }
    return map;
}

// Helper to get available covers
function getAvailableCovers() {
    try {
        return fs.readdirSync(coversDir);
    } catch (e) {
        console.error("Could not read covers directory:", e);
        return [];
    }
}

const books = getBooks();
const mapping = getMapping();
const files = getAvailableCovers();
const filesSet = new Set(files.map(f => f.toLowerCase()));

const brokenMappings = [];
const unmappedBooks = [];
const unusedCovers = new Set(files);

books.forEach(title => {
    if (mapping[title]) {
        const mappedPath = mapping[title];
        const filename = mappedPath.split('/').pop();
        if (!filesSet.has(filename.toLowerCase())) {
            brokenMappings.push({ title, mappedPath });
        } else {
            // Mark as used (fuzzy remove)
            // This is just for info, not critical
        }
    } else {
        // Check if we can find a fuzzy match that wasn't mapped
        unmappedBooks.push(title);
    }
});

fs.writeFileSync(path.join(__dirname, 'verification_result.json'), JSON.stringify({
    brokenMappings,
    unmappedBooksCount: unmappedBooks.length,
    unmappedBooks: unmappedBooks
}, null, 2));
