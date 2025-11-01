# PowerShell script to rename book files and cover files and update TypeScript files
# This script standardizes filenames by removing special characters and converting to title case

# Define paths
$booksPath = "c:\Users\nisch\Documents\GitHub\gleamverse-home-portal\public\books"
$coversPath = "c:\Users\nisch\Documents\GitHub\gleamverse-home-portal\public\BookCoversNew"
$mappingFilePath = "c:\Users\nisch\Documents\GitHub\gleamverse-home-portal\src\utils\bookCoverMapping.ts"
$galleryFilePath = "c:\Users\nisch\Documents\GitHub\gleamverse-home-portal\src\components\BookCoverGallery.tsx"

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
    $bookMappings[$nameWithoutExt] = $newNameWithoutExt
    
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
    $coverMappings[$nameWithoutExt] = $newNameWithoutExt
    
    Write-Host "Will rename: $oldName -> $newName"
}

# Perform the actual renaming for books
Write-Host "`nRenaming book files..."
foreach ($oldName in $bookMappings.Keys | Where-Object { $_ -like "*.pdf" -or $_ -like "*.PDF" }) {
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
foreach ($oldName in $coverMappings.Keys | Where-Object { $_ -like "*.jpg" -or $_ -like "*.jpeg" -or $_ -like "*.png" }) {
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

# Update bookCoverMapping.ts file
Write-Host "`nUpdating bookCoverMapping.ts file..."
$mappingContent = Get-Content -Path $mappingFilePath -Raw

foreach ($oldName in $coverMappings.Keys | Where-Object { -not ($_ -like "*.jpg" -or $_ -like "*.jpeg" -or $_ -like "*.png") }) {
    $newName = $coverMappings[$oldName]
    # Update the key in the mapping file (the book title)
    $mappingContent = $mappingContent -replace "`"$oldName`":", "`"$newName`":"
    
    # Update the value in the mapping file (the path)
    $oldPath = "/BookCoversNew/$oldName"
    $newPath = "/BookCoversNew/$newName"
    $mappingContent = $mappingContent -replace [regex]::Escape($oldPath), $newPath
}

# Write updated content back to the file
$mappingContent | Out-File -FilePath $mappingFilePath -Encoding utf8

# Update BookCoverGallery.tsx file if needed
Write-Host "`nUpdating BookCoverGallery.tsx file..."
$galleryContent = Get-Content -Path $galleryFilePath -Raw

foreach ($oldName in $coverMappings.Keys | Where-Object { -not ($_ -like "*.jpg" -or $_ -like "*.jpeg" -or $_ -like "*.png") }) {
    $newName = $coverMappings[$oldName]
    $galleryContent = $galleryContent -replace "`"$oldName`"", "`"$newName`""
}

# Write updated content back to the file
$galleryContent | Out-File -FilePath $galleryFilePath -Encoding utf8

# Generate verification report
$reportPath = "c:\Users\nisch\Documents\GitHub\gleamverse-home-portal\renaming_verification_report.txt"
$report = @"
# File Renaming Verification Report
Generated on $(Get-Date)

## Summary
- Total book files processed: $($bookMappings.Count / 2)
- Total cover files processed: $($coverMappings.Count / 2)

## File Consistency Check
"@

# Check for any inconsistencies
$bookNames = Get-ChildItem -Path $booksPath -File | ForEach-Object { [System.IO.Path]::GetFileNameWithoutExtension($_.Name) }
$coverNames = Get-ChildItem -Path $coversPath -File | ForEach-Object { [System.IO.Path]::GetFileNameWithoutExtension($_.Name) }

$missingCovers = $bookNames | Where-Object { $_ -notin $coverNames }
$missingBooks = $coverNames | Where-Object { $_ -notin $bookNames }

$report += "`n`n### Missing Covers`n"
if ($missingCovers.Count -gt 0) {
    foreach ($name in $missingCovers) {
        $report += "- $name`n"
    }
} else {
    $report += "No books missing covers.`n"
}

$report += "`n### Missing Books`n"
if ($missingBooks.Count -gt 0) {
    foreach ($name in $missingBooks) {
        $report += "- $name`n"
    }
} else {
    $report += "No covers missing books.`n"
}

$report += "`n## Conclusion`n"
if ($missingCovers.Count -eq 0 -and $missingBooks.Count -eq 0) {
    $report += "All files have been successfully renamed and all books have matching covers."
} else {
    $report += "Some inconsistencies were found. Please review the report above."
}

# Write report to file
$report | Out-File -FilePath $reportPath -Encoding utf8

Write-Host "`nFile renaming and code updates complete."
Write-Host "Verification report saved to $reportPath"