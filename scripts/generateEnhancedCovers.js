import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Enhanced book info extraction
function extractBookInfo(filename) {
  let name = filename.replace('.pdf', '');
  let title = name;
  let author = 'Unknown Author';
  
  // Clean common patterns
  name = name.replace(/\s*\(.*?\)/g, '').replace(/\.epub$/i, '').replace(/_freebooksplanet\.com/g, '');
  
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
  // Pattern with underscores
  else if (name.includes('_')) {
    title = name.replace(/_/g, ' ');
  }
  
  // Clean up
  title = title.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  author = author.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Remove file artifacts
  title = title.replace(/^\d+\s+/, ''); // Remove leading numbers
  author = author.replace(/z\s*lib\s*org/gi, '').replace(/\s+\d+$/, '');
  
  return { title, author };
}

// Enhanced genre detection
function getBookGenre(filename, title, author) {
  const t = title.toLowerCase();
  const a = author.toLowerCase();
  const f = filename.toLowerCase();
  
  // Specific series/books
  if (t.includes('harry potter')) return 'fantasy';
  if (t.includes('percy jackson')) return 'fantasy';
  if (t.includes('lord of the rings') || t.includes('hobbit')) return 'fantasy';
  if (t.includes('henry') && t.includes('mudge')) return 'children';
  if (f.includes('hindi') || t.includes('12th fail') || t.includes('महाभारत')) return 'hindi';
  
  // Authors
  if (a.includes('chetan bhagat')) return 'fiction';
  if (a.includes('durjoy') || a.includes('ravinder singh')) return 'romance';
  if (a.includes('dan brown')) return 'mystery';
  if (a.includes('paulo coelho')) return 'philosophy';
  
  // Title keywords
  if (t.includes('love') || t.includes('girlfriend') || t.includes('crush')) return 'romance';
  if (t.includes('murder') || t.includes('crime') || t.includes('detective')) return 'mystery';
  if (t.includes('biography') || t.includes('life story')) return 'biography';
  if (t.includes('wings of fire') || t.includes('abdul kalam')) return 'biography';
  if (t.includes('learn') || t.includes('guide') || t.includes('textbook')) return 'educational';
  if (t.includes('fairy') || t.includes('children')) return 'children';
  if (t.includes('philosophy') || t.includes('bhagavad gita')) return 'philosophy';
  
  return 'fiction';
}

// Enhanced color schemes with gradients
const colorSchemes = {
  fantasy: {
    gradient: ['#8B5CF6', '#EC4899'],
    accent: '#FCD34D',
    text: '#FFFFFF'
  },
  children: {
    gradient: ['#FBBF24', '#FB923C'],
    accent: '#A78BFA',
    text: '#FFFFFF'
  },
  romance: {
    gradient: ['#EC4899', '#EF4444'],
    accent: '#FCA5A5',
    text: '#FFFFFF'
  },
  mystery: {
    gradient: ['#1F2937', '#111827'],
    accent: '#6B7280',
    text: '#F3F4F6'
  },
  biography: {
    gradient: ['#059669', '#047857'],
    accent: '#34D399',
    text: '#FFFFFF'
  },
  fiction: {
    gradient: ['#3B82F6', '#6366F1'],
    accent: '#93C5FD',
    text: '#FFFFFF'
  },
  educational: {
    gradient: ['#0891B2', '#0E7490'],
    accent: '#67E8F9',
    text: '#FFFFFF'
  },
  philosophy: {
    gradient: ['#7C3AED', '#6D28D9'],
    accent: '#C4B5FD',
    text: '#FFFFFF'
  },
  hindi: {
    gradient: ['#EA580C', '#DC2626'],
    accent: '#FED7AA',
    text: '#FFFFFF'
  }
};

