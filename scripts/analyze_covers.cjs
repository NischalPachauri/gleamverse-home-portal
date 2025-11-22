
const fs = require('fs');
const path = require('path');

const booksPath = path.join(__dirname, '../src/data/books.ts');
const mappingPath = path.join(__dirname, '../src/utils/bookCoverMapping.ts');
const coversDir = path.join(__dirname, '../public/BookCoversNew');

// Helper to extract books from books.ts
function getBooks() {
    const content = fs.readFileSync(booksPath, 'utf8');
    // Simple regex to find titles. This is a heuristic.
    // Assuming format: title: "Title Here",
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
    // Regex to find "Key": "Value"
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

function fuzzyMatch(title, files) {
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanTitle.length < 3) return null; // Too short to fuzzy match safely

    // 1. Exact match (ignoring case and extension)
    for (const file of files) {
        const cleanFile = file.toLowerCase().replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]/g, '');
        if (cleanFile === cleanTitle) return file;
    }

    // 2. Contains match (if title is long enough)
    if (cleanTitle.length > 5) {
        for (const file of files) {
            const cleanFile = file.toLowerCase().replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]/g, '');
            if (cleanFile.length < 3) continue; // Skip short filenames

            // Check if file contains title or title contains file
            if (cleanFile.includes(cleanTitle) || cleanTitle.includes(cleanFile)) return file;
        }
    }

    return null;
}

const books = getBooks();
const mapping = getMapping();
const files = getAvailableCovers();

const missing = [];
const toAdd = {};

books.forEach(title => {
    if (mapping[title]) {
        return;
    }

    // Not mapped, try to find a file
    const match = fuzzyMatch(title, files);
    if (match) {
        toAdd[title] = `/BookCoversNew/${match}`;
    } else {
        missing.push(title);
    }
});

fs.writeFileSync(path.join(__dirname, 'analysis_result.json'), JSON.stringify({
    missing: missing,
    toAdd: toAdd
}, null, 2));
