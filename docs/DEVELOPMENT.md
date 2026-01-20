# راهنمای توسعه Next-Pelak

**نسخه**: 1.0.0  
**آخرین به‌روزرسانی**: 2025-01-XX

## فهرست مطالب

- [Setup Guide](#setup-guide)
- [Development Workflow](#development-workflow)
- [Code Structure](#code-structure)
- [Testing](#testing)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Setup Guide

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Redis (optional)
- Docker (optional)

### Installation

```bash
# Clone repository
git clone https://github.com/your-repo/Next-Pelak.git
cd Next-Pelak

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Setup database
# Run migrations from core/database/schema/
# Run functions from core/database/functions/

# Start development server
npm run dev
```

### Environment Setup

```bash
# .env file
POSTGREST_URL=http://localhost:3000
POSTGREST_SECRET=your-secret
TOKEN_SECRET=your-jwt-secret-min-32-chars
# ... other variables
```

---

## Development Workflow

### Branch Strategy

- `main`: Production branch
- `develop`: Development branch
- `feature/*`: Feature branches
- `fix/*`: Bug fix branches

### Commit Messages

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
refactor: Code refactoring
test: Add tests
```

### Code Review

1. Create PR
2. Code review
3. Tests pass
4. Merge to develop
5. Deploy to staging
6. Merge to main

---

## Code Structure

### Directory Organization

```
core/          # Core reusable code
project/       # Project-specific code
site/          # Site-specific components
app/           # Next.js app router
docs/          # Documentation
```

### Naming Conventions

- **Files**: kebab-case (`user-profile.ts`)
- **Components**: PascalCase (`UserProfile.tsx`)
- **Functions**: camelCase (`getUserProfile`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

---

## Testing

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
npm run test:e2e
```

### Coverage

```bash
npm run test:coverage
```

---

## Best Practices

### 1. استفاده از TypeScript

```typescript
// ✅ Good
interface User {
  id: number
  mobile: string
}

// ❌ Bad
// No types
```

### 2. Error Handling

```typescript
// ✅ Good
try {
  await operation()
} catch (error) {
  logError('Operation failed', error, 'module/file')
  return serverError('Operation failed')
}

// ❌ Bad
// No error handling
```

### 3. Validation

```typescript
// ✅ Good
const validation = validateMobile(mobile)
if (!validation.success) {
  return validationError(validation)
}

// ❌ Bad
// No validation
```

### 4. Security

```typescript
// ✅ Good
const securityCheck = await validateAPIRequest(request, true)
if (!securityCheck.valid) {
  return securityCheck.response!
}

// ❌ Bad
// No security check
```

---

## Troubleshooting

### مشکل: Database Connection Error

**راه‌حل**:
- بررسی POSTGREST_URL
- بررسی PostgreSQL running
- بررسی network connectivity

### مشکل: Token Validation Failed

**راه‌حل**:
- بررسی TOKEN_SECRET
- بررسی token expiration
- بررسی token format

### مشکل: CORS Errors

**راه‌حل**:
- بررسی CSP headers
- بررسی cookie settings
- بررسی sameSite settings

---

## منابع بیشتر

- [ARCHITECTURE.md](./ARCHITECTURE.md) - معماری پروژه
- [API.md](./API.md) - راهنمای API
- [CONFIGURATION.md](./CONFIGURATION.md) - Configuration

---

**آخرین به‌روزرسانی**: 2025-01-XX  
**نگهدارنده**: Development Team