// Create detailed illustrations for each genre
function getGenreIllustration(genre) {
  switch(genre) {
    case 'fantasy':
      return `
        <!-- Dragon silhouette -->
        <g opacity="0.3">
          <path d="M-60,-40 Q-40,-60 -20,-50 L0,-45 L20,-50 Q40,-60 60,-40 L50,-20 L60,0 L50,20 L30,30 L0,40 L-30,30 L-50,20 L-60,0 L-50,-20 Z" fill="white"/>
          <path d="M-80,-30 Q-90,-40 -100,-30 Q-95,-20 -80,-25 Z" fill="white"/>
          <path d="M80,-30 Q90,-40 100,-30 Q95,-20 80,-25 Z" fill="white"/>
          <circle cx="0" cy="-30" r="15" fill="white"/>
          <path d="M0,40 L-10,60 L0,55 L10,60 Z" fill="white"/>
        </g>
        <!-- Stars -->
        ${Array.from({length: 5}, (_, i) => {
          const angle = (i * 72 - 90) * Math.PI / 180;
          const x = Math.cos(angle) * 80;
          const y = Math.sin(angle) * 80 - 20;
          return `<path d="M${x},${y} L${x+3},${y+8} L${x+10},${y+10} L${x+4},${y+15} L${x+2},${y+22} L${x},${y+16} L${x-2},${y+22} L${x-4},${y+15} L${x-10},${y+10} L${x-3},${y+8} Z" fill="white" opacity="0.2"/>`;
        }).join('')}`;
        
    case 'children':
      return `
        <!-- Teddy bear with details -->
        <g opacity="0.35">
          <circle cx="0" cy="-20" r="35" fill="white"/>
          <circle cx="-20" cy="-40" r="15" fill="white"/>
          <circle cx="20" cy="-40" r="15" fill="white"/>
          <ellipse cx="0" cy="25" rx="45" ry="55" fill="white"/>
          <ellipse cx="-30" cy="10" rx="20" ry="30" fill="white"/>
          <ellipse cx="30" cy="10" rx="20" ry="30" fill="white"/>
          <ellipse cx="-25" cy="50" rx="18" ry="25" fill="white"/>
          <ellipse cx="25" cy="50" rx="18" ry="25" fill="white"/>
          <!-- Face details -->
          <circle cx="-10" cy="-20" r="3" fill="${colorSchemes.children.gradient[0]}" opacity="0.5"/>
          <circle cx="10" cy="-20" r="3" fill="${colorSchemes.children.gradient[0]}" opacity="0.5"/>
          <ellipse cx="0" cy="-10" rx="5" ry="3" fill="${colorSchemes.children.gradient[0]}" opacity="0.5"/>
        </g>
        <!-- Balloons -->
        <g opacity="0.2">
          <ellipse cx="-60" cy="-60" rx="15" ry="20" fill="white"/>
          <path d="M-60,-40 L-60,-20" stroke="white" stroke-width="1"/>
          <ellipse cx="60" cy="-50" rx="12" ry="18" fill="white"/>
          <path d="M60,-32 L60,-10" stroke="white" stroke-width="1"/>
        </g>`;
        
    case 'romance':
      return `
        <!-- Detailed heart with flourishes -->
        <g opacity="0.35">
          <path d="M0,25 C0,-25 -50,-25 -50,0 C-50,35 0,85 0,85 C0,85 50,35 50,0 C50,-25 0,-25 0,25 Z" fill="white"/>
          <!-- Inner heart -->
          <path d="M0,35 C0,-5 -30,-5 -30,10 C-30,30 0,60 0,60 C0,60 30,30 30,10 C30,-5 0,-5 0,35 Z" fill="${colorSchemes.romance.gradient[0]}" opacity="0.3"/>
        </g>
        <!-- Rose petals -->
        <g opacity="0.2">
          ${Array.from({length: 6}, (_, i) => {
            const angle = i * 60 * Math.PI / 180;
            const x = Math.cos(angle) * 70;
            const y = Math.sin(angle) * 70;
            return `<ellipse cx="${x}" cy="${y}" rx="15" ry="8" transform="rotate(${i * 60} ${x} ${y})" fill="white"/>`;
          }).join('')}
        </g>`;
        
    case 'mystery':
      return `
        <!-- Magnifying glass with fingerprint -->
        <g opacity="0.3">
          <circle cx="0" cy="0" r="50" fill="none" stroke="white" stroke-width="6"/>
          <line x1="35" y1="35" x2="70" y2="70" stroke="white" stroke-width="6"/>
          <!-- Fingerprint pattern -->
          <circle cx="0" cy="0" r="10" fill="none" stroke="white" stroke-width="1" opacity="0.5"/>
          <circle cx="0" cy="0" r="18" fill="none" stroke="white" stroke-width="1" opacity="0.5"/>
          <circle cx="0" cy="0" r="26" fill="none" stroke="white" stroke-width="1" opacity="0.5"/>
          <circle cx="0" cy="0" r="34" fill="none" stroke="white" stroke-width="1" opacity="0.5"/>
        </g>
        <!-- Question marks -->
        <text x="-80" y="-40" font-size="30" fill="white" opacity="0.15">?</text>
        <text x="70" y="50" font-size="25" fill="white" opacity="0.15">?</text>`;
        
    case 'biography':
      return `
        <!-- Portrait silhouette with laurel -->
        <g opacity="0.35">
          <circle cx="0" cy="-15" r="35" fill="white"/>
          <ellipse cx="0" cy="35" rx="50" ry="40" fill="white"/>
          <!-- Laurel wreath -->
          <g opacity="0.5">
            ${Array.from({length: 8}, (_, i) => {
              const side = i < 4 ? -1 : 1;
              const index = i % 4;
              const x = side * (30 + index * 12);
              const y = -40 + index * 15;
              return `<ellipse cx="${x}" cy="${y}" rx="8" ry="4" transform="rotate(${side * 30} ${x} ${y})" fill="white"/>`;
            }).join('')}
          </g>
        </g>`;
        
    case 'educational':
      return `
        <!-- Open book with pages -->
        <g opacity="0.35">
          <path d="M-60,-30 L-60,40 L0,50 L60,40 L60,-30 L0,-20 Z" fill="white"/>
          <path d="M0,-20 L0,50" stroke="${colorSchemes.educational.gradient[0]}" stroke-width="2" opacity="0.5"/>
          <!-- Pages -->
          ${Array.from({length: 5}, (_, i) => `
            <line x1="${-50 + i * 10}" y1="${-25 + i * 2}" x2="${-50 + i * 10}" y2="${35 - i * 2}" stroke="white" stroke-width="0.5" opacity="0.3"/>
            <line x1="${10 + i * 10}" y1="${-25 + i * 2}" x2="${10 + i * 10}" y2="${35 - i * 2}" stroke="white" stroke-width="0.5" opacity="0.3"/>
          `).join('')}
        </g>
        <!-- Graduation cap -->
        <g opacity="0.2" transform="translate(0, -80)">
          <path d="M-40,0 L0,-15 L40,0 L0,15 Z" fill="white"/>
          <path d="M0,15 L0,30" stroke="white" stroke-width="3"/>
          <circle cx="0" cy="30" r="5" fill="white"/>
        </g>`;
        
    default:
      return `
        <!-- Abstract book shape -->
        <g opacity="0.3">
          <rect x="-50" y="-60" width="100" height="120" rx="5" fill="white"/>
          <rect x="-40" y="-50" width="80" height="15" fill="${colorSchemes.fiction.gradient[0]}" opacity="0.5"/>
          ${Array.from({length: 8}, (_, i) => `
            <rect x="-40" y="${-30 + i * 10}" width="${60 + Math.random() * 20}" height="2" fill="white" opacity="0.5"/>
          `).join('')}
        </g>`;
  }
}

