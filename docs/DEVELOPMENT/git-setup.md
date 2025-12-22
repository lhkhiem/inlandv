# Git Setup Guide

Hướng dẫn setup Git repository và remote.

## 🚀 Quick Setup

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

### Cách 2: Manual Setup

#### 1. Khởi tạo Git Repository
```bash
git init
```

#### 2. Add Remote
```bash
# HTTPS
git remote add origin https://github.com/username/repo.git

# SSH
git remote add origin git@github.com:username/repo.git
```

#### 3. Add và Commit Files
```bash
git add .
git commit -m "Initial commit: Project restructure into 4 separate projects"
```

#### 4. Set Main Branch và Push
```bash
git branch -M main
git push -u origin main
```

---

## 📋 Remote URLs

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

## 🔧 Common Git Commands

### Check Status
```bash
git status
```

### Check Remotes
```bash
git remote -v
```

### Update Remote URL
```bash
git remote set-url origin <new-url>
```

### Remove Remote
```bash
git remote remove origin
```

### Add All Files
```bash
git add .
```

### Commit
```bash
git commit -m "Your commit message"
```

### Push to Remote
```bash
git push -u origin main
```

---

## 📝 Git Workflow

### Development Workflow
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes
# ... edit files ...

# 3. Stage changes
git add .

# 4. Commit
git commit -m "feat: add new feature"

# 5. Push to remote
git push origin feature/new-feature

# 6. Create Pull Request on GitHub/GitLab
```

### Update from Remote
```bash
# Fetch latest changes
git fetch origin

# Merge main branch
git checkout main
git pull origin main

# Or rebase
git rebase origin/main
```

---

## 🔒 Security Notes

### SSH Keys
- ✅ Khuyến nghị dùng SSH cho production
- ✅ Setup SSH keys: `ssh-keygen -t ed25519 -C "your_email@example.com"`
- ✅ Add public key to GitHub/GitLab

### HTTPS
- ✅ Dễ setup hơn
- ⚠️ Cần username/password hoặc token
- ✅ OK cho development

---

## 🆘 Troubleshooting

### "Remote origin already exists"
```bash
# Update existing remote
git remote set-url origin <new-url>

# Or remove and re-add
git remote remove origin
git remote add origin <new-url>
```

### "Permission denied"
- Kiểm tra SSH keys đã được add vào GitHub/GitLab
- Hoặc dùng HTTPS với token

### "Failed to push"
- Kiểm tra bạn có quyền push vào repository
- Kiểm tra branch name (main vs master)

---

## 📚 More Information

- [Git Workflow Guide](./git-workflow.md)
- [Coding Standards](./coding-standards.md)

