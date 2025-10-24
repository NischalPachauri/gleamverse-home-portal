import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Extract book info
function extractBookInfo(filename) {
  let name = filename.replace('.pdf', '');
  let title = name;
  let author = 'Unknown Author';
  
  name = name.replace(/\s*\(.*?\)/g, '').replace(/\.epub$/i, '').replace(/_freebooksplanet\.com/g, '');
  
  if (name.includes(' by ')) {
    const parts = name.split(' by ');
    title = parts[0];
    author = parts[1];
  } else if (name.includes(' - ')) {
    const parts = name.split(' - ');
    title = parts[0];
    if (parts[1] && !parts[1].match(/^\d/)) {
      author = parts[1];
    }
  }
  
  title = title.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  author = author.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  title = title.replace(/^\d+\s+/, '');
  
  return { title, author };
}

// Generate detailed illustrated scenes based on book title
function getIllustratedScene(title, author) {
  const t = title.toLowerCase();
  
  // 12th Fail - Student studying scene
  if (t.includes('12th fail') || t.includes('fail')) {
    return `
      <!-- Room interior -->
      <rect x="50" y="150" width="300" height="250" fill="#2C3E50" opacity="0.9"/>
      
      <!-- Window with India Gate view -->
      <rect x="150" y="170" width="100" height="80" fill="#87CEEB"/>
      <rect x="145" y="165" width="110" height="90" fill="none" stroke="#8B4513" stroke-width="4"/>
      <!-- India Gate silhouette -->
      <path d="M200,220 L195,210 L195,195 L190,195 L190,190 L210,190 L210,195 L205,195 L205,210 Z" fill="#D2691E" opacity="0.7"/>
      
      <!-- Desk -->
      <rect x="100" y="280" width="200" height="100" fill="#8B4513"/>
      <rect x="90" y="380" width="15" height="40" fill="#654321"/>
      <rect x="285" y="380" width="15" height="40" fill="#654321"/>
      
      <!-- Student studying -->
      <ellipse cx="200" cy="260" rx="25" ry="30" fill="#D2B48C"/>
      <path d="M175,270 Q200,280 225,270 L230,340 L170,340 Z" fill="#556B2F"/>
      <path d="M200,280 L200,340" stroke="#D2B48C" stroke-width="8"/>
      <path d="M200,300 L180,320" stroke="#D2B48C" stroke-width="6"/>
      <path d="M200,300 L220,320" stroke="#D2B48C" stroke-width="6"/>
      
      <!-- Books on desk -->
      <rect x="120" y="270" width="40" height="8" fill="#8B0000" transform="rotate(-5 140 274)"/>
      <rect x="125" y="265" width="40" height="8" fill="#00008B" transform="rotate(-3 145 269)"/>
      <rect x="130" y="260" width="40" height="8" fill="#006400" transform="rotate(-1 150 264)"/>
      
      <!-- Lamp -->
      <ellipse cx="260" cy="270" rx="15" ry="5" fill="#FFD700"/>
      <path d="M260,270 L260,250 L250,230 L270,230 Z" fill="#F0E68C"/>
      <circle cx="260" cy="240" r="15" fill="#FFFACD" opacity="0.6"/>
      
      <!-- Papers -->
      <rect x="200" y="275" width="30" height="20" fill="#FFFFFF" transform="rotate(10 215 285)"/>
      <rect x="210" y="270" width="30" height="20" fill="#FFFFFF" transform="rotate(5 225 280)"/>`;
  }
  
  // Wings of Fire - APJ Abdul Kalam with rocket
  if (t.includes('wings of fire') || (author.toLowerCase().includes('kalam'))) {
    return `
      <!-- Sky gradient -->
      <rect x="50" y="150" width="300" height="250" fill="#1E3A8A"/>
      <rect x="50" y="300" width="300" height="100" fill="#FF8C00" opacity="0.5"/>
      
      <!-- Rocket launching -->
      <g transform="translate(250, 250)">
        <path d="M0,-60 L-10,-40 L-10,20 L-5,30 L5,30 L10,20 L10,-40 Z" fill="#C0C0C0"/>
        <path d="M0,-60 L-5,-45 L0,-40 L5,-45 Z" fill="#FF0000"/>
        <ellipse cx="0" cy="30" rx="15" ry="25" fill="#FF4500" opacity="0.8"/>
        <ellipse cx="0" cy="35" rx="10" ry="20" fill="#FFD700" opacity="0.6"/>
      </g>
      
      <!-- Abdul Kalam figure -->
      <g transform="translate(150, 320)">
        <ellipse cx="0" cy="-20" rx="20" ry="25" fill="#D2B48C"/>
        <path d="M0,-45 Q-15,-50 -20,-45 Q-15,-35 0,-35 Q15,-35 20,-45 Q15,-50 0,-45" fill="#E0E0E0"/>
        <path d="M-20,0 Q0,10 20,0 L25,60 L-25,60 Z" fill="#FFFFFF"/>
        <rect x="-25" y="60" width="50" height="20" fill="#000080"/>
      </g>
      
      <!-- Stars -->
      ${Array.from({length: 15}, () => {
        const x = 50 + Math.random() * 300;
        const y = 150 + Math.random() * 100;
        return `<circle cx="${x}" cy="${y}" r="1" fill="#FFFFFF"/>`;
      }).join('')}`;
  }
  
  // Harry Potter - Wizard with castle
  if (t.includes('harry potter')) {
    return `
      <!-- Night sky -->
      <rect x="50" y="150" width="300" height="250" fill="#191970"/>
      
      <!-- Hogwarts castle -->
      <g opacity="0.8">
        <rect x="100" y="250" width="60" height="100" fill="#4B4B4D"/>
        <polygon points="100,250 130,220 160,250" fill="#2F4F4F"/>
        <rect x="200" y="240" width="50" height="110" fill="#4B4B4D"/>
        <polygon points="200,240 225,210 250,240" fill="#2F4F4F"/>
        <rect x="280" y="260" width="40" height="90" fill="#4B4B4D"/>
        <polygon points="280,260 300,230 320,260" fill="#2F4F4F"/>
      </g>
      
      <!-- Flying wizard on broomstick -->
      <g transform="translate(200, 200)">
        <line x1="-30" y1="0" x2="30" y2="0" stroke="#8B4513" stroke-width="3"/>
        <ellipse cx="0" cy="-10" rx="8" ry="10" fill="#FFE4B5"/>
        <path d="M-10,-5 Q0,0 10,-5 L12,15 L-12,15 Z" fill="#000000"/>
        <polygon points="12,5 20,0 12,10" fill="#8B0000"/>
        <circle cx="0" cy="-10" r="2" fill="#00FF00"/>
        <path d="M30,0 L35,-3 L35,3 L30,0" fill="#D2691E"/>
      </g>
      
      <!-- Moon -->
      <circle cx="300" cy="200" r="30" fill="#F0F0F0" opacity="0.9"/>
      
      <!-- Stars -->
      ${Array.from({length: 20}, () => {
        const x = 50 + Math.random() * 300;
        const y = 150 + Math.random() * 100;
        return `<circle cx="${x}" cy="${y}" r="0.5" fill="#FFFFFF"/>`;
      }).join('')}`;
  }
  
  // Love stories
  if (t.includes('love') || t.includes('girlfriend') || t.includes('crush')) {
    return `
      <!-- Park scene -->
      <rect x="50" y="150" width="300" height="250" fill="#87CEEB"/>
      <rect x="50" y="320" width="300" height="80" fill="#90EE90"/>
      
      <!-- Tree -->
      <rect x="100" y="280" width="20" height="60" fill="#8B4513"/>
      <circle cx="110" cy="270" r="40" fill="#228B22" opacity="0.8"/>
      
      <!-- Bench -->
      <rect x="180" y="310" width="80" height="30" fill="#8B4513"/>
      <rect x="175" y="340" width="10" height="20" fill="#654321"/>
      <rect x="255" y="340" width="10" height="20" fill="#654321"/>
      
      <!-- Couple on bench -->
      <g transform="translate(200, 300)">
        <!-- Girl -->
        <circle cx="-10" cy="-10" r="8" fill="#FFE4B5"/>
        <path d="M-18,-5 Q-10,0 -2,-5 L0,20 L-20,20 Z" fill="#FF69B4"/>
        <path d="M-10,-18 Q-15,-20 -18,-18 Q-15,-10 -10,-10 Q-5,-10 -2,-18 Q-5,-20 -10,-18" fill="#8B4513"/>
        
        <!-- Boy -->
        <circle cx="10" cy="-10" r="8" fill="#FFE4B5"/>
        <path d="M2,-5 Q10,0 18,-5 L20,20 L0,20 Z" fill="#4169E1"/>
        <path d="M10,-18 Q8,-19 6,-18 Q8,-12 10,-12 Q12,-12 14,-18 Q12,-19 10,-18" fill="#000000"/>
      </g>
      
      <!-- Heart -->
      <path d="M220,250 C220,240 210,240 210,245 C210,250 220,260 220,260 C220,260 230,250 230,245 C230,240 220,240 220,250 Z" fill="#FF1493" opacity="0.6"/>`;
  }
  
  // Mystery/Crime
  if (t.includes('mystery') || t.includes('crime') || t.includes('murder') || t.includes('detective')) {
    return `
      <!-- Dark alley -->
      <rect x="50" y="150" width="300" height="250" fill="#1C1C1C"/>
      <rect x="80" y="150" width="80" height="250" fill="#2F2F2F"/>
      <rect x="240" y="150" width="80" height="250" fill="#2F2F2F"/>
      
      <!-- Street lamp -->
      <rect x="195" y="280" width="10" height="120" fill="#4F4F4F"/>
      <path d="M190,270 L210,270 L205,260 Z" fill="#FFD700"/>
      <ellipse cx="200" cy="290" rx="60" ry="20" fill="#FFD700" opacity="0.3"/>
      
      <!-- Detective silhouette -->
      <g transform="translate(200, 340)">
        <ellipse cx="0" cy="-20" rx="15" ry="18" fill="#000000"/>
        <path d="M-15,-30 L15,-30 L10,-20 L-10,-20 Z" fill="#000000"/>
        <path d="M-20,0 Q0,10 20,0 L25,50 L-25,50 Z" fill="#000000"/>
        <path d="M25,20 L40,25" stroke="#000000" stroke-width="5"/>
        <circle cx="42" cy="25" r="8" fill="none" stroke="#000000" stroke-width="2"/>
      </g>
      
      <!-- Footprints -->
      <g opacity="0.5">
        <ellipse cx="150" cy="380" rx="8" ry="4" fill="#696969" transform="rotate(-10 150 380)"/>
        <ellipse cx="170" cy="375" rx="8" ry="4" fill="#696969" transform="rotate(10 170 375)"/>
        <ellipse cx="190" cy="370" rx="8" ry="4" fill="#696969" transform="rotate(-10 190 370)"/>
      </g>`;
  }
  
  // Children's books
  if (t.includes('henry') && t.includes('mudge')) {
    return `
      <!-- Sky and grass -->
      <rect x="50" y="150" width="300" height="150" fill="#87CEEB"/>
      <rect x="50" y="300" width="300" height="100" fill="#90EE90"/>
      
      <!-- Sun -->
      <circle cx="320" cy="180" r="25" fill="#FFD700"/>
      ${Array.from({length: 8}, (_, i) => {
        const angle = i * 45 * Math.PI / 180;
        const x1 = 320 + Math.cos(angle) * 30;
        const y1 = 180 + Math.sin(angle) * 30;
        const x2 = 320 + Math.cos(angle) * 40;
        const y2 = 180 + Math.sin(angle) * 40;
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#FFD700" stroke-width="3"/>`;
      }).join('')}
      
      <!-- Boy -->
      <g transform="translate(150, 320)">
        <circle cx="0" cy="-20" r="12" fill="#FFE4B5"/>
        <path d="M-12,-5 Q0,0 12,-5 L15,30 L-15,30 Z" fill="#FF6347"/>
        <rect x="-10" y="30" width="8" height="20" fill="#4169E1"/>
        <rect x="2" y="30" width="8" height="20" fill="#4169E1"/>
        <circle cx="-3" cy="-20" r="1.5" fill="#000000"/>
        <circle cx="3" cy="-20" r="1.5" fill="#000000"/>
        <path d="M-3,-15 Q0,-13 3,-15" stroke="#000000" stroke-width="1" fill="none"/>
        <path d="M-8,-28 Q0,-30 8,-28" fill="#8B4513"/>
      </g>
      
      <!-- Dog -->
      <g transform="translate(220, 330)">
        <ellipse cx="0" cy="0" rx="35" ry="25" fill="#D2691E"/>
        <ellipse cx="-25" cy="-10" rx="15" ry="18" fill="#D2691E"/>
        <path d="M-35,-20 Q-30,-25 -25,-20" fill="#8B4513"/>
        <path d="M-25,-20 Q-20,-25 -15,-20" fill="#8B4513"/>
        <rect x="-15" y="15" width="6" height="15" fill="#D2691E"/>
        <rect x="-5" y="15" width="6" height="15" fill="#D2691E"/>
        <rect x="10" y="15" width="6" height="15" fill="#D2691E"/>
        <rect x="20" y="15" width="6" height="15" fill="#D2691E"/>
        <path d="M30,0 Q35,5 32,10" stroke="#D2691E" stroke-width="4" fill="none"/>
        <circle cx="-30" cy="-8" r="2" fill="#000000"/>
        <circle cx="-20" cy="-8" r="2" fill="#000000"/>
        <ellipse cx="-25" cy="-3" rx="3" ry="2" fill="#000000"/>
      </g>`;
  }
  
  // Educational/Business books
  if (t.includes('learn') || t.includes('guide') || t.includes('business') || t.includes('money')) {
    return `
      <!-- Office setting -->
      <rect x="50" y="150" width="300" height="250" fill="#F0F0F0"/>
      
      <!-- Desk -->
      <rect x="100" y="300" width="200" height="80" fill="#8B4513"/>
      
      <!-- Computer -->
      <rect x="180" y="260" width="40" height="30" fill="#000000"/>
      <rect x="185" y="265" width="30" height="20" fill="#4169E1"/>
      <rect x="195" y="290" width="10" height="10" fill="#696969"/>
      <rect x="175" y="300" width="50" height="3" fill="#696969"/>
      
      <!-- Books stack -->
      <rect x="130" y="285" width="35" height="6" fill="#8B0000"/>
      <rect x="130" y="279" width="35" height="6" fill="#00008B"/>
      <rect x="130" y="273" width="35" height="6" fill="#006400"/>
      <rect x="130" y="267" width="35" height="6" fill="#FF8C00"/>
      
      <!-- Chart on wall -->
      <rect x="250" y="180" width="60" height="40" fill="#FFFFFF" stroke="#000000" stroke-width="1"/>
      <polyline points="260,210 270,200 280,205 290,195 300,200" stroke="#FF0000" stroke-width="2" fill="none"/>
      <line x1="255" y1="215" x2="305" y2="215" stroke="#000000" stroke-width="1"/>
      <line x1="255" y1="185" x2="255" y2="215" stroke="#000000" stroke-width="1"/>
      
      <!-- Coffee cup -->
      <ellipse cx="250" cy="285" rx="12" ry="4" fill="#8B4513"/>
      <path d="M238,285 L240,295 L260,295 L262,285" fill="#FFFFFF"/>
      <path d="M262,288 Q268,288 268,292 Q268,296 262,296" fill="none" stroke="#FFFFFF" stroke-width="2"/>`;
  }
  
  // Default book scene
  return `
    <!-- Library setting -->
    <rect x="50" y="150" width="300" height="250" fill="#8B4513"/>
    
    <!-- Bookshelf -->
    <rect x="80" y="180" width="240" height="180" fill="#654321"/>
    
    <!-- Books on shelf -->
    ${Array.from({length: 12}, (_, i) => {
      const x = 90 + (i * 20);
      const colors = ['#8B0000', '#00008B', '#006400', '#FF8C00', '#4B0082', '#800080'];
      const color = colors[i % colors.length];
      const height = 30 + Math.random() * 20;
      const y = 230 - height;
      return `<rect x="${x}" y="${y}" width="18" height="${height}" fill="${color}"/>`;
    }).join('')}
    
    ${Array.from({length: 12}, (_, i) => {
      const x = 90 + (i * 20);
      const colors = ['#DC143C', '#191970', '#2E8B57', '#FF6347', '#6A0DAD', '#C71585'];
      const color = colors[i % colors.length];
      const height = 30 + Math.random() * 20;
      const y = 310 - height;
      return `<rect x="${x}" y="${y}" width="18" height="${height}" fill="${color}"/>`;
    }).join('')}
    
    <!-- Reading lamp -->
    <g transform="translate(200, 360)">
      <rect x="-5" y="0" width="10" height="30" fill="#FFD700"/>
      <path d="M-15,-10 L15,-10 L10,0 L-10,0 Z" fill="#F0E68C"/>
      <ellipse cx="0" cy="-5" rx="20" ry="5" fill="#FFFACD" opacity="0.5"/>
    </g>`;
}

// Generate illustrated book cover
function generateIllustratedCover(title, author, year = '2020') {
  const scene = getIllustratedScene(title, author);
  
  // Create vintage background color
  const bgColor = '#F5E6D3'; // Beige/cream color like old paper
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="600" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Paper texture -->
    <filter id="paperTexture">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" seed="5"/>
      <feDiffuseLighting in="noise" lighting-color="white" surfaceScale="1">
        <feDistantLight azimuth="45" elevation="60"/>
      </feDiffuseLighting>
    </filter>
    
    <!-- Old paper effect -->
    <filter id="oldPaper">
      <feGaussianBlur in="SourceGraphic" stdDeviation="0.5"/>
      <feComponentTransfer>
        <feFuncA type="discrete" tableValues="0 .5 .5 .5 .5 .5 .5 .5 .5 .5 .5 .5 .5 .5 1"/>
      </feComponentTransfer>
    </filter>
    
    <!-- Drop shadow -->
    <filter id="shadow">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Vintage paper background -->
  <rect width="400" height="600" fill="${bgColor}"/>
  <rect width="400" height="600" fill="${bgColor}" filter="url(#paperTexture)" opacity="0.3"/>
  
  <!-- Decorative border -->
  <g opacity="0.3">
    <!-- Top border with leaves -->
    ${Array.from({length: 20}, (_, i) => {
      const x = i * 20 + 10;
      return `<path d="M${x},10 Q${x+5},5 ${x+10},10 Q${x+5},15 ${x},10" fill="#8B7355"/>`;
    }).join('')}
    
    <!-- Bottom border -->
    ${Array.from({length: 20}, (_, i) => {
      const x = i * 20 + 10;
      return `<path d="M${x},590 Q${x+5},585 ${x+10},590 Q${x+5},595 ${x},590" fill="#8B7355"/>`;
    }).join('')}
    
    <!-- Side borders -->
    ${Array.from({length: 30}, (_, i) => {
      const y = i * 20 + 10;
      return `
        <path d="M10,${y} Q5,${y+5} 10,${y+10} Q15,${y+5} 10,${y}" fill="#8B7355"/>
        <path d="M390,${y} Q385,${y+5} 390,${y+10} Q395,${y+5} 390,${y}" fill="#8B7355"/>
      `;
    }).join('')}
  </g>
  
  <!-- Title in Hindi/Devanagari style if applicable -->
  <text x="200" y="80" font-family="Arial, sans-serif" font-size="42" font-weight="bold" fill="#2C3E50" text-anchor="middle" filter="url(#shadow)">
    ${title.length > 20 ? title.substring(0, 17) + '...' : title}
  </text>
  
  <!-- Subtitle/Author -->
  <text x="200" y="110" font-family="Georgia, serif" font-size="18" fill="#5D4E37" text-anchor="middle">
    ${author}
  </text>
  
  <!-- Main illustration area with rounded corners -->
  <g>
    <clipPath id="roundedRect">
      <rect x="50" y="150" width="300" height="250" rx="15" ry="15"/>
    </clipPath>
    
    <g clip-path="url(#roundedRect)" filter="url(#oldPaper)">
      ${scene}
    </g>
    
    <!-- Frame around illustration -->
    <rect x="50" y="150" width="300" height="250" rx="15" ry="15" fill="none" stroke="#8B7355" stroke-width="4"/>
  </g>
  
  <!-- Year at bottom -->
  <rect x="170" y="440" width="60" height="30" rx="15" ry="15" fill="#8B7355" opacity="0.2"/>
  <text x="200" y="460" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#5D4E37" text-anchor="middle">
    ${year}
  </text>
  
  <!-- Small decorative elements -->
  <g opacity="0.2">
    <circle cx="50" cy="50" r="3" fill="#8B7355"/>
    <circle cx="350" cy="50" r="3" fill="#8B7355"/>
    <circle cx="50" cy="550" r="3" fill="#8B7355"/>
    <circle cx="350" cy="550" r="3" fill="#8B7355"/>
  </g>
</svg>`;
}

