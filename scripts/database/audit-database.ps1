# Database Audit Script (PowerShell)
# Thống kê các bảng trong database và số lượng records

param(
    [string]$DatabaseUrl = $env:DATABASE_URL
)

# Load environment variables from cms-backend
$envPath = Join-Path $PSScriptRoot "..\..\projects\cms-backend\.env.local"
if (-not (Test-Path $envPath)) {
    $envPath = Join-Path $PSScriptRoot "..\..\projects\cms-backend\.env"
}

if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

if (-not $DatabaseUrl) {
    $DatabaseUrl = $env:DATABASE_URL
    if (-not $DatabaseUrl) {
        $dbUser = $env:DB_USER ?? "postgres"
        $dbPassword = $env:DB_PASSWORD ?? "postgres"
        $dbHost = $env:DB_HOST ?? "localhost"
        $dbPort = $env:DB_PORT ?? "5432"
        $dbName = $env:DB_NAME ?? "inlandv_realestate"
        $DatabaseUrl = "postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}"
    }
}

Write-Host "🔍 Đang thống kê database..." -ForegroundColor Cyan
Write-Host "Database URL: $($DatabaseUrl -replace ':[^:@]+@', ':****@')" -ForegroundColor Gray
Write-Host ""

# Parse DATABASE_URL
if ($DatabaseUrl -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
    $dbUser = $matches[1]
    $dbPassword = $matches[2]
    $dbHost = $matches[3]
    $dbPort = $matches[4]
    $dbName = $matches[5]
} else {
    Write-Host "❌ Không thể parse DATABASE_URL" -ForegroundColor Red
    exit 1
}

# SQL query to get table statistics
$sqlQuery = @"
SELECT 
    schemaname || '.' || tablename AS table_name,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"@

# Execute query using psql
$env:PGPASSWORD = $dbPassword
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "❌ Không tìm thấy psql. Vui lòng cài đặt PostgreSQL client." -ForegroundColor Red
    exit 1
}

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 THỐNG KÊ CÁC BẢNG TRONG DATABASE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Get table list and sizes
$tableStats = & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -t -A -F "|" -c $sqlQuery

$tables = @()
foreach ($line in $tableStats) {
    if ($line -match '^public\.(\w+)\|(.+)\|(.+)\|(.+)$') {
        $tables += [PSCustomObject]@{
            Name = $matches[1]
            TotalSize = $matches[2].Trim()
            TableSize = $matches[3].Trim()
            IndexSize = $matches[4].Trim()
        }
    }
}

# Get row counts for each table
Write-Host "Đang đếm số records..." -ForegroundColor Yellow
$rowCounts = @{}
foreach ($table in $tables) {
    $countQuery = "SELECT COUNT(*) FROM `"$($table.Name)`";"
    try {
        $countResult = & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -t -A -c $countQuery 2>&1
        if ($countResult -match '^\s*(\d+)\s*$') {
            $rowCounts[$table.Name] = [int]$matches[1]
        } else {
            $rowCounts[$table.Name] = -1
        }
    } catch {
        $rowCounts[$table.Name] = -1
    }
}

# Display summary table
Write-Host ""
Write-Host "TỔNG QUAN:" -ForegroundColor Green
Write-Host ""
Write-Host ("{0,-35} {1,-15} {2,-15} {3,-15}" -f "Tên bảng", "Số records", "Kích thước", "Index size")
Write-Host ("-" * 80)

foreach ($table in $tables) {
    $rowCount = $rowCounts[$table.Name]
    $rowCountStr = if ($rowCount -ge 0) { $rowCount.ToString("N0") } else { "N/A" }
    Write-Host ("{0,-35} {1,-15} {2,-15} {3,-15}" -f $table.Name, $rowCountStr, $table.TotalSize, $table.IndexSize)
}

Write-Host ""

# Summary statistics
$totalTables = $tables.Count
$totalRows = ($rowCounts.Values | Where-Object { $_ -ge 0 } | Measure-Object -Sum).Sum
$tablesWithData = ($rowCounts.Values | Where-Object { $_ -gt 0 }).Count
$emptyTables = ($rowCounts.Values | Where-Object { $_ -eq 0 }).Count

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📈 TỔNG KẾT" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Tổng số bảng: $totalTables" -ForegroundColor White
Write-Host "   Bảng có dữ liệu: $tablesWithData" -ForegroundColor Green
Write-Host "   Bảng trống: $emptyTables" -ForegroundColor Yellow
Write-Host "   Tổng số records: $($totalRows.ToString('N0'))" -ForegroundColor White
Write-Host ""

# Top tables by row count
Write-Host "   Bảng có nhiều dữ liệu nhất:" -ForegroundColor Green
$sortedTables = $rowCounts.GetEnumerator() | 
    Where-Object { $_.Value -gt 0 } | 
    Sort-Object Value -Descending | 
    Select-Object -First 10

foreach ($item in $sortedTables) {
    Write-Host ("     - {0}: {1} records" -f $item.Key, $item.Value.ToString("N0")) -ForegroundColor White
}

# Empty tables
if ($emptyTables -gt 0) {
    Write-Host ""
    Write-Host "   Bảng trống (có thể không sử dụng):" -ForegroundColor Yellow
    $emptyTableNames = $rowCounts.GetEnumerator() | 
        Where-Object { $_.Value -eq 0 } | 
        Select-Object -ExpandProperty Key
    
    foreach ($tableName in $emptyTableNames) {
        Write-Host ("     - $tableName") -ForegroundColor Gray
    }
}

Write-Host ""












