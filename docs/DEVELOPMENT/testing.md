# Testing Guide

Hướng dẫn testing cho dự án.

## Test Structure

```
tests/
├── unit/          # Unit tests
├── integration/   # Integration tests
└── e2e/          # End-to-end tests
```

## Frontend Testing

### Unit Tests
- Test individual components
- Test utility functions
- Use Jest + React Testing Library

### E2E Tests
- Test user flows
- Use Cypress
- Test critical paths

## Backend Testing

### Unit Tests
- Test route handlers
- Test middleware
- Test utilities

### Integration Tests
- Test API endpoints
- Test database operations
- Test authentication flow

## Running Tests

```bash
# Frontend
cd projects/public-frontend
npm test

# Backend
cd projects/public-backend
npm test

# E2E
cd projects/public-frontend
npm run test:e2e
```

## Test Coverage

- Aim for 80%+ coverage
- Focus on critical paths
- Test edge cases

