# Next-Pelak

یک سیستم مدیریت محتوا (CMS) کامل و قابل استفاده مجدد برای پروژه‌های Next.js با معماری Plug-and-Play.

## ویژگی‌ها

- ✅ **معماری Plug-and-Play**: Core کاملاً مستقل و قابل کپی به پروژه‌های جدید
- ✅ **سیستم احراز هویت کامل**: Login, Logout, Refresh Token, OTP
- ✅ **امنیت پیشرفته**: CSRF Protection, Rate Limiting, Brute Force Protection, IP Filtering
- ✅ **سیستم Hook/Plugin**: قابلیت توسعه با Hook System
- ✅ **پشتیبانی چندزبانه**: ساختار آماده برای چندزبانه
- ✅ **Performance Monitoring**: ردیابی عملکرد و خطاها
- ✅ **TypeScript**: پشتیبانی کامل از TypeScript
- ✅ **Database Ready**: Schema و Migrations آماده

## ساختار پروژه

```
/
├── core/                     # سیستم پایه (Plug-and-Play)
│   ├── lib/                  # کتابخانه‌های اصلی
│   │   ├── auth/             # احراز هویت
│   │   ├── security/         # امنیت
│   │   ├── token/            # مدیریت توکن
│   │   └── hooks/            # سیستم Hook
│   ├── config/               # تنظیمات پایه
│   ├── app/                  # ساختار Next.js پایه
│   │   └── api/              # API Routes
│   └── components/           # کامپوننت‌های پایه
├── project/                  # کد خاص پروژه
│   ├── config/               # تنظیمات پروژه
│   └── hooks/                # Hook های خاص پروژه
├── app/                      # Next.js App Directory
│   ├── api/                  # API Routes (wrapper files)
│   └── [lang]/               # صفحات چندزبانه
└── proxy.ts                  # Middleware (re-export from core)
```

## نصب و راه‌اندازی

### پیش‌نیازها

- Node.js 18+ 
- npm یا yarn
- PostgreSQL (برای دیتابیس)

### نصب

```bash
# Clone repository
git clone https://github.com/M9020120014/Next-Pelak.git
cd Next-Pelak

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

### تنظیمات Environment Variables

فایل `.env.local` را با مقادیر زیر ایجاد کنید:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Redis (optional, for rate limiting)
REDIS_URL=redis://localhost:6379

# JWT Secret
JWT_SECRET=your-secret-key-here

# OTP Service URL
OTP_SERVICE_URL=https://your-otp-service.com

# Other settings
NODE_ENV=development
```

### راه‌اندازی دیتابیس

```bash
# اجرای فایل master برای ایجاد تمام جداول و توابع
psql -U your_user -d your_database -f core/database/master.sql

# یا اجرای جداگانه فایل‌ها:
# Schema (جداول)
psql -U your_user -d your_database -f core/database/schema/01_auth_tables.sql
psql -U your_user -d your_database -f core/database/schema/02_content_tables.sql
psql -U your_user -d your_database -f core/database/schema/03_comments_tables.sql
psql -U your_user -d your_database -f core/database/schema/04_sequences.sql

# Functions (توابع)
psql -U your_user -d your_database -f core/database/functions/01_auth_functions.sql
psql -U your_user -d your_database -f core/database/functions/02_content_functions.sql
psql -U your_user -d your_database -f core/database/functions/03_comments_functions.sql

# Migration (در صورت نیاز)
psql -U your_user -d your_database -f core/database/migrations/database_migration.sql
```

برای جزئیات بیشتر، به [DATABASE.md](DATABASE.md) مراجعه کنید.

### اجرای پروژه

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Type checking
npm run check:types

# Linting
npm run lint
```

پروژه در `http://localhost:3131` اجرا می‌شود.

## استفاده از Core در پروژه جدید

Core کاملاً مستقل است و می‌تواند به پروژه‌های دیگر کپی شود:

### مرحله 1: کپی Core

```bash
cp -r core/ new-project/
```

### مرحله 2: تنظیم TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/core/*": ["./core/*"]
    }
  }
}
```

### مرحله 3: ایجاد Project Config

```typescript
// project/config/core-override.ts
import type { CoreConfig } from '@/core/config/config';

