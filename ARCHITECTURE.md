# معماری CMS - راهنمای استفاده

## ساختار پروژه

پروژه به دو بخش اصلی تقسیم شده است:

### `/lib` - کتابخانه‌های اصلی
کدهای قابل استفاده مجدد که در تمام پروژه‌ها مشترک هستند:
- `lib/auth/` - منطق احراز هویت
- `lib/security/` - امنیت
- `lib/token/` - مدیریت توکن
- `lib/hooks/` - سیستم Hook/Plugin
  - `lib/hooks/loader.ts` - لودر خودکار hooks پروژه
  - `lib/hooks/registry.ts` - رجیستری hooks
  - `lib/hooks/types.ts` - تایپ‌های hooks

### `/config` - تنظیمات پایه
- `config/security.ts` - تنظیمات امنیتی
- `config/env.ts` - متغیرهای محیطی

### `/project` - کد خاص پروژه
کدهای خاص پروژه Pelak که قابل شخصی‌سازی هستند:
- `project/config/override.ts` - تنظیمات override
- `project/hooks/` - Hook های خاص پروژه
  - `project/hooks/auth.ts` - Hook های احراز هویت

## استفاده از سیستم کانفیگ

### Import کانفیگ

```typescript
// ✅ درست - از config اصلی استفاده کنید
import { ROUTES } from '@/config/security'
```

### Override کانفیگ

برای override کردن کانفیگ در پروژه خود:

1. فایل `/project/config/override.ts` را ویرایش کنید:

```typescript
import { ROUTES as BASE_ROUTES } from '@/config/security'

export const PROJECT_CONFIG = {
  ROUTES: {
    ADMIN_ROUTE_PATTERN: /^\/[^\/]+\/(dashboard|profile|admin)(\/.*)?$/,
    DEFAULT_LANG: 'fa',
  },
}
```

2. در فایل‌های خود از `PROJECT_CONFIG` استفاده کنید یا مستقیماً از `@/config/security` استفاده کنید.

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
│   └── override.ts          # Override config ها
└── hooks/
    ├── auth.ts              # Hook های احراز هویت
    └── custom.ts            # Hook های سفارشی دیگر (اختیاری)
```

### 5. استفاده مجدد در پروژه‌های دیگر

برای استفاده از این ساختار در پروژه جدید:

1. کپی کردن `/lib` و `/config` به پروژه جدید
2. ایجاد `/project` در پروژه جدید
3. شخصی‌سازی hooks و config در `/project`
4. به‌روزرسانی: فقط `/lib` و `/config` را به‌روز کنید

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
├── lib/                      # کتابخانه‌های اصلی (قابل استفاده مجدد)
│   ├── hooks/                # سیستم Hook
│   │   ├── loader.ts         # لودر خودکار hooks
│   │   ├── registry.ts       # رجیستری hooks
│   │   ├── types.ts          # تایپ‌های hooks
│   │   └── index.ts          # Export اصلی
│   ├── auth/                 # احراز هویت
│   ├── security/             # امنیت
│   └── token/                 # مدیریت توکن
├── config/                   # تنظیمات پایه (قابل استفاده مجدد)
│   ├── security.ts           # تنظیمات امنیتی
│   └── env.ts                # متغیرهای محیطی
├── project/                  # کد خاص پروژه (شخصی‌سازی)
│   ├── config/
│   │   └── override.ts        # Override کانفیگ
│   └── hooks/
│       └── auth.ts            # Hook های احراز هویت
└── app/                      # Next.js app directory
    ├── layout.tsx             # لود hooks در اینجا
    └── api/                   # API routes
        └── auth/              # Routes احراز هویت
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

### مرحله 1: کپی کردن ساختار پایه

```bash
# کپی کردن lib و config به پروژه جدید
cp -r lib/ new-project/
cp -r config/ new-project/
```

### مرحله 2: ایجاد project hooks

```typescript
// در new-project/project/hooks/auth.ts
import { hookRegistry } from '@/lib/hooks'

hookRegistry.register('auth:after-login', async (user) => {
  // منطق خاص پروژه جدید
  await sendCustomNotification(user.id)
})
```

### مرحله 3: به‌روزرسانی

```bash
# فقط lib و config را به‌روز کنید
# project hooks شما بدون تغییر باقی می‌ماند
```