// Main function - Generate covers for 10 random books
async function generateTenIllustratedCovers() {
  const booksDir = path.join(__dirname, '..', 'public', 'books');
  const coversDir = path.join(__dirname, '..', 'public', 'book-covers');
  
  // Ensure covers directory exists
  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
  }
  
  // Get all PDF files
  const files = fs.readdirSync(booksDir).filter(file => file.endsWith('.pdf'));
  
  // Select 10 specific books that will have good illustrations
  const selectedBooks = [
    '12Th Fail (Hindi Novel).pdf',
    'Wings of Fire_ An Autobiography of APJ Abdul Kalam.pdf',
    'harry-potter-1-philosophers-stone.pdf',
    'Can Love Happen Twice_ - Ravinder Singh_freebooksplanet.com.pdf',
    '01_Henry_and_Mudge_The_First_Book_of_Their_Adventures_1987.pdf',
    'The_Girl_in_Room_105_by_Chetan_Bhagat.pdf',
    'How to Win Every Argument ( PDF).pdf',
    'Crime and Punishment -  Fyodor Dostoyevsky.pdf',
    'Half Girlfriend by Chetan Bhagat.pdf',
    'Rich_Dads_Increase_Your_Financial_IQ_Get_Smarter_with_Your_Money.pdf'
  ].filter(book => files.includes(book));
  
  // If we don't have all selected books, pick random ones
  while (selectedBooks.length < 10 && selectedBooks.length < files.length) {
    const randomFile = files[Math.floor(Math.random() * files.length)];
    if (!selectedBooks.includes(randomFile)) {
      selectedBooks.push(randomFile);
    }
  }
  
  console.log(`Generating illustrated covers for ${selectedBooks.length} books...`);
  
  for (const file of selectedBooks) {
    const { title, author } = extractBookInfo(file);
    
    // Generate year (random between 2015-2023 for variety)
    const year = (2015 + Math.floor(Math.random() * 9)).toString();
    
    const coverName = file.replace('.pdf', '.svg');
    const coverPath = path.join(coversDir, coverName);
    
    // Generate illustrated SVG cover
    const svg = generateIllustratedCover(title, author, year);
    fs.writeFileSync(coverPath, svg);
    
    console.log(`Generated illustrated cover for: ${title}`);
  }
  
  console.log(`\nComplete! Generated ${selectedBooks.length} illustrated book covers with scenes.`);
}

// Run the script
generateTenIllustratedCovers().catch(console.error);
