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
  
  // Fix specific titles
  const titleFixMap = {
    '12Th Fail': '12वीं फेल',
    'Wings of Fire': 'Wings of Fire',
    'Harry Potter': 'Harry Potter',
    'Can Love Happen Twice': 'Can Love Happen Twice?',
    'Half Girlfriend': 'Half Girlfriend',
    '2 States': '2 States',
    'One Night @ The Call Center': 'One Night @ The Call Center',
    'Five Point Someone': 'Five Point Someone',
    'The Girl in Room 105': 'The Girl in Room 105',
    'One Arranged Murder': 'One Arranged Murder',
    'One Indian Girl': 'One Indian Girl',
    'Revolution 2020': 'Revolution 2020',
    'Making India Awesome': 'Making India Awesome',
    'What Young India Wants': 'What Young India Wants',
    'India Positive': 'India Positive',
    'The Girl in Room 105': 'The Girl in Room 105'
  };
  
  for (const [key, value] of Object.entries(titleFixMap)) {
    if (title.toLowerCase().includes(key.toLowerCase())) {
      title = value;
      break;
    }
  }
  
  return { title, author };
}

// Generate AI-inspired scene based on book title and content
function generateAIScene(title, author) {
  const t = title.toLowerCase();
  const a = author.toLowerCase();
  
  // 12th Fail - Student studying scene (inspired by the example)
  if (t.includes('12th fail') || t.includes('12वीं फेल') || t.includes('fail')) {
    return `
      <!-- Vintage room interior with warm lighting -->
      <rect x="50" y="150" width="300" height="250" fill="#2C3E50" opacity="0.9"/>
      
      <!-- Window with city view -->
      <rect x="150" y="170" width="100" height="80" fill="#87CEEB"/>
      <rect x="145" y="165" width="110" height="90" fill="none" stroke="#8B4513" stroke-width="4"/>
      
      <!-- City skyline silhouette -->
      <path d="M160,220 L165,210 L170,215 L175,200 L180,205 L185,195 L190,200 L195,190 L200,195 L205,185 L210,190 L215,180 L220,185 L225,175 L230,180 L235,170 L240,175 L245,165 L250,170 L255,160 L260,165 L265,155 L270,160 L275,150 L280,155 L285,145 L290,150 L295,140 L300,145 L305,135 L310,140 L315,130 L320,135 L325,125 L330,130 L335,120 L340,125 L345,115 L350,120" fill="#2F4F4F" opacity="0.8"/>
      
      <!-- Desk with vintage lamp -->
      <rect x="100" y="280" width="200" height="100" fill="#8B4513"/>
      <rect x="90" y="380" width="15" height="40" fill="#654321"/>
      <rect x="285" y="380" width="15" height="40" fill="#654321"/>
      
      <!-- Student figure -->
      <ellipse cx="200" cy="260" rx="25" ry="30" fill="#D2B48C"/>
      <path d="M175,270 Q200,280 225,270 L230,340 L170,340 Z" fill="#556B2F"/>
      <path d="M200,280 L200,340" stroke="#D2B48C" stroke-width="8"/>
      <path d="M200,300 L180,320" stroke="#D2B48C" stroke-width="6"/>
      <path d="M200,300 L220,320" stroke="#D2B48C" stroke-width="6"/>
      
      <!-- Books stack -->
      <rect x="120" y="270" width="40" height="8" fill="#8B0000" transform="rotate(-5 140 274)"/>
      <rect x="125" y="265" width="40" height="8" fill="#00008B" transform="rotate(-3 145 269)"/>
      <rect x="130" y="260" width="40" height="8" fill="#006400" transform="rotate(-1 150 264)"/>
      <rect x="135" y="255" width="40" height="8" fill="#8B4513" transform="rotate(1 155 259)"/>
      
      <!-- Vintage oil lamp -->
      <ellipse cx="260" cy="270" rx="15" ry="5" fill="#FFD700"/>
      <path d="M260,270 L260,250 L250,230 L270,230 Z" fill="#F0E68C"/>
      <circle cx="260" cy="240" r="15" fill="#FFFACD" opacity="0.6"/>
      <path d="M260,240 L260,220" stroke="#8B4513" stroke-width="2"/>
      
      <!-- Papers and notes -->
      <rect x="200" y="275" width="30" height="20" fill="#FFFFFF" transform="rotate(10 215 285)"/>
      <rect x="210" y="270" width="30" height="20" fill="#FFFFFF" transform="rotate(5 225 280)"/>
      <rect x="220" y="265" width="30" height="20" fill="#FFFFFF" transform="rotate(-5 235 275)"/>
      
      <!-- Warm glow effect -->
      <ellipse cx="200" cy="280" rx="80" ry="60" fill="#FFD700" opacity="0.1"/>`;
  }
  
  // Wings of Fire - APJ Abdul Kalam with rocket and stars
  if (t.includes('wings of fire') || a.includes('kalam')) {
    return `
      <!-- Night sky gradient -->
      <rect x="50" y="150" width="300" height="250" fill="#1E3A8A"/>
      <rect x="50" y="300" width="300" height="100" fill="#FF8C00" opacity="0.3"/>
      
      <!-- Rocket launching with flames -->
      <g transform="translate(250, 250)">
        <path d="M0,-60 L-10,-40 L-10,20 L-5,30 L5,30 L10,20 L10,-40 Z" fill="#C0C0C0"/>
        <path d="M0,-60 L-5,-45 L0,-40 L5,-45 Z" fill="#FF0000"/>
        <ellipse cx="0" cy="30" rx="15" ry="25" fill="#FF4500" opacity="0.8"/>
        <ellipse cx="0" cy="35" rx="10" ry="20" fill="#FFD700" opacity="0.6"/>
        <ellipse cx="0" cy="40" rx="8" ry="15" fill="#FFFFFF" opacity="0.4"/>
      </g>
      
      <!-- Abdul Kalam figure -->
      <g transform="translate(150, 320)">
        <ellipse cx="0" cy="-20" rx="20" ry="25" fill="#D2B48C"/>
        <path d="M0,-45 Q-15,-50 -20,-45 Q-15,-35 0,-35 Q15,-35 20,-45 Q15,-50 0,-45" fill="#E0E0E0"/>
        <path d="M-20,0 Q0,10 20,0 L25,60 L-25,60 Z" fill="#FFFFFF"/>
        <rect x="-25" y="60" width="50" height="20" fill="#000080"/>
        <rect x="-20" y="80" width="40" height="15" fill="#000080"/>
      </g>
      
      <!-- Stars and constellations -->
      ${Array.from({length: 25}, () => {
        const x = 50 + Math.random() * 300;
        const y = 150 + Math.random() * 150;
        const size = 1 + Math.random() * 2;
        return `<circle cx="${x}" cy="${y}" r="${size}" fill="#FFFFFF" opacity="${0.6 + Math.random() * 0.4}"/>`;
      }).join('')}
      
      <!-- Constellation lines -->
      <g stroke="#FFFFFF" stroke-width="0.5" opacity="0.3">
        <line x1="80" y1="180" x2="100" y2="200"/>
        <line x1="100" y1="200" x2="120" y2="190"/>
        <line x1="300" y1="200" x2="320" y2="220"/>
        <line x1="320" y1="220" x2="340" y2="210"/>
      </g>`;
  }
  
  // Harry Potter - Magical castle scene
  if (t.includes('harry potter')) {
    return `
      <!-- Mystical night sky -->
      <rect x="50" y="150" width="300" height="250" fill="#191970"/>
      
      <!-- Hogwarts castle with towers -->
      <g opacity="0.9">
        <rect x="100" y="250" width="60" height="100" fill="#4B4B4D"/>
        <polygon points="100,250 130,220 160,250" fill="#2F4F4F"/>
        <rect x="200" y="240" width="50" height="110" fill="#4B4B4D"/>
        <polygon points="200,240 225,210 250,240" fill="#2F4F4F"/>
        <rect x="280" y="260" width="40" height="90" fill="#4B4B4D"/>
        <polygon points="280,260 300,230 320,260" fill="#2F4F4F"/>
        
        <!-- Castle windows with warm light -->
        <rect x="115" y="280" width="8" height="12" fill="#FFD700" opacity="0.8"/>
        <rect x="135" y="280" width="8" height="12" fill="#FFD700" opacity="0.8"/>
        <rect x="210" y="270" width="8" height="12" fill="#FFD700" opacity="0.8"/>
        <rect x="230" y="270" width="8" height="12" fill="#FFD700" opacity="0.8"/>
        <rect x="290" y="290" width="8" height="12" fill="#FFD700" opacity="0.8"/>
      </g>
      
      <!-- Flying wizard on broomstick -->
      <g transform="translate(200, 200)">
        <line x1="-30" y1="0" x2="30" y2="0" stroke="#8B4513" stroke-width="3"/>
        <ellipse cx="0" cy="-10" rx="8" ry="10" fill="#FFE4B5"/>
        <path d="M-10,-5 Q0,0 10,-5 L12,15 L-12,15 Z" fill="#000000"/>
        <polygon points="12,5 20,0 12,10" fill="#8B0000"/>
        <circle cx="0" cy="-10" r="2" fill="#00FF00"/>
        <path d="M30,0 L35,-3 L35,3 L30,0" fill="#D2691E"/>
        
        <!-- Magical trail -->
        <g opacity="0.6">
          <circle cx="-40" cy="5" r="3" fill="#FFD700"/>
          <circle cx="-50" cy="10" r="2" fill="#FFD700"/>
          <circle cx="-60" cy="15" r="1" fill="#FFD700"/>
        </g>
      </g>
      
      <!-- Full moon with mystical glow -->
      <circle cx="300" cy="200" r="30" fill="#F0F0F0" opacity="0.9"/>
      <circle cx="300" cy="200" r="40" fill="#F0F0F0" opacity="0.3"/>
      
      <!-- Magical stars -->
      ${Array.from({length: 30}, () => {
        const x = 50 + Math.random() * 300;
        const y = 150 + Math.random() * 100;
        return `<path d="M${x},${y} L${x+2},${y+6} L${x+8},${y+8} L${x+3},${y+12} L${x+1},${y+18} L${x},${y+12} L${x-1},${y+18} L${x-3},${y+12} L${x-8},${y+8} L${x-2},${y+6} Z" fill="#FFFFFF" opacity="${0.4 + Math.random() * 0.6}"/>`;
      }).join('')}`;
  }
  
  // Love stories - Romantic park scene
  if (t.includes('love') || t.includes('girlfriend') || t.includes('crush') || t.includes('romance')) {
    return `
      <!-- Sunset park scene -->
      <rect x="50" y="150" width="300" height="150" fill="#87CEEB"/>
      <rect x="50" y="300" width="300" height="100" fill="#90EE90"/>
      
      <!-- Sunset gradient -->
      <rect x="50" y="150" width="300" height="100" fill="#FF8C00" opacity="0.3"/>
      <rect x="50" y="150" width="300" height="50" fill="#FFD700" opacity="0.2"/>
      
      <!-- Cherry blossom tree -->
      <rect x="100" y="280" width="20" height="60" fill="#8B4513"/>
      <circle cx="110" cy="270" r="40" fill="#FFB6C1" opacity="0.8"/>
      ${Array.from({length: 15}, () => {
        const angle = Math.random() * 2 * Math.PI;
        const radius = 20 + Math.random() * 20;
        const x = 110 + Math.cos(angle) * radius;
        const y = 270 + Math.sin(angle) * radius;
        return `<circle cx="${x}" cy="${y}" r="${2 + Math.random() * 2}" fill="#FF69B4" opacity="0.7"/>`;
      }).join('')}
      
      <!-- Romantic bench -->
      <rect x="180" y="310" width="80" height="30" fill="#8B4513"/>
      <rect x="175" y="340" width="10" height="20" fill="#654321"/>
      <rect x="255" y="340" width="10" height="20" fill="#654321"/>
      
      <!-- Couple silhouette -->
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
      
      <!-- Floating hearts -->
      <g opacity="0.6">
        <path d="M120,200 C120,190 110,190 110,195 C110,200 120,210 120,210 C120,210 130,200 130,195 C130,190 120,190 120,200 Z" fill="#FF1493"/>
        <path d="M280,180 C280,170 270,170 270,175 C270,180 280,190 280,190 C280,190 290,180 290,175 C290,170 280,170 280,180 Z" fill="#FF1493"/>
        <path d="M150,220 C150,210 140,210 140,215 C140,220 150,230 150,230 C150,230 160,220 160,215 C160,210 150,210 150,220 Z" fill="#FF1493"/>
      </g>
      
      <!-- Rose petals falling -->
      ${Array.from({length: 8}, () => {
        const x = 100 + Math.random() * 200;
        const y = 150 + Math.random() * 100;
        return `<ellipse cx="${x}" cy="${y}" rx="3" ry="6" fill="#FF69B4" opacity="0.7" transform="rotate(${Math.random() * 360} ${x} ${y})"/>`;
      }).join('')}`;
  }
  
  // Mystery/Crime - Dark detective scene
  if (t.includes('mystery') || t.includes('crime') || t.includes('murder') || t.includes('detective')) {
    return `
      <!-- Dark alley with fog -->
      <rect x="50" y="150" width="300" height="250" fill="#1C1C1C"/>
      <rect x="80" y="150" width="80" height="250" fill="#2F2F2F"/>
      <rect x="240" y="150" width="80" height="250" fill="#2F2F2F"/>
      
      <!-- Fog effect -->
      <ellipse cx="200" cy="200" rx="150" ry="50" fill="#696969" opacity="0.3"/>
      <ellipse cx="200" cy="250" rx="120" ry="40" fill="#696969" opacity="0.2"/>
      <ellipse cx="200" cy="300" rx="100" ry="30" fill="#696969" opacity="0.1"/>
      
      <!-- Street lamp with warm glow -->
      <rect x="195" y="280" width="10" height="120" fill="#4F4F4F"/>
      <path d="M190,270 L210,270 L205,260 Z" fill="#FFD700"/>
      <ellipse cx="200" cy="290" rx="60" ry="20" fill="#FFD700" opacity="0.3"/>
      <ellipse cx="200" cy="290" rx="80" ry="30" fill="#FFD700" opacity="0.1"/>
      
      <!-- Detective silhouette with magnifying glass -->
      <g transform="translate(200, 340)">
        <ellipse cx="0" cy="-20" rx="15" ry="18" fill="#000000"/>
        <path d="M-15,-30 L15,-30 L10,-20 L-10,-20 Z" fill="#000000"/>
        <path d="M-20,0 Q0,10 20,0 L25,50 L-25,50 Z" fill="#000000"/>
        <path d="M25,20 L40,25" stroke="#000000" stroke-width="5"/>
        <circle cx="42" cy="25" r="8" fill="none" stroke="#000000" stroke-width="2"/>
        <circle cx="42" cy="25" r="3" fill="#FFD700" opacity="0.8"/>
      </g>
      
      <!-- Footprints in the fog -->
      <g opacity="0.5">
        <ellipse cx="150" cy="380" rx="8" ry="4" fill="#696969" transform="rotate(-10 150 380)"/>
        <ellipse cx="170" cy="375" rx="8" ry="4" fill="#696969" transform="rotate(10 170 375)"/>
        <ellipse cx="190" cy="370" rx="8" ry="4" fill="#696969" transform="rotate(-10 190 370)"/>
        <ellipse cx="210" cy="365" rx="8" ry="4" fill="#696969" transform="rotate(10 210 365)"/>
        <ellipse cx="230" cy="360" rx="8" ry="4" fill="#696969" transform="rotate(-10 230 360)"/>
        <ellipse cx="250" cy="355" rx="8" ry="4" fill="#696969" transform="rotate(10 250 355)"/>
      </g>
      
      <!-- Question marks floating in fog -->
      <text x="120" y="200" font-size="20" fill="#696969" opacity="0.3">?</text>
      <text x="280" y="180" font-size="15" fill="#696969" opacity="0.2">?</text>
      <text x="160" y="220" font-size="12" fill="#696969" opacity="0.2">?</text>`;
  }
  
  // Children's books - Playful scene
  if (t.includes('henry') && t.includes('mudge') || t.includes('children') || t.includes('fairy')) {
    return `
      <!-- Bright sunny day -->
      <rect x="50" y="150" width="300" height="150" fill="#87CEEB"/>
      <rect x="50" y="300" width="300" height="100" fill="#90EE90"/>
      
      <!-- Big cheerful sun -->
      <circle cx="320" cy="180" r="25" fill="#FFD700"/>
      ${Array.from({length: 12}, (_, i) => {
        const angle = i * 30 * Math.PI / 180;
        const x1 = 320 + Math.cos(angle) * 30;
        const y1 = 180 + Math.sin(angle) * 30;
        const x2 = 320 + Math.cos(angle) * 40;
        const y2 = 180 + Math.sin(angle) * 40;
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#FFD700" stroke-width="3"/>`;
      }).join('')}
      
      <!-- Happy boy -->
      <g transform="translate(150, 320)">
        <circle cx="0" cy="-20" r="12" fill="#FFE4B5"/>
        <path d="M-12,-5 Q0,0 12,-5 L15,30 L-15,30 Z" fill="#FF6347"/>
        <rect x="-10" y="30" width="8" height="20" fill="#4169E1"/>
        <rect x="2" y="30" width="8" height="20" fill="#4169E1"/>
        <circle cx="-3" cy="-20" r="1.5" fill="#000000"/>
        <circle cx="3" cy="-20" r="1.5" fill="#000000"/>
        <path d="M-3,-15 Q0,-13 3,-15" stroke="#000000" stroke-width="1" fill="none"/>
        <path d="M-8,-28 Q0,-30 8,-28" fill="#8B4513"/>
        
        <!-- Happy smile -->
        <path d="M-5,-10 Q0,-5 5,-10" stroke="#000000" stroke-width="1" fill="none"/>
      </g>
      
      <!-- Big friendly dog -->
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
        
        <!-- Happy dog smile -->
        <path d="M-15,-5 Q-10,0 -5,-5" stroke="#000000" stroke-width="1" fill="none"/>
      </g>
      
      <!-- Colorful balloons -->
      <g opacity="0.8">
        <ellipse cx="100" cy="200" rx="12" ry="18" fill="#FF6B6B"/>
        <path d="M100,218 L100,240" stroke="#8B4513" stroke-width="2"/>
        <ellipse cx="120" cy="190" rx="10" ry="15" fill="#4ECDC4"/>
        <path d="M120,205 L120,225" stroke="#8B4513" stroke-width="2"/>
        <ellipse cx="80" cy="180" rx="8" ry="12" fill="#45B7D1"/>
        <path d="M80,192 L80,210" stroke="#8B4513" stroke-width="2"/>
      </g>
      
      <!-- Butterflies -->
      ${Array.from({length: 4}, () => {
        const x = 100 + Math.random() * 200;
        const y = 200 + Math.random() * 50;
        return `
          <g transform="translate(${x}, ${y})">
            <ellipse cx="-5" cy="0" rx="8" ry="4" fill="#FF69B4" opacity="0.7"/>
            <ellipse cx="5" cy="0" rx="8" ry="4" fill="#FF69B4" opacity="0.7"/>
            <ellipse cx="-5" cy="0" rx="4" ry="2" fill="#FF1493" opacity="0.8"/>
            <ellipse cx="5" cy="0" rx="4" ry="2" fill="#FF1493" opacity="0.8"/>
            <line x1="0" y1="0" x2="0" y2="8" stroke="#8B4513" stroke-width="1"/>
          </g>
        `;
      }).join('')}`;
  }
  
  // Business/Educational - Modern office scene
  if (t.includes('learn') || t.includes('guide') || t.includes('business') || t.includes('money') || t.includes('success')) {
    return `
      <!-- Modern office setting -->
      <rect x="50" y="150" width="300" height="250" fill="#F8F9FA"/>
      
      <!-- Large window with city view -->
      <rect x="80" y="170" width="140" height="100" fill="#87CEEB"/>
      <rect x="75" y="165" width="150" height="110" fill="none" stroke="#2C3E50" stroke-width="3"/>
      
      <!-- City skyline -->
      <g fill="#2C3E50" opacity="0.7">
        <rect x="85" y="220" width="15" height="50"/>
        <rect x="105" y="200" width="20" height="70"/>
        <rect x="130" y="210" width="18" height="60"/>
        <rect x="155" y="190" width="25" height="80"/>
        <rect x="185" y="205" width="20" height="65"/>
        <rect x="210" y="215" width="15" height="55"/>
      </g>
      
      <!-- Modern desk -->
      <rect x="100" y="300" width="200" height="80" fill="#E8E8E8"/>
      <rect x="90" y="380" width="15" height="40" fill="#C0C0C0"/>
      <rect x="285" y="380" width="15" height="40" fill="#C0C0C0"/>
      
      <!-- Laptop -->
      <rect x="180" y="260" width="40" height="30" fill="#000000"/>
      <rect x="185" y="265" width="30" height="20" fill="#4169E1"/>
      <rect x="195" y="290" width="10" height="10" fill="#696969"/>
      <rect x="175" y="300" width="50" height="3" fill="#696969"/>
      
      <!-- Books and documents -->
      <rect x="130" y="285" width="35" height="6" fill="#8B0000"/>
      <rect x="130" y="279" width="35" height="6" fill="#00008B"/>
      <rect x="130" y="273" width="35" height="6" fill="#006400"/>
      <rect x="130" y="267" width="35" height="6" fill="#FF8C00"/>
      
      <!-- Charts and graphs on wall -->
      <rect x="250" y="180" width="60" height="40" fill="#FFFFFF" stroke="#2C3E50" stroke-width="1"/>
      <polyline points="260,210 270,200 280,205 290,195 300,200" stroke="#FF0000" stroke-width="2" fill="none"/>
      <line x1="255" y1="215" x2="305" y2="215" stroke="#2C3E50" stroke-width="1"/>
      <line x1="255" y1="185" x2="255" y2="215" stroke="#2C3E50" stroke-width="1"/>
      
      <!-- Coffee cup -->
      <ellipse cx="250" cy="285" rx="12" ry="4" fill="#8B4513"/>
      <path d="M238,285 L240,295 L260,295 L262,285" fill="#FFFFFF"/>
      <path d="M262,288 Q268,288 268,292 Q268,296 262,296" fill="none" stroke="#FFFFFF" stroke-width="2"/>
      
      <!-- Success symbols -->
      <g opacity="0.6">
        <path d="M320,200 L325,205 L335,195" stroke="#00FF00" stroke-width="3" fill="none"/>
        <circle cx="350" cy="180" r="15" fill="#FFD700" opacity="0.8"/>
        <text x="350" y="185" font-size="12" fill="#000000" text-anchor="middle">$</text>
      </g>`;
  }
  
  // Default library scene
  return `
    <!-- Classic library setting -->
    <rect x="50" y="150" width="300" height="250" fill="#8B4513"/>
    
    <!-- Grand bookshelf -->
    <rect x="80" y="180" width="240" height="180" fill="#654321"/>
    
    <!-- Books on shelf with varied colors -->
    ${Array.from({length: 15}, (_, i) => {
      const x = 90 + (i * 15);
      const colors = ['#8B0000', '#00008B', '#006400', '#FF8C00', '#4B0082', '#800080', '#2F4F4F', '#8B4513'];
      const color = colors[i % colors.length];
      const height = 30 + Math.random() * 20;
      const y = 230 - height;
      return `<rect x="${x}" y="${y}" width="13" height="${height}" fill="${color}"/>`;
    }).join('')}
    
    ${Array.from({length: 15}, (_, i) => {
      const x = 90 + (i * 15);
      const colors = ['#DC143C', '#191970', '#2E8B57', '#FF6347', '#6A0DAD', '#C71585', '#708090', '#A0522D'];
      const color = colors[i % colors.length];
      const height = 30 + Math.random() * 20;
      const y = 310 - height;
      return `<rect x="${x}" y="${y}" width="13" height="${height}" fill="${color}"/>`;
    }).join('')}
    
    <!-- Reading lamp with warm glow -->
    <g transform="translate(200, 360)">
      <rect x="-5" y="0" width="10" height="30" fill="#FFD700"/>
      <path d="M-15,-10 L15,-10 L10,0 L-10,0 Z" fill="#F0E68C"/>
      <ellipse cx="0" cy="-5" rx="20" ry="5" fill="#FFFACD" opacity="0.5"/>
      <ellipse cx="0" cy="-5" rx="30" ry="8" fill="#FFFACD" opacity="0.2"/>
    </g>
    
    <!-- Open book on table -->
    <g transform="translate(150, 320)">
      <path d="M-30,-20 L0,-25 L30,-20 L30,20 L0,25 L-30,20 Z" fill="#F5F5DC"/>
      <path d="M0,-25 L0,25" stroke="#8B4513" stroke-width="1"/>
      ${Array.from({length: 8}, (_, i) => `
        <line x1="${-25 + i * 3}" y1="${-20 + i * 2}" x2="${-25 + i * 3}" y2="${15 - i * 2}" stroke="#8B4513" stroke-width="0.5" opacity="0.5"/>
        <line x1="${5 + i * 3}" y1="${-20 + i * 2}" x2="${5 + i * 3}" y2="${15 - i * 2}" stroke="#8B4513" stroke-width="0.5" opacity="0.5"/>
      `).join('')}
    </g>`;
}

// Generate AI-inspired book cover with vintage aesthetic
function generateAICover(title, author, year = '2020') {
  const scene = generateAIScene(title, author);
  
  // Create vintage paper background color (inspired by the example)
  const bgColor = '#F5E6D3'; // Warm beige/cream color
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="600" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Paper texture filter -->
    <filter id="paperTexture">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" seed="5"/>
      <feDiffuseLighting in="noise" lighting-color="white" surfaceScale="1">
        <feDistantLight azimuth="45" elevation="60"/>
      </feDiffuseLighting>
    </filter>
    
    <!-- Vintage paper aging effect -->
    <filter id="vintagePaper">
      <feGaussianBlur in="SourceGraphic" stdDeviation="0.5"/>
      <feComponentTransfer>
        <feFuncA type="discrete" tableValues="0 .5 .5 .5 .5 .5 .5 .5 .5 .5 .5 .5 .5 .5 1"/>
      </feComponentTransfer>
    </filter>
    
    <!-- Drop shadow -->
    <filter id="shadow">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
    
    <!-- Text glow -->
    <filter id="textGlow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Vintage paper background -->
  <rect width="400" height="600" fill="${bgColor}"/>
  <rect width="400" height="600" fill="${bgColor}" filter="url(#paperTexture)" opacity="0.3"/>
  
  <!-- Decorative vintage border -->
  <g opacity="0.4">
    <!-- Top border with ornate pattern -->
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
  
  <!-- Title in elegant typography -->
  <text x="200" y="80" font-family="Georgia, serif" font-size="36" font-weight="bold" fill="#2C3E50" text-anchor="middle" filter="url(#shadow)">
    ${title.length > 25 ? title.substring(0, 22) + '...' : title}
  </text>
  
  <!-- Author subtitle -->
  <text x="200" y="110" font-family="Georgia, serif" font-size="18" fill="#5D4E37" text-anchor="middle">
    ${author}
  </text>
  
  <!-- Main illustration area with vintage frame -->
  <g>
    <clipPath id="vintageFrame">
      <rect x="50" y="150" width="300" height="250" rx="15" ry="15"/>
    </clipPath>
    
    <g clip-path="url(#vintageFrame)" filter="url(#vintagePaper)">
      ${scene}
    </g>
    
    <!-- Ornate frame around illustration -->
    <rect x="50" y="150" width="300" height="250" rx="15" ry="15" fill="none" stroke="#8B7355" stroke-width="4"/>
    
    <!-- Corner decorations -->
    <g opacity="0.6">
      <path d="M50,150 L70,150 L50,170 Z" fill="#8B7355"/>
      <path d="M350,150 L330,150 L350,170 Z" fill="#8B7355"/>
      <path d="M50,400 L70,400 L50,380 Z" fill="#8B7355"/>
      <path d="M350,400 L330,400 L350,380 Z" fill="#8B7355"/>
    </g>
  </g>
  
  <!-- Year badge -->
  <rect x="170" y="440" width="60" height="30" rx="15" ry="15" fill="#8B7355" opacity="0.3"/>
  <text x="200" y="460" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#5D4E37" text-anchor="middle">
    ${year}
  </text>
  
  <!-- Small decorative elements -->
  <g opacity="0.3">
    <circle cx="50" cy="50" r="3" fill="#8B7355"/>
    <circle cx="350" cy="50" r="3" fill="#8B7355"/>
    <circle cx="50" cy="550" r="3" fill="#8B7355"/>
    <circle cx="350" cy="550" r="3" fill="#8B7355"/>
    
    <!-- Small flourishes -->
    <path d="M30,100 Q40,100 40,110 Q40,120 30,120" fill="#8B7355"/>
    <path d="M370,100 Q360,100 360,110 Q360,120 370,120" fill="#8B7355"/>
    <path d="M30,480 Q40,480 40,490 Q40,500 30,500" fill="#8B7355"/>
    <path d="M370,480 Q360,480 360,490 Q360,500 370,500" fill="#8B7355"/>
  </g>
</svg>`;
}

// Main function - Generate AI covers for all books
async function generateAllAICovers() {
  const booksDir = path.join(__dirname, '..', 'public', 'books');
  const coversDir = path.join(__dirname, '..', 'public', 'book-covers');
  
  // Ensure covers directory exists
  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
  }
  
  // Get all PDF files
  const files = fs.readdirSync(booksDir).filter(file => file.endsWith('.pdf'));
  
  console.log(`Found ${files.length} books. Generating AI-inspired covers...`);
  
  let generated = 0;
  
  for (const file of files) {
    const { title, author } = extractBookInfo(file);
    
    // Generate year (random between 2015-2023 for variety)
    const year = (2015 + Math.floor(Math.random() * 9)).toString();
    
    const coverName = file.replace('.pdf', '.svg');
    const coverPath = path.join(coversDir, coverName);
    
    // Generate AI-inspired SVG cover
    const svg = generateAICover(title, author, year);
    fs.writeFileSync(coverPath, svg);
    
    generated++;
    if (generated % 20 === 0) {
      console.log(`Generated ${generated} AI covers...`);
    }
  }
  
  console.log(`\nComplete! Generated ${generated} AI-inspired book covers with detailed scenes.`);
}

// Run the script
generateAllAICovers().catch(console.error);
