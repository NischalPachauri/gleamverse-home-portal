// Book cover generator utility
// Generates beautiful, unique covers for books based on their metadata

interface BookCoverConfig {
  title: string;
  author: string;
  genre?: string;
  id: string;
}

// Color palettes for different genres
const genreColors: Record<string, string[]> = {
  'Fantasy': ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95'],
  'Fiction': ['#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A'],
  'Romance': ['#EC4899', '#DB2777', '#BE185D', '#9F1239', '#881337'],
  'Mystery': ['#6B7280', '#4B5563', '#374151', '#1F2937', '#111827'],
  'Biography': ['#10B981', '#059669', '#047857', '#065F46', '#064E3B'],
  'Philosophy': ['#A78BFA', '#9333EA', '#7E22CE', '#6B21A8', '#581C87'],
  "Children's": ['#FBBF24', '#F59E0B', '#D97706', '#B45309', '#92400E'],
  'Non-Fiction': ['#06B6D4', '#0891B2', '#0E7490', '#155E75', '#164E63'],
  'History': ['#F97316', '#EA580C', '#C2410C', '#9A3412', '#7C2D12'],
  'Science': ['#84CC16', '#65A30D', '#4D7C0F', '#3F6212', '#365314'],
  'Business': ['#6366F1', '#4F46E5', '#4338CA', '#3730A3', '#312E81'],
  'Educational': ['#14B8A6', '#0D9488', '#0F766E', '#115E59', '#134E4A'],
  'Thriller': ['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'],
  'Adventure': ['#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F'],
  'default': ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899']
};

// Pattern types for book covers
const patterns = [
  'diagonal-lines',
  'dots',
  'waves',
  'circles',
  'hexagons',
  'triangles',
  'squares',
  'cross',
  'zigzag',
  'stars'
];

// Generate a deterministic hash from string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Get color palette based on genre
function getColorPalette(genre?: string): string[] {
  if (genre && genreColors[genre]) {
    return genreColors[genre];
  }
  return genreColors.default;
}

// Generate pattern based on book ID
function generatePattern(id: string, color: string): string {
  const hash = hashString(id);
  const patternType = patterns[hash % patterns.length];
  const opacity = 0.1 + (hash % 20) / 100; // 0.1 to 0.3 opacity
  
  switch (patternType) {
    case 'diagonal-lines':
      return `
        <pattern id="pattern-${id}" patternUnits="userSpaceOnUse" width="10" height="10">
          <path d="M0,10 L10,0" stroke="${color}" stroke-width="1" opacity="${opacity}"/>
        </pattern>
      `;
    case 'dots':
      return `
        <pattern id="pattern-${id}" patternUnits="userSpaceOnUse" width="20" height="20">
          <circle cx="10" cy="10" r="2" fill="${color}" opacity="${opacity}"/>
        </pattern>
      `;
    case 'waves':
      return `
        <pattern id="pattern-${id}" patternUnits="userSpaceOnUse" width="40" height="20">
          <path d="M0,10 Q10,0 20,10 T40,10" stroke="${color}" fill="none" stroke-width="1" opacity="${opacity}"/>
        </pattern>
      `;
    case 'circles':
      return `
        <pattern id="pattern-${id}" patternUnits="userSpaceOnUse" width="30" height="30">
          <circle cx="15" cy="15" r="10" fill="none" stroke="${color}" stroke-width="1" opacity="${opacity}"/>
        </pattern>
      `;
    case 'hexagons':
      return `
        <pattern id="pattern-${id}" patternUnits="userSpaceOnUse" width="30" height="26">
          <polygon points="15,2 27,8 27,20 15,26 3,20 3,8" fill="none" stroke="${color}" stroke-width="1" opacity="${opacity}"/>
        </pattern>
      `;
    case 'triangles':
      return `
        <pattern id="pattern-${id}" patternUnits="userSpaceOnUse" width="20" height="20">
          <polygon points="10,2 18,16 2,16" fill="none" stroke="${color}" stroke-width="1" opacity="${opacity}"/>
        </pattern>
      `;
    case 'squares':
      return `
        <pattern id="pattern-${id}" patternUnits="userSpaceOnUse" width="20" height="20">
          <rect x="2" y="2" width="16" height="16" fill="none" stroke="${color}" stroke-width="1" opacity="${opacity}"/>
        </pattern>
      `;
    case 'cross':
      return `
        <pattern id="pattern-${id}" patternUnits="userSpaceOnUse" width="20" height="20">
          <path d="M10,0 L10,20 M0,10 L20,10" stroke="${color}" stroke-width="1" opacity="${opacity}"/>
        </pattern>
      `;
    case 'zigzag':
      return `
        <pattern id="pattern-${id}" patternUnits="userSpaceOnUse" width="20" height="10">
          <path d="M0,5 L5,0 L10,5 L15,0 L20,5" stroke="${color}" fill="none" stroke-width="1" opacity="${opacity}"/>
        </pattern>
      `;
    case 'stars':
      return `
        <pattern id="pattern-${id}" patternUnits="userSpaceOnUse" width="30" height="30">
          <path d="M15,2 L17,9 L24,9 L18,13 L21,20 L15,16 L9,20 L12,13 L6,9 L13,9 Z" fill="${color}" opacity="${opacity}"/>
        </pattern>
      `;
    default:
      return '';
  }
}

