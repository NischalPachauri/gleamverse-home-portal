import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to extract book info from filename
function extractBookInfo(filename) {
  let name = filename.replace('.pdf', '');
  let title = name;
  let author = 'Unknown Author';
  
  // Pattern: Title by Author
  if (name.includes(' by ')) {
    const parts = name.split(' by ');
    title = parts[0];
    author = parts[1];
  }
  // Pattern: Title - Author
  else if (name.includes(' - ')) {
    const parts = name.split(' - ');
    title = parts[0];
    if (parts[1] && !parts[1].match(/^\d/)) {
      author = parts[1];
    }
  }
  
  // Clean up
  title = title.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  author = author.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  title = title.replace(/\s*\(.*?\)/g, '').replace(/\.epub$/i, '');
  author = author.replace(/\s*\(.*?\)/g, '');
  
  return { title, author };
}

// Determine book genre from title/author
function getBookGenre(filename, title, author) {
  const t = title.toLowerCase();
  const a = author.toLowerCase();
  
  if (t.includes('harry potter')) return 'fantasy';
  if (t.includes('henry') && t.includes('mudge')) return 'children';
  if (t.includes('love') || t.includes('girlfriend') || t.includes('romance')) return 'romance';
  if (t.includes('mystery') || t.includes('crime') || t.includes('murder')) return 'mystery';
  if (t.includes('biography') || t.includes('wings of fire')) return 'biography';
  if (a.includes('chetan bhagat')) return 'fiction';
  if (a.includes('durjoy')) return 'romance';
  if (t.includes('learn') || t.includes('guide') || t.includes('textbook')) return 'educational';
  if (t.includes('fairy') || t.includes('children')) return 'children';
  
  return 'fiction';
}

// Color schemes for genres
const colorSchemes = {
  fantasy: ['#9B59B6', '#5B2C6F'],
  children: ['#FFD93D', '#FF6B6B'],
  romance: ['#FF6B9D', '#C44569'],
  mystery: ['#2C3E50', '#000000'],
  biography: ['#34495E', '#2C3E50'],
  fiction: ['#3498DB', '#2980B9'],
  educational: ['#1ABC9C', '#16A085'],
  default: ['#667EEA', '#764BA2']
};

// Generate SVG cover
function generateSVGCover(title, author, genre) {
  const colors = colorSchemes[genre] || colorSchemes.default;
  
  // Truncate long titles
  const displayTitle = title.length > 30 ? title.substring(0, 27) + '...' : title;
  const displayAuthor = author.length > 25 ? author.substring(0, 22) + '...' : author;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="600" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="400" height="600" fill="url(#bg)" />
  
  <!-- Pattern overlay -->
  <g opacity="0.1">
    ${Array.from({length: 15}, (_, i) => {
      const x = Math.random() * 400;
      const y = Math.random() * 600;
      const r = 10 + Math.random() * 30;
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="white"/>`;
    }).join('')}
  </g>
  
  <!-- Central design element -->
  <rect x="50" y="180" width="300" height="200" fill="white" opacity="0.15" rx="20"/>
  
  <!-- Genre icon area -->
  <g transform="translate(200, 280)">
    ${genre === 'fantasy' ? '<path d="M0,-40 L10,-10 L40,-5 L15,15 L20,45 L0,25 L-20,45 L-15,15 L-40,-5 L-10,-10 Z" fill="white" opacity="0.3"/>' : ''}
    ${genre === 'romance' ? '<path d="M0,20 C0,-20 -40,-20 -40,0 C-40,20 0,60 0,60 C0,60 40,20 40,0 C40,-20 0,-20 0,20 Z" fill="white" opacity="0.3"/>' : ''}
    ${genre === 'mystery' ? '<circle cx="0" cy="0" r="40" fill="none" stroke="white" stroke-width="4" opacity="0.3"/><text x="0" y="10" font-size="40" fill="white" text-anchor="middle" opacity="0.3">?</text>' : ''}
    ${genre === 'children' ? '<circle cx="0" cy="-10" r="25" fill="white" opacity="0.3"/><ellipse cx="0" cy="20" rx="35" ry="40" fill="white" opacity="0.3"/>' : ''}
    ${genre === 'biography' ? '<circle cx="0" cy="-10" r="30" fill="white" opacity="0.3"/><ellipse cx="0" cy="30" rx="40" ry="30" fill="white" opacity="0.3"/>' : ''}
    ${!['fantasy', 'romance', 'mystery', 'children', 'biography'].includes(genre) ? '<rect x="-40" y="-40" width="80" height="80" fill="white" opacity="0.3" rx="10"/>' : ''}
  </g>
  
  <!-- Title -->
  <text x="200" y="450" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="white" text-anchor="middle" filter="url(#shadow)">
    ${displayTitle.split(' ').slice(0, 4).join(' ')}
  </text>
  ${displayTitle.split(' ').length > 4 ? `
  <text x="200" y="485" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="white" text-anchor="middle" filter="url(#shadow)">
    ${displayTitle.split(' ').slice(4).join(' ')}
  </text>` : ''}
  
  <!-- Author -->
  <text x="200" y="540" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" opacity="0.9">
    ${displayAuthor}
  </text>
  
  <!-- Genre label -->
  <rect x="20" y="20" width="${genre.length * 10 + 20}" height="30" fill="white" opacity="0.2" rx="15"/>
  <text x="${30 + genre.length * 5}" y="40" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" font-weight="bold">
    ${genre.toUpperCase()}
  </text>
</svg>`;
}

// Main function
async function generateAllBookCovers() {
  const booksDir = path.join(__dirname, '..', 'public', 'books');
  const coversDir = path.join(__dirname, '..', 'public', 'book-covers');
  
  // Ensure covers directory exists
  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
  }
  
  // Get all PDF files
  const files = fs.readdirSync(booksDir).filter(file => file.endsWith('.pdf'));
  
  console.log(`Found ${files.length} books. Generating covers...`);
  
  let generated = 0;
  
  for (const file of files) {
    const { title, author } = extractBookInfo(file);
    const genre = getBookGenre(file, title, author);
    
    const coverName = file.replace('.pdf', '.svg');
    const coverPath = path.join(coversDir, coverName);
    
    // Generate SVG cover
    const svg = generateSVGCover(title, author, genre);
    fs.writeFileSync(coverPath, svg);
    
    generated++;
    if (generated % 20 === 0) {
      console.log(`Generated ${generated} covers...`);
    }
  }
  
  console.log(`\nComplete! Generated ${generated} book covers.`);
}

// Run the script
generateAllBookCovers().catch(console.error);
