# PowerShell script to update code files with new standardized names
$mappingFilePath = "c:\Users\nisch\Documents\GitHub\gleamverse-home-portal\src\utils\bookCoverMapping.ts"
$galleryFilePath = "c:\Users\nisch\Documents\GitHub\gleamverse-home-portal\src\components\BookCoverGallery.tsx"

# Load the cover rename mapping
$coverMappingFile = "c:\Users\nisch\Documents\GitHub\gleamverse-home-portal\cover_rename_mapping.json"
$coverMapping = Get-Content -Path $coverMappingFile -Raw | ConvertFrom-Json

# Update bookCoverMapping.ts
Write-Host "Updating bookCoverMapping.ts..."
$mappingContent = Get-Content -Path $mappingFilePath -Raw

# Create a new mapping object with standardized names
$newMappingLines = @()
$newMappingLines += "// Book cover mapping utility"
$newMappingLines += "// Complete mapping of all 347+ book covers in /public/BookCoversNew/"
$newMappingLines += ""
$newMappingLines += "export const bookCoverMap: Record<string, string> = {"

# Process each property in the cover mapping
$coverMapping.PSObject.Properties | ForEach-Object {
    $oldName = $_.Name
    $newName = $_.Value
    
    # Extract name without extension for the key
    $nameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($newName)
    
    # Add the new mapping line
    $newMappingLines += "  `"$nameWithoutExt`": `"/BookCoversNew/$newName`","
}

# Close the object
$newMappingLines += "};"

# Add the getBookCover function
$newMappingLines += ""
$newMappingLines += "// Helper function to get book cover path with fallback"
$newMappingLines += "export function getBookCover(bookTitle: string): string {"
$newMappingLines += "  if (!bookTitle) return '/placeholder.png';"
$newMappingLines += ""
$newMappingLines += "  // Try exact match"
$newMappingLines += "  if (bookCoverMap[bookTitle]) {"
$newMappingLines += "    return bookCoverMap[bookTitle];"
$newMappingLines += "  }"
$newMappingLines += ""
$newMappingLines += "  // Try case-insensitive match"
$newMappingLines += "  const lowerTitle = bookTitle.toLowerCase();"
$newMappingLines += "  const keys = Object.keys(bookCoverMap);"
$newMappingLines += "  for (const key of keys) {"
$newMappingLines += "    if (key.toLowerCase() === lowerTitle) {"
$newMappingLines += "      return bookCoverMap[key];"
$newMappingLines += "    }"
$newMappingLines += "  }"
$newMappingLines += ""
$newMappingLines += "  // Try partial match"
$newMappingLines += "  for (const key of keys) {"
$newMappingLines += "    if (key.toLowerCase().includes(lowerTitle) || lowerTitle.includes(key.toLowerCase())) {"
$newMappingLines += "      return bookCoverMap[key];"
$newMappingLines += "    }"
$newMappingLines += "  }"
$newMappingLines += ""
$newMappingLines += "  // No match found, return placeholder"
$newMappingLines += "  console.warn(`No cover found for book: ${bookTitle}`);"
$newMappingLines += "  return '/placeholder.png';"
$newMappingLines += "}"

# Write the updated content back to the file
$newMappingLines -join "`r`n" | Out-File -FilePath $mappingFilePath -Encoding utf8

# Update BookCoverGallery.tsx if needed
Write-Host "Updating BookCoverGallery.tsx..."
$galleryContent = Get-Content -Path $galleryFilePath -Raw

# Replace old book names with new standardized names
$coverMapping.PSObject.Properties | ForEach-Object {
    $oldName = $_.Name
    $newName = $_.Value
    
    # Extract name without extension for replacement
    $oldNameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($oldName)
    $newNameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($newName)
    
    if ($oldNameWithoutExt -ne $newNameWithoutExt) {
        $galleryContent = $galleryContent -replace [regex]::Escape("`"$oldNameWithoutExt`""), "`"$newNameWithoutExt`""
    }
}

# Write the updated content back to the file
$galleryContent | Out-File -FilePath $galleryFilePath -Encoding utf8

Write-Host "Code files updated successfully."