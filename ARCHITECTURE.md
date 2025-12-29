# معماری CMS - راهنمای استفاده

## ساختار پروژه

پروژه به دو بخش اصلی تقسیم شده است:

### `/core` - سیستم پایه (Plug-and-Play)
کدهای کاملاً مستقل و قابل استفاده مجدد که در تمام پروژه‌ها مشترک هستند:
- `core/lib/` - کتابخانه‌های اصلی
  - `lib/auth/` - منطق احراز هویت
  - `lib/security/` - امنیت
  - `lib/token/` - مدیریت توکن
  - `lib/hooks/` - سیستم Hook/Plugin
    - `lib/hooks/loader.ts` - لودر خودکار hooks با configurable paths
    - `lib/hooks/registry.ts` - رجیستری hooks
    - `lib/hooks/types.ts` - تایپ‌های hooks
- `core/config/` - تنظیمات پایه
  - `config/env.ts` - متغیرهای محیطی
  - `config/security.ts` - تنظیمات امنیتی
  - `config/metadata.ts` - Metadata configuration interface
  - `config/hooks.ts` - Hooks configuration interface
  - `config/messages.ts` - Messages configuration interface
  - `config/core-config.ts` - Main configuration interface
- `core/app/` - ساختار Next.js پایه
- `core/proxy.ts` - Proxy اصلی

### `/project` - کد خاص پروژه
کدهای خاص پروژه که قابل شخصی‌سازی هستند:
- `project/config/core-override.ts` - Override کردن core configs
- `project/config/site.ts` - تنظیمات سایت
- `project/hooks/` - Hook های خاص پروژه
  - `project/hooks/auth.ts` - Hook های احراز هویت

## استفاده از سیستم کانفیگ

### Core Configuration System

Core از سیستم **Configuration Injection** استفاده می‌کند که اجازه می‌دهد پروژه‌ها configs را override کنند بدون تغییر در core.

### تنظیم Core Config

در `app/layout.tsx`:

```typescript
import { setCoreConfig } from "@/core/config/core-config";
import { projectCoreConfig } from "@/project/config/core-override";

// Set core configuration before rendering
setCoreConfig(projectCoreConfig);
```

### Override کردن Core Config

در `project/config/core-override.ts`:

```typescript
import type { CoreConfig } from '@/core/config/core-config';

export const projectCoreConfig: CoreConfig = {
  metadata: {
    site: { /* site config */ },
    siteLang: { /* language configs */ },
    language: { /* language list */ },
    robotsEnabled: false,
    themeColor: '#ffffff',
  },
  hooks: {
    paths: ['@/project/hooks/auth'],
  },
  messages: {
    invalidPath: {
      title: 'Invalid Path',
      message: 'مسیر درخواست نامعتبر است',
    },
    unauthorized: {
      title: 'Unauthorized',
      message: 'شما اجازه دسترسی ندارید',
    },
  },
};
```

### Import کانفیگ

```typescript
// ✅ درست - از core config استفاده کنید
import { ROUTES } from '@/core/config/security'
import { getCoreConfig } from '@/core/config/core-config'

// دریافت config
const config = getCoreConfig()
```

## استفاده از سیستم Hook

### ثبت Hook

```typescript
import { hookRegistry } from '@/lib/hooks'

// ثبت یک hook
hookRegistry.register('auth:after-login', async (user) => {
  // کد شما
  console.log('User logged in:', user.id)
})
```

### اجرای Hook

```typescript
import { hookRegistry } from '@/lib/hooks'

// اجرای hook
const result = await hookRegistry.execute('auth:after-login', user)

if (result.success) {
  console.log('Hooks executed successfully')
} else {
  console.error('Hook errors:', result.errors)
}
```

### Hook های موجود

- `auth:before-login` - قبل از تلاش برای login
- `auth:after-login` - بعد از login موفق
- `auth:before-logout` - قبل از logout
- `auth:after-logout` - بعد از logout
- `auth:token-refresh` - هنگام refresh شدن token

## استفاده از Hooks

### لود خودکار Hooks

Hooks به صورت خودکار در `app/layout.tsx` لود می‌شوند. شما فقط کافی است hooks خود را در `project/hooks/` ثبت کنید:

```typescript
// در /project/hooks/auth.ts
import { hookRegistry } from '@/lib/hooks'

// این hook به صورت خودکار لود و اجرا می‌شود
hookRegistry.register('auth:after-login', async (user) => {
  // منطق خاص پروژه
  console.log('User logged in:', user.id)
  
  // مثال: ارسال ایمیل خوش‌آمدگویی
  // await sendWelcomeEmail(user.mobile)
  
  // مثال: ثبت لاگ فعالیت
  // await logUserActivity(user.id, 'login')
})
```

### مثال‌های عملی

#### 1. ارسال نوتیفیکیشن بعد از لاگین

