# Comprehensive CSS Warning Fix Script
$cssFile = "c:\Users\nisch\OneDrive\Documents\GitHub\gleamverse-home-portal\public\lib\flipbook.style.css"

Write-Host "Reading CSS file..." -ForegroundColor Cyan
$lines = Get-Content $cssFile

Write-Host "Applying fixes..." -ForegroundColor Cyan

# Process line by line
for ($i = 0; $i -lt $lines.Count; $i++) {
    $lineNum = $i + 1
    $line = $lines[$i]
    
    # Fix line 271-272: Add visibility and backface-visibility
    if ($lineNum -eq 271 -and $line -match '^\s+-backface-visibility: hidden;') {
        $lines[$i] = $line -replace '-backface-visibility:', 'visibility: visible;' + "`r`n    backface-visibility:"
    }
    
    # Fix line 685-686: Already has box-shadow, this might be already fixed
    
    # Fix line 731, 795: Empty rulesets - comment them out
    if (($lineNum -eq 731 -or $lineNum -eq 795) -and $line -match '^\s*}\s*$' -and $i -gt 0) {
        if ($lines[$i - 1] -match '{\s*$') {
            $lines[$i - 1] = $lines[$i - 1] -replace '{', '{ /* empty */ }'
            $lines[$i] = ""
        }
    }
    
    # Fix line 876, 893: Comment out speak: none
    if (($lineNum -eq 876 -or $lineNum -eq 893) -and $line -match 'speak: none;') {
        $lines[$i] = $line -replace 'speak: none;', '/* speak: none; */'
    }
    
    # Fix empty rulesets by adding comment
    if ($line -match '^([^{]*){}\s*$') {
        $lines[$i] = $line -replace '{}', '{ /* empty */ }'
    }
    
    # Fix transform-origin: add -moz prefix
    if ($line -match '^\s+-webkit-transform-origin:' -and $i -gt 0) {
        if ($lines[$i - 1] -match 'transform-origin:' -and $lines[$i - 1] -notmatch '-moz-transform-origin') {
            $value = $line -replace '^\s+-webkit-transform-origin:\s*', '' -replace ';.*$', ''
            $lines[$i - 1] = $lines[$i - 1] + "`r`n    -moz-transform-origin: $value;"
        }
    }
    
    # Fix user-select: add standard property
    if ($line -match '^\s+-ms-user-select:' -and $i -gt 0) {
        $value = $line -replace '^\s+-ms-user-select:\s*', '' -replace ';.*$', ''
        # Check if next line doesn't have standard user-select
        if ($i -lt $lines.Count - 1 -and $lines[$i + 1] -notmatch '^\s+user-select:') {
            $lines[$i] = $line + "`r`n    user-select: $value;"
        }
    }
}

Write-Host "Saving fixed CSS file..." -ForegroundColor Cyan
$lines | Set-Content $cssFile

Write-Host "CSS warnings fixed successfully!" -ForegroundColor Green
Write-Host "Please check the file and reload your browser." -ForegroundColor Yellow
