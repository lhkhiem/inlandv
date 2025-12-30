# PowerShell script to run KCN Redesign migration
# Usage: .\scripts\run-kcn-migration.ps1

param(
    [string]$Database = $env:DB_NAME,
    [string]$Host = $env:DB_HOST,
    [string]$Port = $env:DB_PORT,
    [string]$User = $env:DB_USER,
    [string]$Password = $env:DB_PASSWORD
)

# Load .env file if exists
if (Test-Path ".env.local") {
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Variable -Name $name -Value $value -Scope Script
        }
    }
}

# Set defaults
if (-not $Database) { $Database = "cms_db" }
if (-not $Host) { $Host = "localhost" }
if (-not $Port) { $Port = "5432" }
if (-not $User) { $User = "cms_user" }
if (-not $Password) { $Password = "cms_password" }

Write-Host "🔄 Running KCN Redesign Migration..." -ForegroundColor Cyan
Write-Host "Database: $Database" -ForegroundColor Gray
Write-Host "Host: $Host:$Port" -ForegroundColor Gray
Write-Host ""

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $Password

try {
    # Migration 061: Create lookup tables
    Write-Host "📋 Running migration 061: Create lookup tables..." -ForegroundColor Yellow
    $migration061 = Get-Content "shared\database\migrations\061_kcn_redesign_lookup_tables.sql" -Raw
    $migration061 | & psql -h $Host -p $Port -U $User -d $Database
    if ($LASTEXITCODE -ne 0) {
        throw "Migration 061 failed"
    }
    Write-Host "✅ Migration 061 completed" -ForegroundColor Green
    Write-Host ""

    # Migration 062: Migrate data
    Write-Host "📋 Running migration 062: Migrate existing data..." -ForegroundColor Yellow
    $migration062 = Get-Content "shared\database\migrations\062_kcn_redesign_migrate_data.sql" -Raw
    $migration062 | & psql -h $Host -p $Port -U $User -d $Database
    if ($LASTEXITCODE -ne 0) {
        throw "Migration 062 failed"
    }
    Write-Host "✅ Migration 062 completed" -ForegroundColor Green
    Write-Host ""

    Write-Host "✅ All migrations completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error running migrations: $_" -ForegroundColor Red
    exit 1
} finally {
    # Clear password
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
















