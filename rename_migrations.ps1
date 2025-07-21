# PowerShell script to rename migration files to match Supabase CLI requirements
# Pattern: <timestamp>_<name>.sql where timestamp is 14 digits

$migrationsDir = "supabase/migrations"
$counter = 0

# Get all .sql files in migrations directory
$files = Get-ChildItem -Path $migrationsDir -Filter "*.sql"

foreach ($file in $files) {
    $filename = $file.Name
    
    # Check if filename matches the required pattern: <timestamp>_<name>.sql
    if ($filename -match "^(\d{14})_(.+)$") {
        Write-Host "✓ $filename (already correct format)"
        continue
    }
    
    # Check if filename has timestamp but wrong separator (dash instead of underscore)
    if ($filename -match "^(\d{14})-(.+)$") {
        $timestamp = $matches[1]
        $name = $matches[2]
        $newName = "${timestamp}_${name}"
        Rename-Item -Path $file.FullName -NewName $newName
        Write-Host "✓ Renamed: $filename → $newName"
        $counter++
        continue
    }
    
    # Check if filename has short timestamp (less than 14 digits)
    if ($filename -match "^(\d{8,13})[_-](.+)$") {
        $shortTimestamp = $matches[1]
        $name = $matches[2]
        
        # Pad timestamp to 14 digits
        $paddedTimestamp = $shortTimestamp.PadRight(14, "0")
        $newName = "${paddedTimestamp}_${name}"
        Rename-Item -Path $file.FullName -NewName $newName
        Write-Host "✓ Renamed: $filename → $newName"
        $counter++
        continue
    }
    
    # Check if filename has date format like 20250614_name.sql
    if ($filename -match "^(\d{8})[_-](.+)$") {
        $date = $matches[1]
        $name = $matches[2]
        
        # Convert to 14-digit timestamp (YYYYMMDD000000)
        $timestamp = "${date}000000"
        $newName = "${timestamp}_${name}"
        Rename-Item -Path $file.FullName -NewName $newName
        Write-Host "✓ Renamed: $filename → $newName"
        $counter++
        continue
    }
    
    # For any other format, generate a new timestamp
    $timestamp = (Get-Date).ToString("yyyyMMddHHmmss")
    $name = $filename -replace "\.sql$", ""
    $newName = "${timestamp}_${name}.sql"
    Rename-Item -Path $file.FullName -NewName $newName
    Write-Host "✓ Renamed: $filename → $newName"
    $counter++
}

Write-Host "`nCompleted! Renamed $counter migration files." 