```typescript
// در /project/hooks/auth.ts
hookRegistry.register('auth:after-login', async (user) => {
  // ارسال نوتیفیکیشن push
  await sendPushNotification(user.id, {
    title: 'خوش آمدید',
    body: `سلام ${user.firstname || 'کاربر'}!`
  })
})
```

#### 2. ثبت لاگ فعالیت کاربر

```typescript
hookRegistry.register('auth:token-refresh', async (userId, ip) => {
  // ثبت لاگ refresh token برای امنیت
  await logSecurityEvent({
    userId,
    event: 'token_refresh',
    ip,
    timestamp: new Date()
  })
})
```

#### 3. پاک کردن کش قبل از logout

```typescript
hookRegistry.register('auth:before-logout', async (userId) => {
  // پاک کردن کش کاربر
  await clearUserCache(userId)
  
  // ذخیره تنظیمات کاربر
  await saveUserPreferences(userId)
})
```

### Hook های موجود و پارامترهای آن‌ها

| Hook Name | زمان اجرا | پارامترها | مثال استفاده |
|-----------|-----------|-----------|---------------|
| `auth:after-login` | بعد از login موفق | `user: { id, mobile, firstname, lastname }` | ارسال ایمیل خوش‌آمدگویی |
| `auth:before-logout` | قبل از logout | `userId: number` | ذخیره تنظیمات کاربر |
| `auth:after-logout` | بعد از logout | `userId: number` | پاک کردن کش |
| `auth:token-refresh` | بعد از refresh موفق | `userId: number, ip: string` | ثبت لاگ امنیتی |

### نکات مهم در استفاده از Hooks

1. **Hooks به صورت non-blocking اجرا می‌شوند**: اگر hook خطا بدهد، فرآیند اصلی متوقف نمی‌شود
2. **Hooks باید async باشند**: برای عملیات I/O از async/await استفاده کنید
3. **Error Handling**: خطاهای hook به صورت خودکار handle می‌شوند و لاگ می‌شوند
4. **Performance**: Hooks نباید عملیات سنگین انجام دهند که روی performance تأثیر بگذارد

## Best Practices

### 1. استفاده از Config

```typescript
// ✅ درست - از config اصلی استفاده کنید
import { ROUTES, TOKEN, RATE_LIMIT } from '@/config/security'

// ❌ اشتباه - از shared/config استفاده نکنید (حذف شده)
// import { CONFIG } from '@/shared/config/merged'
```

### 2. Override کردن Config

اگر نیاز به تغییر config دارید:

```typescript
// در /project/config/override.ts
import { ROUTES as BASE_ROUTES } from '@/config/security'

export const PROJECT_CONFIG = {
  ROUTES: {
    ...BASE_ROUTES,
    ADMIN_ROUTE_PATTERN: /^\/[^\/]+\/(dashboard|profile|admin)(\/.*)?$/,
  },
}
```

سپس در کد خود از `PROJECT_CONFIG` استفاده کنید یا مستقیماً از `@/config/security`.

### 3. اضافه کردن Hook جدید

1. Hook را در `project/hooks/` ثبت کنید
2. Hook را در `lib/hooks/index.ts` مستند کنید
3. Hook را در API route مربوطه اجرا کنید (اگر hook جدید است)

### 4. ساختار فایل‌های Project

```
project/
├── config/
│   ├── core-override.ts     # Override core configs
│   ├── site.ts              # Site configuration
│   └── override.ts          # Legacy override (optional)
└── hooks/
    ├── auth.ts              # Hook های احراز هویت
    └── custom.ts            # Hook های سفارشی دیگر (اختیاری)
```

### 5. استفاده مجدد در پروژه‌های دیگر

برای استفاده از این ساختار در پروژه جدید:

1. **کپی کردن `/core`** به پروژه جدید (کاملاً مستقل است)
2. **اضافه کردن path alias** `@/core/*` به `tsconfig.json`
3. **ایجاد `/project`** در پروژه جدید
4. **ایجاد `project/config/core-override.ts`** برای override کردن configs
5. **ایجاد `app/layout.tsx`** که `setCoreConfig()` را فراخوانی می‌کند
6. **ایجاد `middleware.ts` یا `proxy.ts` در root** که از core re-export می‌کند
7. **به‌روزرسانی:** فقط `/core` را به‌روز کنید - project configs بدون تغییر باقی می‌مانند

## نکات مهم

1. **از `/lib` و `/config` اصلی استفاده کنید** - این فایل‌ها برای Next.js ضروری هستند
2. **کانفیگ override ها را در `/project/config/override.ts` قرار دهید**
3. **Hook های خاص پروژه را در `/project/hooks/` قرار دهید**
4. **برای اضافه کردن hook جدید، آن را در `/lib/hooks/index.ts` مستند کنید**
5. **Hooks به صورت خودکار لود می‌شوند** - نیازی به import دستی نیست
6. **Hooks باید non-blocking باشند** - از `runAsync` برای اجرای async استفاده می‌شود

