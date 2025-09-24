# Define the path to the user's profile directory
$userProfilePath = [System.Environment]::GetFolderPath('UserProfile')

# Define the paths relative to the user's profile directory
$imanagePaths = @(
    "\AppData\Roaming\iManage\Work\imanEFSDB2.sdf",
    "\AppData\Roaming\iManage\Work\imanEFSDB.sdf",
    "\AppData\Roaming\iManage\Work\WCS\imanWCSDB.DB",
    "\AppData\Roaming\iManage\Work\WCS\imanWCSDB.key",
    "\AppData\Roaming\iManage\Work\SuggestionDb\imanEFSDB3.DB",
    "\AppData\Roaming\iManage\Work\SuggestionDb\imanEFSDB3.key",
    "\AppData\Roaming\iManage\Work\WCS\Backups\imanEFSDB3 - 04-01-2024.DB",
    "\AppData\Roaming\iManage\Work\SuggestionDb\Backups\imanEFSDB3 - 03-29-2024.DB",
    "\AppData\Roaming\iManage\Work\SuggestionDb\Backups\imanEFSDB3 - 04-01-2024.DB",
    "\AppData\Roaming\iManage\Work\SuggestionDb\Backups\iman*.DB"
)

# Initialize arrays to store the deleted and not found files
$deletedFiles = @()
$notFoundFiles = @()

# Loop through each path, attempt to delete the files and generate report
foreach ($path in $imanagePaths) {
    $fullPath = Join-Path -Path $userProfilePath -ChildPath $path
    if (Test-Path -Path $fullPath) {
        try {
            Remove-Item -Path $fullPath -Force
            $deletedFiles += $fullPath
        } catch {
            Write-Host "Failed to delete: $fullPath"
        }
    } else {
        $notFoundFiles += $fullPath
    }
}

# Display report
Write-Host "Deleted Files:"
$deletedFiles | ForEach-Object { Write-Host "- $_" }
Write-Host ""

Write-Host "Files Not Found:"
$notFoundFiles | ForEach-Object { Write-Host "- $_" }
