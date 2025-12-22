# Coding Standards

Coding standards cho dự án Inland Real Estate.

## TypeScript

### Naming Conventions
- **Files:** `camelCase.ts` hoặc `PascalCase.tsx` cho components
- **Variables:** `camelCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **Functions:** `camelCase`
- **Components:** `PascalCase`
- **Types/Interfaces:** `PascalCase`

### Code Style
- Sử dụng TypeScript strict mode
- Luôn type các function parameters và return types
- Sử dụng interfaces cho object types
- Prefer `const` over `let`, tránh `var`

## React/Next.js

### Component Structure
```typescript
// 1. Imports
import { useState } from 'react'
import { api } from '@/lib/api'

// 2. Types/Interfaces
interface Props {
  title: string
}

// 3. Component
export default function MyComponent({ title }: Props) {
  // 4. Hooks
  const [state, setState] = useState()
  
  // 5. Handlers
  const handleClick = () => {}
  
  // 6. Render
  return <div>{title}</div>
}
```

### File Organization
- Mỗi component một file
- Related components trong cùng folder
- Export default cho main component
- Named exports cho utilities

## Backend

### Route Organization
- Mỗi resource một route file
- Group related routes
- Use middleware for common logic

### Error Handling
- Always use try-catch
- Return consistent error format
- Log errors for debugging

## Database

### Query Best Practices
- Always use parameterized queries
- Use transactions for multiple operations
- Add indexes for frequently queried columns

## Git

### Commit Messages
- Format: `type: description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Example: `feat: add project management page`

### Branch Naming
- `feature/description`
- `fix/description`
- `hotfix/description`

