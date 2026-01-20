# راهنمای Configuration Next-Pelak

**نسخه**: 1.0.0  
**آخرین به‌روزرسانی**: 2025-01-XX

## فهرست مطالب

- [Environment Variables](#environment-variables)
- [Configuration Files](#configuration-files)
- [Project Override System](#project-override-system)
- [Security Configuration](#security-configuration)
- [Language Configuration](#language-configuration)

---

## Environment Variables

### Core Environment Variables

```bash
# Database
POSTGREST_URL=http://localhost:3000
POSTGREST_SECRET=your-secret

# Security
TOKEN_SECRET=your-jwt-secret-min-32-chars
CSRF_TOKEN_NAME=csrf_token
REFRESH_TOKEN_COOKIE=refresh_token
IDEVICE_TOKEN_NAME=idevice_token
OTP_TOKEN_NAME=otp_secret_session

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
POSTHOG_KEY=your-posthog-key
POSTHOG_HOST=https://app.posthog.com

# Storage
SSS_OBJECT=https://your-storage-url.com
```

### Project Environment Variables

تعریف در `project/config/environment/env.ts`

---

## Configuration Files

### Core Config

`core/config/config.ts`: Core configuration interface

```typescript
export interface CoreConfig {
  hooks?: Partial<HooksConfig>
}
```

### Project Config

`project/config/config.ts`: Project-specific configuration

```typescript
export const ROUTES = {
  ADMIN_ROUTE_PATTERN: /^\/[^\/]+\/(dashboard|profile)(\/.*)?$/,
}
```

### Security Config

`core/config/security.ts`: Security settings

```typescript
export const RATE_LIMIT = {
  GENERAL: { maxRequests: 5000, windowMs: 60000 },
  LOGIN: { maxRequests: 150, windowMs: 900000 },
}
```

---

## Project Override System

### Project Override File

`core/config/project-override.ts`: Project-specific overrides

```typescript
import { CoreConfig } from './config'

export const projectCoreConfig: CoreConfig = {
  hooks: {
    paths: ['@/project/hooks/custom'],
  },
}
```

### Usage

```typescript
import { setCoreConfig } from '@/core/config/config'
import { projectCoreConfig } from '@/core/config/project-override'

setCoreConfig(projectCoreConfig)
```

---

## Security Configuration

### Rate Limiting

```typescript
export const RATE_LIMIT = {
  GENERAL: {
    maxRequests: 5000,
    windowMs: TIME.MINUTE * 1000,
  },
  LOGIN: {
    maxRequests: 150,
    windowMs: 15 * TIME.MINUTE * 1000,
  },
}
```

### IP Filtering

```typescript
export const IP_FILTER = {
  ENABLE_WHITELIST: false,
  WHITELIST: ['192.168.1.1'],
  BLACKLIST: ['1.2.3.4'],
}
```

### Brute Force Protection

```typescript
export const BRUTE_FORCE = {
  MAX_ATTEMPTS: 5,
  WINDOW_MS: 15 * TIME.MINUTE * 1000,
}
```

---

## Language Configuration

### Language Setup

`project/config/language/lang.ts`: Language configuration

```typescript
export const LANGUAGE = {
  fa: { id: 310, name: 'فارسی' },
  en: { id: 311, name: 'English' },
}

export const LANGUAGE_DEFAULT = 'fa'
```

### Language Detection

```typescript
import { LANG_HEADER } from '@/core/config/lang'

const lang = LANG_HEADER(headers)
```

---

## منابع بیشتر

- [SECURITY.md](./SECURITY.md) - Security Configuration
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Setup Guide

---

**آخرین به‌روزرسانی**: 2025-01-XX  
**نگهدارنده**: Development Team
