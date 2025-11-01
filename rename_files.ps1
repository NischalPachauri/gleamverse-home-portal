# PowerShell script to rename book files and cover files
# This script standardizes filenames by removing special characters and converting to title case

# Define paths
$booksPath = "c:\Users\nisch\Documents\GitHub\gleamverse-home-portal\public\books"
$coversPath = "c:\Users\nisch\Documents\GitHub\gleamverse-home-portal\public\BookCoversNew"

# Function to convert to title case and remove special characters
function ConvertToTitleCase($inputString) {
    # Remove special characters and replace with spaces
    $cleaned = $inputString -replace '[_\-]', ' '
    
    # Convert to title case (capitalize first letter of each word)
    $textInfo = (Get-Culture).TextInfo
    $titleCase = $textInfo.ToTitleCase($cleaned.ToLower())
    
    # Remove extra spaces
    $titleCase = $titleCase -replace '\s+', ' '
    $titleCase = $titleCase.Trim()
    
    return $titleCase
}

# Create a mapping of old to new filenames
$bookMappings = @{}
$coverMappings = @{}

# Process book files
Write-Host "Processing book files..."
Get-ChildItem -Path $booksPath -File | ForEach-Object {
    $oldName = $_.Name
    $nameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($oldName)
    $extension = $_.Extension
    
    # Convert to title case and clean up
    $newNameWithoutExt = ConvertToTitleCase $nameWithoutExt
    $newName = "$newNameWithoutExt$extension"
    
    # Store mapping
    $bookMappings[$oldName] = $newName
    
    Write-Host "Will rename: $oldName -> $newName"
}

# Process cover files
Write-Host "`nProcessing cover files..."
Get-ChildItem -Path $coversPath -File | ForEach-Object {
    $oldName = $_.Name
    $nameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($oldName)
    $extension = $_.Extension
    
    # Convert to title case and clean up
    $newNameWithoutExt = ConvertToTitleCase $nameWithoutExt
    $newName = "$newNameWithoutExt$extension"
    
    # Store mapping
    $coverMappings[$oldName] = $newName
    
    Write-Host "Will rename: $oldName -> $newName"
}

# Perform the actual renaming for books
Write-Host "`nRenaming book files..."
foreach ($oldName in $bookMappings.Keys) {
    $newName = $bookMappings[$oldName]
    $oldPath = Join-Path -Path $booksPath -ChildPath $oldName
    $newPath = Join-Path -Path $booksPath -ChildPath $newName
    
    # Check if destination already exists
    if (Test-Path -Path $newPath) {
        Write-Host "Warning: Cannot rename '$oldName' to '$newName' - destination already exists"
    } else {
        Rename-Item -Path $oldPath -NewName $newName
        Write-Host "Renamed: $oldName -> $newName"
    }
}

# Perform the actual renaming for covers
Write-Host "`nRenaming cover files..."
foreach ($oldName in $coverMappings.Keys) {
    $newName = $coverMappings[$oldName]
    $oldPath = Join-Path -Path $coversPath -ChildPath $oldName
    $newPath = Join-Path -Path $coversPath -ChildPath $newName
    
    # Check if destination already exists
    if (Test-Path -Path $newPath) {
        Write-Host "Warning: Cannot rename '$oldName' to '$newName' - destination already exists"
    } else {
        Rename-Item -Path $oldPath -NewName $newName
        Write-Host "Renamed: $oldName -> $newName"
    }
}

# Generate mapping file for updating TypeScript code
$mappingFilePath = "c:\Users\nisch\Documents\GitHub\gleamverse-home-portal\file_mappings.json"
$combinedMappings = @{
    "books" = $bookMappings
    "covers" = $coverMappings
}

$combinedMappings | ConvertTo-Json -Depth 3 | Out-File -FilePath $mappingFilePath

Write-Host "`nFile renaming complete. Mapping saved to $mappingFilePath"
Write-Host "Next steps: Update bookCoverMapping.ts and BookCoverGallery.tsx with the new filenames"