// Generate enhanced SVG cover
function generateEnhancedSVGCover(title, author, genre) {
  const scheme = colorSchemes[genre] || colorSchemes.fiction;
  
  // Smart title wrapping
  const words = title.split(' ');
  const titleLines = [];
  let currentLine = '';
  
  for (const word of words) {
    if (currentLine.length + word.length > 25) {
      if (currentLine) titleLines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = currentLine ? `${currentLine} ${word}` : word;
    }
  }
  if (currentLine) titleLines.push(currentLine);
  
  // Limit to 2 lines
  if (titleLines.length > 2) {
    titleLines[1] = titleLines[1].substring(0, 20) + '...';
    titleLines.length = 2;
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="600" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Main gradient -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${scheme.gradient[0]};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${scheme.gradient[1]};stop-opacity:1" />
    </linearGradient>
    
    <!-- Radial highlight -->
    <radialGradient id="highlight">
      <stop offset="0%" style="stop-color:${scheme.accent};stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:${scheme.accent};stop-opacity:0" />
    </radialGradient>
    
    <!-- Text shadow -->
    <filter id="shadow">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-opacity="0.4"/>
    </filter>
    
    <!-- Glow effect -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <!-- Texture pattern -->
    <pattern id="texture" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <rect width="100" height="100" fill="${scheme.gradient[0]}" opacity="0.05"/>
      ${Array.from({length: 20}, () => {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        return `<circle cx="${x}" cy="${y}" r="0.5" fill="white" opacity="0.3"/>`;
      }).join('')}
    </pattern>
  </defs>
  
  <!-- Background -->
  <rect width="400" height="600" fill="url(#bg)" />
  
  <!-- Texture overlay -->
  <rect width="400" height="600" fill="url(#texture)" />
  
  <!-- Radial highlight -->
  <ellipse cx="200" cy="200" rx="250" ry="350" fill="url(#highlight)" />
  
  <!-- Top decorative line -->
  <rect x="0" y="0" width="400" height="2" fill="${scheme.accent}" opacity="0.6"/>
  
  <!-- Genre illustration -->
  <g transform="translate(200, 280)">
    ${getGenreIllustration(genre)}
  </g>
  
  <!-- Title background glow -->
  <ellipse cx="200" cy="450" rx="180" ry="60" fill="${scheme.accent}" opacity="0.1" filter="url(#glow)"/>
  
  <!-- Title -->
  ${titleLines.map((line, i) => `
  <text x="200" y="${440 + i * 40}" 
        font-family="Georgia, serif" 
        font-size="${titleLines.length > 1 ? 32 : 36}" 
        font-weight="bold" 
        fill="${scheme.text}" 
        text-anchor="middle" 
        filter="url(#shadow)">
    ${line}
  </text>`).join('')}
  
  <!-- Decorative divider -->
  <g transform="translate(200, ${titleLines.length > 1 ? 510 : 480})">
    <line x1="-60" y1="0" x2="-20" y2="0" stroke="${scheme.accent}" stroke-width="2" opacity="0.5"/>
    <circle cx="0" cy="0" r="3" fill="${scheme.accent}" opacity="0.5"/>
    <line x1="20" y1="0" x2="60" y2="0" stroke="${scheme.accent}" stroke-width="2" opacity="0.5"/>
  </g>
  
  <!-- Author -->
  <text x="200" y="550" 
        font-family="Georgia, serif" 
        font-size="20" 
        fill="${scheme.text}" 
        text-anchor="middle" 
        opacity="0.9">
    ${author.length > 30 ? author.substring(0, 27) + '...' : author}
  </text>
  
  <!-- Bottom decorative line -->
  <rect x="0" y="598" width="400" height="2" fill="${scheme.accent}" opacity="0.6"/>
  
  <!-- Corner decorations -->
  <g opacity="0.2">
    <path d="M20,20 L20,60 L60,20 Z" fill="${scheme.accent}"/>
    <path d="M380,20 L380,60 L340,20 Z" fill="${scheme.accent}"/>
    <path d="M20,580 L20,540 L60,580 Z" fill="${scheme.accent}"/>
    <path d="M380,580 L380,540 L340,580 Z" fill="${scheme.accent}"/>
  </g>
</svg>`;
}

// Main function
async function generateAllEnhancedCovers() {
  const booksDir = path.join(__dirname, '..', 'public', 'books');
  const coversDir = path.join(__dirname, '..', 'public', 'book-covers');
  
  // Ensure covers directory exists
  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
  }
  
  // Get all PDF files
  const files = fs.readdirSync(booksDir).filter(file => file.endsWith('.pdf'));
  
  console.log(`Found ${files.length} books. Generating enhanced covers...`);
  
  let generated = 0;
  
  for (const file of files) {
    const { title, author } = extractBookInfo(file);
    const genre = getBookGenre(file, title, author);
    
    const coverName = file.replace('.pdf', '.svg');
    const coverPath = path.join(coversDir, coverName);
    
    // Generate enhanced SVG cover
    const svg = generateEnhancedSVGCover(title, author, genre);
    fs.writeFileSync(coverPath, svg);
    
    generated++;
    if (generated % 20 === 0) {
      console.log(`Generated ${generated} enhanced covers...`);
    }
  }
  
  console.log(`\nComplete! Generated ${generated} enhanced book covers.`);
}

// Run the script
generateAllEnhancedCovers().catch(console.error);
