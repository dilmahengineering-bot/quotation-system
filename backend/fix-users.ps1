Write-Host "PostgreSQL User Password Fix Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Prompt for PostgreSQL password
$pgPassword = Read-Host "Enter PostgreSQL postgres password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Set environment variable for psql
$env:PGPASSWORD = $plainPassword

Write-Host ""
Write-Host "Fixing user accounts in database..." -ForegroundColor Yellow

# Run the SQL script
& "C:\Program Files\PostgreSQL\12\bin\psql.exe" -U postgres -d quotation_db -f "fix-users.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Users updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Login Credentials:" -ForegroundColor Cyan
    Write-Host "  Admin:  username=admin  password=admin123" -ForegroundColor White
    Write-Host "  User:   username=user   password=user123" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "✗ Failed to update users" -ForegroundColor Red
    Write-Host ""
}

# Clear password from environment
Remove-Item Env:\PGPASSWORD
