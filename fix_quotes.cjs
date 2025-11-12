const fs = require('fs');
const path = 'c:\\Users\\nisch\\OneDrive\\Documents\\GitHub\\gleamverse-home-portal\\src\\data\\books.ts';
let content = fs.readFileSync(path, 'utf8');

// Fix the pattern: description: "A book titled "Book Title"."
content = content.replace(/description: "A book titled "([^"]+)"\./g, 'description: "A book titled \\"$1\\"."');

fs.writeFileSync(path, content);
console.log('Fixed unescaped quotes in descriptions');