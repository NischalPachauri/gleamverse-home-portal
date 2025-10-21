# How to Add Your Music Files

## Quick Setup

1. **Add your music files** to this directory (`public/music/`)
2. **Rename them** to: `track1.mp3`, `track2.mp3`, `track3.mp3`, `track4.mp3`
3. **Update the names** in the code (see below)

## Step-by-Step Instructions

### 1. Add Your Music Files
- Copy your music files into this folder
- Rename them to: `track1.mp3`, `track2.mp3`, `track3.mp3`, `track4.mp3`
- Supported formats: MP3, WAV, OGG, M4A

### 2. Update Track Names (Optional)
If you want custom names instead of "Track 1", "Track 2", etc., edit the file:
`src/components/PDFReader.tsx`

Find this section around line 49-54:
```javascript
const musicTracks = [
  { name: "Track 1", url: "/music/track1.mp3" },
  { name: "Track 2", url: "/music/track2.mp3" },
  { name: "Track 3", url: "/music/track3.mp3" },
  { name: "Track 4", url: "/music/track4.mp3" }
];
```

Change the names to your preferred track names:
```javascript
const musicTracks = [
  { name: "My Favorite Song", url: "/music/track1.mp3" },
  { name: "Relaxing Music", url: "/music/track2.mp3" },
  { name: "Study Music", url: "/music/track3.mp3" },
  { name: "Background Music", url: "/music/track4.mp3" }
];
```

### 3. Test Your Music
1. Start your development server: `npm run dev`
2. Open a book in the PDF reader
3. Click the "Play Music" button
4. Select different tracks from the dropdown

## Troubleshooting

- **"Failed to play background music"**: Make sure your music files are in the correct location and format
- **No sound**: Check that your music files are not corrupted and are in a supported format
- **File not found error**: Ensure files are named exactly as specified (track1.mp3, track2.mp3, etc.)

## Supported Audio Formats
- MP3 (.mp3) - Recommended
- WAV (.wav)
- OGG (.ogg)
- M4A (.m4a)

## Tips
- Keep file sizes reasonable (under 10MB each)
- Use instrumental music for better reading experience
- Test each track to ensure they work properly
