# PowerShell script to fix CSS issues in flipbook.style.css
$file = "c:\Users\nisch\OneDrive\Documents\GitHub\gleamverse-home-portal\public\lib\flipbook.style.css"
$content = Get-Content $file -Raw

# Fix remaining -backface-visibility (invalid prefix)
$content = $content -replace '    -backface-visibility: hidden;', '    visibility: visible;`r`n    backface-visibility: hidden;'

# Comment out invalid speak properties
$content = $content -replace '    speak: none;', '    /* speak: none; */'

# Add standard box-shadow where missing (after vendor prefixes)
$content = $content -replace '(    -webkit-box-shadow: 0 1px 6px rgba\(0, 0, 0, 0\.2\);)\r\n(})', '$1`r`n    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);`r`n$2'

# Add standard transform-origin where missing
$content = $content -replace '(\s+-ms-transform-origin: [^;]+;)\r\n(\s+transform-origin: [^;]+;)\r\n(\s+-webkit-transform-origin: [^;]+;)\r\n', '$1`r`n$2`r`n$3`r`n    -moz-transform-origin: $2;`r`n'

# Save the file
$content | Set-Content $file -NoNewline

Write-Host "CSS fixes applied successfully!"
