# Script to run properties migration
# This script runs the 047_create_properties.sql migration

param(
    [string]$Database = "inland_realestate",
    [string]$Host = "localhost",
    [string]$Port = "5432",
    [string]$User = "postgres"
)

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Running Properties Migration (047)" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Get migration file path
$MigrationFile = Join-Path $PSScriptRoot "..\..\shared\database\migrations\047_create_properties.sql"

if (-not (Test-Path $MigrationFile)) {
    Write-Host "Error: Migration file not found at $MigrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "Migration file: $MigrationFile" -ForegroundColor Green

# Read password from environment or prompt
$Password = $env:PGPASSWORD
if (-not $Password) {
    $SecurePassword = Read-Host "Enter PostgreSQL password for user $User" -AsSecureString
    $Password = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword)
    )
}

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $Password

try {
    Write-Host "`nConnecting to database: $Database on $Host:$Port" -ForegroundColor Yellow
    Write-Host "Running migration..." -ForegroundColor Yellow
    
    # Run migration
    $Result = & psql -h $Host -p $Port -U $User -d $Database -f $MigrationFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓ Migration completed successfully!" -ForegroundColor Green
        
        # Verify tables were created
        Write-Host "`nVerifying tables..." -ForegroundColor Yellow
        $VerifyQuery = @"
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('properties', 'property_images', 'property_documents', 'amenities', 'property_amenities')
ORDER BY table_name;
"@
        
        $VerifyResult = & psql -h $Host -p $Port -U $User -d $Database -t -c $VerifyQuery 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`nCreated tables:" -ForegroundColor Green
            $VerifyResult | Where-Object { $_.Trim() -ne '' } | ForEach-Object {
                Write-Host "  ✓ $_" -ForegroundColor Green
            }
        }
        
    } else {
        Write-Host "`n✗ Migration failed!" -ForegroundColor Red
        Write-Host $Result -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "`n✗ Error running migration: $_" -ForegroundColor Red
    exit 1
} finally {
    # Clear password from environment
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "Migration Complete!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan



