export const projectCoreConfig: CoreConfig = {
  metadata: { /* your config */ },
  hooks: { paths: ['@/core/hooks/auth'] },
  messages: { /* your messages */ },
};
```

### مرحله 4: ایجاد App Layout

```typescript
// app/layout.tsx
import CoreLayout from "@/core/app/layout";
import { setCoreConfig } from "@/core/config/config";
import { projectCoreConfig } from "@/project/config/core-override";

setCoreConfig(projectCoreConfig);

export default async function RootLayout({ children }) {
  return <CoreLayout>{children}</CoreLayout>
}
```

### مرحله 5: ایجاد Proxy/Middleware

```typescript
// proxy.ts یا middleware.ts
import coreProxy from '@/core/proxy'
export default coreProxy
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

برای جزئیات بیشتر، به [ARCHITECTURE.md](ARCHITECTURE.md) مراجعه کنید.

## API Routes

### احراز هویت

- `POST /api/auth/login` - ورود کاربر
- `POST /api/auth/logout` - خروج کاربر
- `POST /api/auth/logout-all` - خروج از همه دستگاه‌ها
- `POST /api/auth/refresh` - تمدید توکن
- `POST /api/auth/otp` - ارسال/تایید OTP
- `POST /api/auth/verification-user` - تایید کاربر
- `POST /api/auth/verification-register` - ثبت‌نام
- `POST /api/auth/verification-password` - تنظیم رمز عبور

### سایر

- `GET /api/health` - بررسی وضعیت سرویس
- `POST /api/logger` - ثبت لاگ از سمت کلاینت

برای جزئیات API، به [DATABASE.md](DATABASE.md) و [docs/api/README.md](docs/api/README.md) مراجعه کنید.

## سیستم Hook

برای اضافه کردن منطق خاص پروژه:

```typescript
// core/hooks/auth.ts
import { hookRegistry } from '@/core/lib/hooks'

hookRegistry.register('auth:after-login', async (user) => {
  // منطق خاص پروژه
  console.log('User logged in:', user.id)
})
```

Hook های موجود:
- `auth:after-login` - بعد از login موفق
- `auth:before-logout` - قبل از logout
- `auth:after-logout` - بعد از logout
- `auth:token-refresh` - بعد از refresh موفق

برای جزئیات بیشتر، به [ARCHITECTURE.md](ARCHITECTURE.md) مراجعه کنید.

## امنیت

پروژه شامل لایه‌های امنیتی زیر است:

- ✅ CSRF Protection
- ✅ Rate Limiting
- ✅ Brute Force Protection
- ✅ IP Filtering
- ✅ Input Validation & Sanitization
- ✅ SQL Injection Prevention (Parameterized Queries)
- ✅ XSS Protection
- ✅ Security Headers (CSP, HSTS, etc.)
- ✅ Token Rotation & Expiration

## Performance

- ✅ Non-blocking operations با `runAsync`
- ✅ Caching strategies
- ✅ Database query optimization
- ✅ Image optimization
- ✅ Bundle size optimization

## مستندات

- [ARCHITECTURE.md](ARCHITECTURE.md) - راهنمای معماری و استفاده
- [DATABASE.md](DATABASE.md) - مستندات دیتابیس و API
- [docs/api/README.md](docs/api/README.md) - مستندات API (OpenAPI/Swagger)
- [core/README.md](core/README.md) - راهنمای استفاده از Core
- [CHANGELOG.md](CHANGELOG.md) - تاریخچه تغییرات

## توسعه

### ساختار Core

Core کاملاً مستقل است و نباید وابستگی به project داشته باشد. تمام کدهای مشترک در `core/` قرار دارند.

### ساختار Project

کدهای خاص پروژه در `project/` قرار دارند و می‌توانند configs را override کنند.

### Best Practices

1. **از Core استفاده کنید**: برای کدهای مشترک از core استفاده کنید
2. **Config Override**: برای تغییرات از `project/config/core-override.ts` استفاده کنید
3. **Hooks**: برای منطق خاص پروژه از Hook System استفاده کنید
4. **Type Safety**: از TypeScript برای type safety استفاده کنید

## تست

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Deploy

### Vercel

```bash
# Build
npm run build

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t next-pelak .

# Run container
docker run -p 3131:3131 next-pelak
```

برای جزئیات بیشتر، به [DOCKER_README.md](DOCKER_README.md) مراجعه کنید.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

**Mahdi Goodini**
- Email: m9020120014@gmail.com
- GitHub: [@M9020120014](https://github.com/M9020120014)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

برای پشتیبانی و سوالات، لطفاً یک Issue ایجاد کنید.