## ساختار نهایی

```
/
├── core/                     # سیستم پایه (Plug-and-Play)
│   ├── lib/                  # کتابخانه‌های اصلی
│   │   ├── hooks/            # سیستم Hook
│   │   │   ├── loader.ts     # لودر خودکار hooks (configurable)
│   │   │   ├── registry.ts   # رجیستری hooks
│   │   │   ├── types.ts      # تایپ‌های hooks
│   │   │   └── index.ts      # Export اصلی
│   │   ├── auth/             # احراز هویت
│   │   ├── security/         # امنیت
│   │   └── token/            # مدیریت توکن
│   ├── config/               # تنظیمات پایه
│   │   ├── env.ts            # متغیرهای محیطی
│   │   ├── security.ts       # تنظیمات امنیتی
│   │   ├── metadata.ts       # Metadata config interface
│   │   ├── hooks.ts          # Hooks config interface
│   │   ├── messages.ts        # Messages config interface
│   │   └── core-config.ts    # Main config interface
│   ├── app/                  # ساختار Next.js پایه
│   │   └── layout.tsx        # Base layout (uses config injection)
│   └── proxy.ts              # Proxy اصلی
├── project/                  # کد خاص پروژه (شخصی‌سازی)
│   ├── config/
│   │   ├── core-override.ts  # Override core configs
│   │   └── site.ts           # Site configuration
│   └── hooks/
│       └── auth.ts           # Hook های احراز هویت
├── app/                      # Next.js app directory
│   ├── layout.tsx            # Set core config + use CoreLayout
│   └── api/                  # API routes
│       └── auth/             # Routes احراز هویت
└── middleware.ts             # Re-export proxy from core (Next.js requirement)
```

## بهینه‌سازی دیتابیس

### Index های مهم

برای عملکرد بهتر، index های زیر در دیتابیس ایجاد شده‌اند:

- `idx_refresh_tokens_user_device`: Composite index روی `(user_id, idevice)` برای جستجوی سریع‌تر
- `idx_refresh_tokens_expires_at`: Index روی `expires_at` برای cleanup
- `idx_refresh_tokens_token_hash`: Index روی `token_hash` برای جستجوی توکن

### استفاده از Index

Index `idx_refresh_tokens_user_device` به صورت partial index است و فقط روی توکن‌های فعال (`expires_at > NOW() AND revoked_at IS NULL`) ایجاد شده است که باعث بهبود عملکرد می‌شود.

## مثال کامل: استفاده در پروژه جدید

### مرحله 1: کپی کردن Core

```bash
# کپی کردن core به پروژه جدید
cp -r core/ new-project/
```

### مرحله 2: تنظیم TypeScript

```json
// new-project/tsconfig.json
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
// new-project/project/config/core-override.ts
import type { CoreConfig } from '@/core/config/core-config';

export const projectCoreConfig: CoreConfig = {
  metadata: {
    site: {
      Data: {
        url: 'https://example.com',
        appName: 'My App',
        logo: '/logo.png',
        googleVerification: '',
        twitter: '',
      },
      Theme: { light: '#ffffff', dark: '#000000' },
      Number: { imageWidth: 1200, imageHeight: 630, logoSize: 256 },
    },
    siteLang: { /* language configs */ },
    language: { default: 'en', list: { en: 'English' } },
  },
  hooks: {
    paths: ['@/project/hooks/auth'],
  },
  messages: {
    invalidPath: { title: 'Invalid Path', message: 'Invalid path' },
    unauthorized: { title: 'Unauthorized', message: 'Unauthorized' },
  },
};
```

### مرحله 4: ایجاد App Layout

```typescript
// new-project/app/layout.tsx
import CoreLayout from "@/core/app/layout";
import { setCoreConfig } from "@/core/config/core-config";
import { projectCoreConfig } from "@/project/config/core-override";

setCoreConfig(projectCoreConfig);

export default async function RootLayout({ children }) {
  return <CoreLayout>{children}</CoreLayout>
}
```

### مرحله 5: ایجاد Proxy/Middleware

```typescript
// new-project/middleware.ts یا proxy.ts
import coreProxy from '@/core/proxy'
import { config as proxyConfig } from '@/core/proxy'
export default coreProxy
export const config = proxyConfig
```

### مرحله 6: ایجاد Project Hooks

```typescript
// new-project/project/hooks/auth.ts
import { hookRegistry } from '@/core/lib/hooks'

hookRegistry.register('auth:after-login', async (user) => {
  // منطق خاص پروژه جدید
  await sendCustomNotification(user.id)
})
```

### مرحله 7: به‌روزرسانی

```bash
# فقط core را به‌روز کنید
# project configs شما بدون تغییر باقی می‌مانند
cp -r core/ new-project/
```
