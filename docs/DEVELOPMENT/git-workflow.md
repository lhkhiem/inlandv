# Git Workflow

Git workflow cho dự án.

## Branch Strategy

### Main Branches
- `main` - Production-ready code
- `develop` - Development branch

### Supporting Branches
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

## Workflow

### 1. Create Feature Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/new-feature
```

### 2. Develop & Commit
```bash
# Make changes
git add .
git commit -m "feat: add new feature"
```

### 3. Push & Create PR
```bash
git push origin feature/new-feature
# Create Pull Request on GitHub
```

### 4. Code Review & Merge
- Review code
- Address feedback
- Merge to develop
- Delete feature branch

## Commit Message Format

```
type: description

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

### Examples
```
feat: add project management page
fix: resolve CORS issue in API
docs: update setup guide
```

