# Quick Setup - Non-interactive version
# Usage: .\scripts\setup\setup-quick.ps1 -PostgresPassword "your_password"

param(
    [Parameter(Mandatory=$true)]
    [string]$PostgresPassword,
    [string]$DbName = "inlandv_realestate",
    [string]$DbUser = "postgres",
    [string]$DbHost = "localhost",
    [int]$DbPort = 5432,
    [string]$NewUser = "inlandv_user",
    [string]$NewPassword = "EKYvccPcharP"
)

$ErrorActionPreference = "Stop"

Write-Host "[START] Starting database setup..." -ForegroundColor Cyan

# Set password
$env:PGPASSWORD = $PostgresPassword

try {
    # Step 1: Create database
    Write-Host "[STEP 1] Creating database '$DbName'..." -ForegroundColor Yellow
    $dbExists = psql -U $DbUser -h $DbHost -p $DbPort -lqt 2>$null | Select-String -Pattern $DbName
    if (-not $dbExists) {
        createdb -U $DbUser -h $DbHost -p $DbPort $DbName
        Write-Host "[OK] Database created" -ForegroundColor Green
    } else {
        Write-Host "[INFO] Database already exists" -ForegroundColor Yellow
    }

    # Step 2: Create user
    Write-Host "[STEP 2] Creating user '$NewUser'..." -ForegroundColor Yellow
    $createUserSQL = "DO `$`$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = '$NewUser') THEN CREATE USER $NewUser WITH PASSWORD '$NewPassword'; END IF; END `$`$;"
    echo $createUserSQL | psql -U $DbUser -h $DbHost -p $DbPort -d postgres -q
    Write-Host "[OK] User created" -ForegroundColor Green

    # Step 3: Grant permissions
    Write-Host "[STEP 3] Granting permissions..." -ForegroundColor Yellow
    $grantSQL = "GRANT CONNECT ON DATABASE $DbName TO $NewUser; GRANT USAGE ON SCHEMA public TO $NewUser; GRANT CREATE ON SCHEMA public TO $NewUser; GRANT ALL PRIVILEGES ON DATABASE $DbName TO $NewUser;"
    echo $grantSQL | psql -U $DbUser -h $DbHost -p $DbPort -d $DbName -q
    Write-Host "[OK] Permissions granted" -ForegroundColor Green

    # Step 4: Run migrations
    Write-Host "[STEP 4] Running migrations..." -ForegroundColor Yellow
    $projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
    $migrationsPath = Join-Path $projectRoot "shared\database\migrations"
    
    $migrations = @("001_initial_schema.sql", "002_add_indexes.sql", "044_cms_integration.sql")
    foreach ($migration in $migrations) {
        $migrationFile = Join-Path $migrationsPath $migration
        if (Test-Path $migrationFile) {
            Write-Host "  Running: $migration..." -ForegroundColor Cyan
            psql -U $DbUser -h $DbHost -p $DbPort -d $DbName -f $migrationFile -q
            Write-Host "  [OK] $migration completed" -ForegroundColor Green
        }
    }

    Write-Host ""
    Write-Host "[SUCCESS] Setup completed!" -ForegroundColor Green
    Write-Host "Connection: postgresql://$NewUser`:$NewPassword@$DbHost`:$DbPort/$DbName" -ForegroundColor Yellow

} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    $env:PGPASSWORD = $null
}





















