import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Harry Potter book cover URLs (using Open Library covers)
const harryPotterCovers = {
  'hp1': 'https://covers.openlibrary.org/b/id/8256451-L.jpg', // Philosopher's Stone
  'hp2': 'https://covers.openlibrary.org/b/id/8256452-L.jpg', // Chamber of Secrets
  'hp3': 'https://covers.openlibrary.org/b/id/8256453-L.jpg', // Prisoner of Azkaban
  'hp4': 'https://covers.openlibrary.org/b/id/8256454-L.jpg', // Goblet of Fire
  'hp5': 'https://covers.openlibrary.org/b/id/8256455-L.jpg', // Order of the Phoenix
  'hp6': 'https://covers.openlibrary.org/b/id/8256456-L.jpg', // Half-Blood Prince
  'hp7': 'https://covers.openlibrary.org/b/id/8256457-L.jpg', // Deathly Hallows
  'hp8': 'https://covers.openlibrary.org/b/id/8256458-L.jpg'  // Cursed Child
};

// Function to download cover image
async function downloadCover(url, filename) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      const filepath = path.join(__dirname, '..', 'src', 'assets', 'covers', filename);
      fs.writeFileSync(filepath, Buffer.from(buffer));
      console.log(`✓ Downloaded: ${filename}`);
      return true;
    } else {
      console.log(`✗ Failed to download: ${filename} (${response.status})`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error downloading ${filename}:`, error);
    return false;
  }
}

// Function to create fallback SVG covers
function createFallbackCover(bookId, title) {
  const colors = {
    'hp1': '#8B5CF6', // Purple
    'hp2': '#EC4899', // Pink
    'hp3': '#3B82F6', // Blue
    'hp4': '#EF4444', // Red
    'hp5': '#10B981', // Green
    'hp6': '#F59E0B', // Orange
    'hp7': '#06B6D4', // Cyan
    'hp8': '#84CC16'  // Lime
  };
  
  const color = colors[bookId] || '#6B7280';
  
  return `<svg width="200" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="300" fill="${color}" rx="8"/>
    <rect x="10" y="10" width="180" height="280" fill="white" rx="4"/>
    <text x="100" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#1F2937">${title}</text>
    <text x="100" y="80" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#6B7280">by J.K. Rowling</text>
    <rect x="20" y="100" width="160" height="2" fill="${color}"/>
    <text x="100" y="130" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="${color}">Fantasy</text>
    <circle cx="100" cy="200" r="30" fill="${color}" opacity="0.2"/>
    <text x="100" y="210" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="${color}">⚡</text>
  </svg>`;
}

// Main function to download Harry Potter covers
async function downloadHarryPotterCovers() {
  console.log('Downloading Harry Potter book covers...');
  
  // Create covers directory if it doesn't exist
  const coversDir = path.join(__dirname, '..', 'src', 'assets', 'covers');
  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
  }
  
  let successCount = 0;
  let failCount = 0;
  
  for (const [bookId, url] of Object.entries(harryPotterCovers)) {
    const filename = `${bookId}.jpg`;
    const success = await downloadCover(url, filename);
    
    if (success) {
      successCount++;
    } else {
      failCount++;
      // Create fallback SVG cover
      const titles = {
        'hp1': "Harry Potter and the Philosopher's Stone",
        'hp2': "Harry Potter and the Chamber of Secrets",
        'hp3': "Harry Potter and the Prisoner of Azkaban",
        'hp4': "Harry Potter and the Goblet of Fire",
        'hp5': "Harry Potter and the Order of the Phoenix",
        'hp6': "Harry Potter and the Half-Blood Prince",
        'hp7': "Harry Potter and the Deathly Hallows",
        'hp8': "Harry Potter and the Cursed Child"
      };
      
      const svgContent = createFallbackCover(bookId, titles[bookId]);
      const svgPath = path.join(coversDir, `${bookId}.svg`);
      fs.writeFileSync(svgPath, svgContent);
      console.log(`✓ Created fallback SVG: ${bookId}.svg`);
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\nDownload complete!`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Fallback SVGs created for failed downloads.`);
}

// Run the script
downloadHarryPotterCovers().catch(console.error);
