# PowerShell script to rename book files
$booksPath = "c:\Users\nisch\Documents\GitHub\gleamverse-home-portal\public\books"

function ConvertToTitleCase($inputString) {
    # Remove special characters and replace with spaces
    $cleaned = $inputString -replace '[_\-]', ' '
    
    # Convert to title case
    $textInfo = (Get-Culture).TextInfo
    $titleCase = $textInfo.ToTitleCase($cleaned.ToLower())
    
    # Remove extra spaces
    $titleCase = $titleCase -replace '\s+', ' '
    $titleCase = $titleCase.Trim()
    
    return $titleCase
}

# Create a mapping file for reference
$mappingFile = "c:\Users\nisch\Documents\GitHub\gleamverse-home-portal\book_rename_mapping.json"
$mapping = @{}

# Process book files
Get-ChildItem -Path $booksPath -File | ForEach-Object {
    $oldName = $_.Name
    $nameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($oldName)
    $extension = $_.Extension
    
    # Convert to title case and clean up
    $newNameWithoutExt = ConvertToTitleCase $nameWithoutExt
    $newName = "$newNameWithoutExt$extension"
    
    # Store mapping
    $mapping[$oldName] = $newName
    
    # Rename the file
    $oldPath = Join-Path -Path $booksPath -ChildPath $oldName
    $newPath = Join-Path -Path $booksPath -ChildPath $newName
    
    if ($oldName -ne $newName) {
        if (Test-Path -Path $newPath) {
            Write-Host "Warning: Cannot rename '$oldName' to '$newName' - destination already exists"
        } else {
            Rename-Item -Path $oldPath -NewName $newName
            Write-Host "Renamed: $oldName -> $newName"
        }
    }
}

# Save mapping to JSON file
$mapping | ConvertTo-Json | Out-File -FilePath $mappingFile -Encoding utf8
Write-Host "Book renaming complete. Mapping saved to $mappingFile"