// Generate SVG book cover
export function generateBookCoverSVG(config: BookCoverConfig): string {
  const { title, author, genre, id } = config;
  const colors = getColorPalette(genre);
  const hash = hashString(id + title);
  
  // Select colors based on hash
  const primaryColor = colors[hash % colors.length];
  const secondaryColor = colors[(hash + 1) % colors.length];
  const accentColor = colors[(hash + 2) % colors.length];
  
  // Generate gradient angle based on hash
  const gradientAngle = (hash % 8) * 45;
  
  // Generate pattern
  const pattern = generatePattern(id, accentColor);
  
  // Format title for display (wrap long titles)
  const titleLines = [];
  const words = title.split(' ');
  let currentLine = '';
  
  for (const word of words) {
    if (currentLine.length + word.length > 20) {
      if (currentLine) titleLines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = currentLine ? `${currentLine} ${word}` : word;
    }
  }
  if (currentLine) titleLines.push(currentLine);
  
  // Limit to 3 lines
  const displayTitleLines = titleLines.slice(0, 3);
  if (titleLines.length > 3) {
    displayTitleLines[2] = displayTitleLines[2].substring(0, 17) + '...';
  }
  
  // Calculate font size based on title length
  const baseFontSize = title.length > 30 ? 18 : title.length > 20 ? 20 : 24;
  
  return `
    <svg width="200" height="300" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient-${id}" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${gradientAngle} 0.5 0.5)">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
        </linearGradient>
        ${pattern}
        <filter id="shadow-${id}">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="200" height="300" fill="url(#gradient-${id})" />
      
      <!-- Pattern overlay -->
      <rect width="200" height="300" fill="url(#pattern-${id})" />
      
      <!-- Top accent -->
      <rect x="0" y="0" width="200" height="3" fill="${accentColor}" opacity="0.8" />
      
      <!-- Bottom accent -->
      <rect x="0" y="297" width="200" height="3" fill="${accentColor}" opacity="0.8" />
      
      <!-- Title background -->
      <rect x="10" y="40" width="180" height="${40 + displayTitleLines.length * 30}" fill="white" opacity="0.1" rx="5" />
      
      <!-- Title -->
      ${displayTitleLines.map((line, index) => `
        <text x="100" y="${70 + index * 30}" 
              font-family="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" 
              font-size="${baseFontSize}" 
              font-weight="bold" 
              fill="white" 
              text-anchor="middle"
              filter="url(#shadow-${id})">
          ${line}
        </text>
      `).join('')}
      
      <!-- Decorative element -->
      <line x1="50" y1="${120 + displayTitleLines.length * 30}" 
            x2="150" y2="${120 + displayTitleLines.length * 30}" 
            stroke="white" 
            stroke-width="2" 
            opacity="0.5" />
      
      <!-- Author -->
      <text x="100" y="260" 
            font-family="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" 
            font-size="14" 
            fill="white" 
            text-anchor="middle"
            opacity="0.9">
        ${author.length > 25 ? author.substring(0, 22) + '...' : author}
      </text>
      
      <!-- Genre badge -->
      ${genre ? `
        <rect x="10" y="270" width="${genre.length * 7 + 10}" height="20" fill="white" opacity="0.2" rx="10" />
        <text x="${15 + genre.length * 3.5}" y="283" 
              font-family="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" 
              font-size="10" 
              fill="white" 
              text-anchor="middle"
              font-weight="bold">
          ${genre.toUpperCase()}
        </text>
      ` : ''}
    </svg>
  `;
}

// Generate and save book cover as data URL
export function generateBookCoverDataURL(config: BookCoverConfig): string {
  const svg = generateBookCoverSVG(config);
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
}

// Export function to generate cover for a book
export function getBookCover(book: { id: string; title: string; author: string; genre?: string; coverImage?: string }): string {
  // If book already has a real cover (Harry Potter books), use it
  if (book.coverImage && !book.coverImage.includes('placeholder') && !book.coverImage.startsWith('book-')) {
    return book.coverImage;
  }
  
  // Generate a beautiful cover
  return generateBookCoverDataURL({
    title: book.title,
    author: book.author,
    genre: book.genre,
    id: book.id
  });
}
