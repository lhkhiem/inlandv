# Git Remote Setup - Hướng dẫn Add Remote

## ✅ Đã hoàn thành

- ✅ Git repository đã được khởi tạo
- ✅ Initial commit đã được tạo
- ✅ Branch đã được đổi thành `main`

## 🚀 Cách Add Remote

### Cách 1: Sử dụng Script (Khuyến nghị)

#### Windows (PowerShell)
```powershell
.\scripts\setup\setup-git.ps1 https://github.com/username/repo.git
```

#### Linux/Mac (Bash)
```bash
chmod +x scripts/setup/setup-git.sh
./scripts/setup/setup-git.sh https://github.com/username/repo.git
```

### Cách 2: Manual

#### Add Remote
```bash
# HTTPS
git remote add origin https://github.com/username/repo.git

# SSH
git remote add origin git@github.com:username/repo.git
```

#### Verify Remote
```bash
git remote -v
```

#### Push to Remote
```bash
git push -u origin main
```

---

## 📋 Remote URL Examples

### GitHub
```bash
# HTTPS
https://github.com/username/repo.git

# SSH
git@github.com:username/repo.git
```

### GitLab
```bash
# HTTPS
https://gitlab.com/username/repo.git

# SSH
git@gitlab.com:username/repo.git
```

### Bitbucket
```bash
# HTTPS
https://bitbucket.org/username/repo.git

# SSH
git@bitbucket.org:username/repo.git
```

---

## 🔧 Next Steps

Sau khi add remote, bạn có thể:

1. **Push code lên remote:**
   ```bash
   git push -u origin main
   ```

2. **Pull code từ remote:**
   ```bash
   git pull origin main
   ```

3. **Check status:**
   ```bash
   git status
   ```

---

## 📚 More Information

Xem [docs/DEVELOPMENT/git-setup.md](./docs/DEVELOPMENT/git-setup.md) để biết thêm chi tiết.








