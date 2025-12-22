# Setup Git Repository and Remote
# Usage: .\scripts\setup\setup-git.ps1 <remote-url>

param(
    [Parameter(Mandatory=$true)]
    [string]$RemoteUrl
)

Write-Host "🔧 Setting up Git repository..." -ForegroundColor Cyan

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
}

# Check if remote already exists
$remotes = git remote
if ($remotes -contains "origin") {
    Write-Host "⚠️  Remote 'origin' already exists" -ForegroundColor Yellow
    $response = Read-Host "Do you want to update it? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        git remote set-url origin $RemoteUrl
        Write-Host "✅ Updated remote 'origin' to: $RemoteUrl" -ForegroundColor Green
    } else {
        Write-Host "❌ Cancelled" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "➕ Adding remote 'origin': $RemoteUrl" -ForegroundColor Yellow
    git remote add origin $RemoteUrl
    Write-Host "✅ Remote 'origin' added successfully" -ForegroundColor Green
}

# Show current remotes
Write-Host ""
Write-Host "📋 Current remotes:" -ForegroundColor Cyan
git remote -v

Write-Host ""
Write-Host "✅ Git setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. git add ."
Write-Host "  2. git commit -m 'Initial commit'"
Write-Host "  3. git branch -M main"
Write-Host "  4. git push -u origin main"

