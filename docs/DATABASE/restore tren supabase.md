# Chạy trên powershell
# Restore database với --clean và --if-exists để xóa objects cũ trước
$env:PGPASSWORD = "your_password"
pg_restore -h aws-1-ap-southeast-1.pooler.supabase.com `
  -U postgres.qmlkaepgwfzltmdygfys `
  -d postgres `
  --clean `
  --if-exists `
  --no-owner `
  --no-privileges `
  --verbose `
  "D:\PROJECT\backup\sql\ipd8.271225.bk.sql"