# تحلیل کامل ساختار پروژه Next-Pelak

این مستند شامل تحلیل و بررسی کامل ساختار پروژه Next-Pelak با تمام جزئیات فنی است.

> **⚠️ نکته مهم**: فایل‌های موجود در `project/config/` (شامل `core-override.ts`, `site.ts`, و `override.ts`) بخشی از سیستم Core هستند و باید همراه با core در پروژه‌های جدید کپی شوند.

---

## 1. نمای کلی پروژه

Next-Pelak یک سیستم مدیریت محتوا (CMS) کامل و قابل استفاده مجدد برای پروژه‌های Next.js است که با معماری **Plug-and-Play** طراحی شده است.

### ویژگی‌های کلیدی:
- ✅ **معماری Plug-and-Play**: Core کاملاً مستقل و قابل کپی به پروژه‌های جدید
- ✅ **سیستم احراز هویت کامل**: Login, Logout, Refresh Token, OTP
- ✅ **امنیت پیشرفته**: CSRF Protection, Rate Limiting, Brute Force Protection, IP Filtering
- ✅ **سیستم Hook/Plugin**: قابلیت توسعه با Hook System
- ✅ **پشتیبانی چندزبانه**: ساختار آماده برای چندزبانه
- ✅ **Performance Monitoring**: ردیابی عملکرد و خطاها
- ✅ **TypeScript**: پشتیبانی کامل از TypeScript
- ✅ **Database Ready**: Schema و Migrations آماده

### نسخه فعلی: 0.2.1

---

## 2. معماری کلی پروژه

پروژه به سه لایه اصلی تقسیم شده است:

### ساختار سه‌لایه:

1. **Core Layer** (`/core` + `project/config/*`): کدهای مستقل و قابل استفاده مجدد
   - شامل فایل‌های config در `project/config/` که بخشی از Core هستند
2. **Project Layer** (`/project`): کدهای خاص پروژه و overrideها
   - شامل hooks، components، و data های خاص پروژه
3. **App Layer** (`/app`): ساختار Next.js و wrapper files

**نکته مهم**: فایل‌های config که قبلاً در `project/config/` بودند، اکنون به `core/config/` منتقل شده‌اند:
- `core/config/project-override.ts` (قبلاً `project/config/core-override.ts`)
- `core/config/site.ts` (قبلاً `project/config/site.ts`)
- `core/config/project-override-legacy.ts` (قبلاً `project/config/override.ts`)

### نمودار معماری:

```
┌────────────────────────────────────────────────────────┐
│                   Next.js App Directory                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   app/api/   │  │ app/[lang]/  │  │  app/layout  │  │
│  │  (wrappers)  │  │   (page)    │  │  (config)    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼─────────────────┼─────────────────┼──────────┘
          │                 │                 │
          │                 │                 │
┌─────────┼─────────────────┼─────────────────┼──────────┐
│         │                 │                 │          │
│  ┌──────▼─────────────────▼─────────────────▼──────┐   │
│  │         Core System (Plug-and-Play)             │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐       │   │
│  │  │   lib/   │  │  config/ │  │   app/   │       │   │
│  │  │ security │  │ metadata │  │   api/   │       │   │
│  │  │   auth   │  │  hooks   │  │components│       │   │
│  │  │  hooks   │  │messages  │  │database  │       │   │
│  │  └──────────┘  └──────────┘  └──────────┘       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │      Project Specific (Customization)            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │  │
│  │  │ config/  │  │  hooks/  │  │components│        │  │
│  │  │override  │  │   auth   │  │  page/  │        │  │
│  │  └──────────┘  └──────────┘  └──────────┘        │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 3. ساختار دایرکتوری‌ها

### 3.1. Core Directory (`/core`)

کدهای کاملاً مستقل که در تمام پروژه‌ها مشترک هستند:

```
core/
├── lib/                    # کتابخانه‌های اصلی
│   ├── auth/              # احراز هویت
│   │   ├── use-auth.ts    # Client-side auth hook
│   │   └── token-manager.ts
│   ├── security/          # امنیت (11 فایل)
│   │   ├── api-middleware.ts      # Security middleware
│   │   ├── authorization.ts       # Authorization checks
│   │   ├── brute-force.ts         # Brute force protection
│   │   ├── cookies.ts              # Cookie management
│   │   ├── ip-filter.ts            # IP filtering
│   │   ├── rate-limit.ts            # Rate limiting (memory)
│   │   ├── rate-limit-redis.ts     # Rate limiting (Redis)
│   │   ├── request-limits.ts       # Request size limits
│   │   ├── ssrf-protection.ts      # SSRF protection
│   │   ├── monitoring.ts           # Security monitoring
│   │   └── audit-log.ts            # Audit logging
│   ├── token/             # مدیریت توکن
│   │   ├── jwt.ts                  # JWT server-side
│   │   ├── jwt-client.ts           # JWT client-side
│   │   ├── auth-cookie.ts          # Cookie management
│   │   └── idevice.ts              # Device identification
│   ├── hooks/             # سیستم Hook
│   │   ├── registry.ts             # Hook registry
│   │   ├── loader.ts               # Hook loader
│   │   ├── types.ts                # Hook types
│   │   └── index.ts                # Exports
│   ├── rest/              # RPC Client
│   │   └── rpc.ts                  # Database RPC calls
│   ├── otp/               # سرویس OTP
│   │   └── service.ts
│   ├── log/               # Logger
│   │   └── logger.ts
│   ├── performance/       # Performance Monitoring
│   │   └── monitoring.ts
│   ├── api/               # API Utilities
│   │   ├── cache.ts
│   │   ├── error-handler.ts
│   │   ├── error-messages.ts
│   │   └── response.ts
│   ├── validation.ts      # Input Validation
│   ├── schema.ts          # Validation schemas
│   └── utils/
│       └── async.ts       # Async utilities
├── config/                # تنظیمات پایه
│   ├── config.ts     # Main Config Interface
│   ├── metadata.ts        # Metadata config
│   ├── hooks.ts           # Hooks config
│   ├── messages.ts        # Messages config
│   ├── security.ts        # Security config
│   └── env.ts             # Environment variables
│
⚠️ نکته: فایل‌های config در core/config/ هستند:
│   core/config/project-override.ts         # Core Config Override
│   core/config/site.ts                    # Site Configuration
│   core/config/project-override-legacy.ts  # Legacy Override
├── app/                   # ساختار Next.js پایه
│   ├── layout.tsx         # Base Layout
│   └── api/               # API Routes
│       └── auth/
│           ├── login/route.ts
│           ├── logout/route.ts
│           ├── logout-all/route.ts
│           ├── refresh/route.ts
│           ├── otp/route.ts
│           ├── verification-user/route.ts
│           ├── verification-register/route.ts
│           └── verification-password/route.ts
├── components/            # کامپوننت‌های پایه
│   ├── auth/
│   │   ├── ConnectionError.tsx
│   │   ├── login.tsx
│   │   ├── logout-all.tsx
│   │   └── verification.tsx
│   ├── provider/
│   │   ├── Provider.tsx
│   │   └── Security.tsx
│   └── security/
│       ├── SecurityErrorBoundary.tsx
│       └── SecurityProvider.tsx
├── database/             # دیتابیس
│   ├── schema/
│   │   └── database_tables.sql
│   ├── migrations/
│   │   └── database_migration.sql
│   └── functions/
│       └── database_functions.sql
├── styles/               # استایل‌ها
│   ├── globals.css
│   └── pelak.css
├── asset/                # Assets
│   ├── fonts/
│   │   ├── ltr-text.woff/woff2
│   │   ├── ltr-title.woff/woff2
│   │   ├── rtl-text.woff/woff2
│   │   └── rtl-title.woff/woff2
│   └── media/
│       └── svg.tsx
├── data/
│   └── metadata/
│       └── base.ts
├── types/                # Type definitions
├── proxy.ts              # Middleware اصلی
└── README.md             # Core documentation
```

### 3.2. Project Directory (`/project`)

کدهای خاص پروژه که قابل شخصی‌سازی هستند:

```
project/
├── hooks/
│   └── auth.ts            # Hook های احراز هویت (خاص پروژه)
├── components/
│   └── page/
│       ├── DashboardClient.tsx
│       ├── HomeClient.tsx
│       └── ProfileClient.tsx
├── data/
│   └── metadata/
│       └── metadata.ts
└── types/
    └── configs/
        └── site.ts
```

**نکته**: فایل‌های config که قبلاً در `project/config/` بودند، اکنون به `core/config/` منتقل شده‌اند و بخشی از Core هستند.

### 3.3. App Directory (`/app`)

ساختار Next.js App Router:

```
app/
├── layout.tsx             # Root Layout (sets config)
├── manifest.ts            # PWA Manifest
├── robots.ts              # Robots.txt
├── sitemap.ts             # Sitemap.xml
├── not-found.tsx          # 404 Page
├── page.tsx               # Root Page
├── api/                   # API Wrapper Files
│   ├── auth/
│   │   ├── login/route.ts         # Re-export from core
│   │   ├── logout/route.ts
│   │   ├── logout-all/route.ts
│   │   ├── refresh/route.ts
│   │   ├── otp/route.ts
│   │   ├── verification-user/route.ts
│   │   ├── verification-register/route.ts
│   │   └── verification-password/route.ts
│   ├── health/route.ts
│   └── logger/route.ts
└── [lang]/                # Multilingual Pages
    ├── layout.tsx
    ├── page.tsx
    ├── (admin)/           # Protected routes
    │   ├── dashboard/page.tsx
    │   └── profile/page.tsx
    ├── (auth)/            # Auth routes
    │   ├── login/page.tsx
    │   ├── logout-all/page.tsx
    │   └── verification/page.tsx
    └── ali/page.tsx       # Example page
```

---

## 4. سیستم Configuration

### 4.1. Configuration Injection Pattern

پروژه از الگوی **Configuration Injection** استفاده می‌کند که اجازه می‌دهد پروژه‌ها configs را override کنند بدون تغییر در core.

**نکته مهم**: فایل‌های config در `core/config/` هستند:
- `project-override.ts`: فایل اصلی برای override کردن Core Configs (قبلاً `project/config/core-override.ts`)
- `site.ts`: تنظیمات سایت که در project-override استفاده می‌شود (قبلاً `project/config/site.ts`)
- `project-override-legacy.ts`: Legacy override (قبلاً `project/config/override.ts`)

این فایل‌ها بخشی از ساختار Core هستند و همراه با core منتقل می‌شوند.

### جریان Configuration:

```
1. Project Config (core/config/project-override.ts)
   ├─ Import from core/config/site.ts
   └─ Import from core/config/project-override-legacy.ts (optional)
   ↓
2. app/layout.tsx → setCoreConfig(projectCoreConfig)
   ↓
3. Core Components → getCoreConfig()
   ↓
4. Merge with Defaults → Return Merged Config
```

### 4.2. Config Structure

```typescript
interface CoreConfig {
  metadata?: Partial<MetadataConfig>    // SEO, Metadata
  hooks?: Partial<HooksConfig>           // Hook paths
  messages?: Partial<MessagesConfig>    // Error messages
}
```

### 4.3. Config Files

#### Core Config (`core/config/config.ts`):
- `setCoreConfig()`: تنظیم config از project
- `getCoreConfig()`: دریافت config با merge defaults
- `resetCoreConfig()`: ریست config (برای testing)

#### Project Config (`core/config/project-override.ts`):
- `projectCoreConfig`: Config خاص پروژه
- Override کردن metadata, hooks, messages
- **بخشی از سیستم Core**: این فایل همراه با core منتقل می‌شود

#### فایل‌های مرتبط با Core Config:
- `core/config/site.ts`: تنظیمات سایت (زبان‌ها، metadata، theme)
- `core/config/project-override-legacy.ts`: Legacy override برای routes (اختیاری)
- `core/config/types.ts`: Type definitions برای site config

**نکته**: این فایل‌ها در `core/config/` و `core/types/` قرار دارند و بخشی از سیستم Core هستند.

---

## 5. سیستم احراز هویت

### 5.1. Authentication Flow

فرآیند کامل احراز هویت:

```
1. Client Request → proxy.ts
   ├─ Check Refresh Token Format
   ├─ If Invalid → Redirect to Login
   └─ If Valid → Allow Access

2. Client → POST /api/auth/login
   ├─ Validate CSRF Token
   ├─ Rate Limiting Check
   ├─ IP Filtering
   ├─ Request Size Validation
   ├─ Brute Force Check
   ├─ Input Validation & Sanitization
   ├─ Database Function: pelak_auth_login()
   │  ├─ Check Account Lock
   │  ├─ Verify Password (bcrypt)
   │  ├─ Reset Failed Attempts
   │  ├─ Create Refresh Token (UUID)
   │  └─ Hash Token (SHA-256)
   ├─ Execute Hook: auth:after-login
   ├─ Generate Access Token (JWT)
   ├─ Set Refresh Token Cookie (HttpOnly)
   └─ Return Access Token
```

### 5.2. Token Management

#### Refresh Token:
- **ذخیره**: HttpOnly Cookie (امن‌تر از localStorage)
- **Hash**: SHA-256 در دیتابیس
- **انقضا**: 7 روز
- **Token Rotation**: هر refresh توکن جدید می‌سازد
- **Theft Detection**: اگر توکن نامعتبر استفاده شود، تمام توکن‌های کاربر حذف می‌شوند

#### Access Token:
- **ذخیره**: Memory (client-side)
- **نوع**: JWT
- **انقضا**: 15 دقیقه (کوتاه برای امنیت)
- **ارسال**: Header `Authorization: Bearer <token>`
- **Auto-refresh**: به صورت خودکار refresh می‌شود

### 5.3. Database Functions

توابع دیتابیس در schema `public` تعریف شده‌اند:

| تابع | کاربرد | پارامترها |
|------|--------|-----------|
| `pelak_auth_register` | ثبت کاربر جدید | `mobile`, `otp_secret` |
| `pelak_auth_password` | تنظیم رمز عبور | `mobile`, `password`, `otp_secret` |
| `pelak_auth_login` | ورود کاربر | `mobile`, `password`, `idevice` |
| `pelak_auth_refreshtoken` | تمدید توکن | `refreshtoken`, `idevice`, `ip` |
| `pelak_auth_revoketoken` | لغو توکن یک دستگاه | `userid`, `idevice` |
| `pelak_auth_revokeall` | لغو تمام توکن‌ها | `mobile` |
| `pelak_auth_archive_inactive_tokens` | آرشیو توکن‌های غیرفعال | - |
| `pelak_auth_checkuser` | بررسی وجود کاربر | `mobile` |
| `pelak_auth_checkrefreshtoken` | بررسی توکن با idevice | `idevice` |
| `pelak_auth_checkrefreshtoken_mobile` | بررسی توکن با mobile | `mobile` |
| `pelak_auth_checkrefreshtoken_device_mobile` | بررسی توکن با device و mobile | `idevice`, `mobile` |
| `pelak_user_get` | دریافت اطلاعات کاربر | `userid` |
| `pelak_user_updatename` | به‌روزرسانی نام کاربر | `userid`, `firstname`, `lastname` |
| `pelak_user_updateprofile` | به‌روزرسانی تصویر پروفایل | `userid`, `profileimage`, `profileurl` |
| `pelak_comment_get` | دریافت نظرات | `pageid`, `sort_type`, `userid` |
| `pelak_comment_create` | ایجاد نظر | `userid`, `pageid`, `content`, `parentid` |
| `pelak_comment_toggle` | لایک/آنلایک نظر | `userid`, `commentid` |
| `pelak_page_getsummaries` | دریافت خلاصه صفحات | `limit`, `offset`, `lang` |
| `pelak_page_geturl` | دریافت صفحه با URL | `url` |
| `project_selector_get` | دریافت سلکتورها | `typeidentifier` |
| `project_selector_gettree` | دریافت سلکتورها به صورت درختی | `typeidentifier` |
| `project_user_additional` | دریافت اطلاعات تکمیلی | `userid` |
| `project_user_additionala` | تکمیل مرحله 1 | `userid`, `nationalcode`, `birthday`, ... |
| `project_user_additionalb` | تکمیل مرحله 2 | `userid`, `job`, `motivation`, ... |
| `project_user_additionalc` | تکمیل مرحله 3 | `userid`, `skills`, `degreeid`, ... |
| `project_user_additionald` | تکمیل مرحله 4 | `userid`, `consent` |

### 5.4. Database Schema

#### جدول `auth.users`:
```sql
- id (PK, auto increment)
- mobile (UNIQUE, NOT NULL)
- userpassword (bcrypt hash)
- firstname, lastname
- register_date, last_login
- failed_attempt (default: 0)
- is_active (default: true)
- email
- otp_secret (موقت برای ثبت‌نام)
- password_changed_at
- locked_until (NULL = قفل نیست)
- created_at, updated_at
```

**Indexes:**
- `idx_users_mobile` (UNIQUE)
- `idx_users_is_active`

#### جدول `auth.refreshtokens`:
```sql
- id (PK, auto increment)
- token_hash (UNIQUE, SHA-256)
- userid (FK → users.id)
- idevice (NOT NULL)
- expires_at (NOT NULL)
- created_at
- revoked_at (NULL = فعال)
- last_used_at
- last_used_ip (inet)
```

**Indexes:**
- `idx_refreshtokens_token_hash` (UNIQUE)
- `idx_refreshtokens_userid`
- `idx_refreshtokens_expires_at`
- `idx_refreshtokens_user_device` (Composite, Partial)

**نکته مهم**: این جدول فقط توکن‌های فعال را نگه می‌دارد (`expires_at > NOW() AND revoked_at IS NULL`)

#### جدول `auth.refreshtokens_history`:
```sql
- id (PK)
- token_hash
- userid
- idevice
- expires_at
- created_at
- revoked_at
- last_used_at
- last_used_ip
- archived_at (زمان انتقال)
```

**کاربرد**: Audit و نگهداری تاریخچه

---

## 6. سیستم امنیت

### 6.1. Security Layers

پروژه از چندین لایه امنیتی استفاده می‌کند:

```
Layer 1: proxy.ts (Middleware)
├─ Path Traversal Protection
├─ Authentication Check (Format Validation)
└─ CSRF Token Generation

Layer 2: validateAPIRequest() (API Middleware)
├─ IP Filtering
├─ Request Size Validation
├─ Rate Limiting
└─ CSRF Validation

Layer 3: Route Handler
├─ Brute Force Protection
├─ Input Validation
├─ Input Sanitization
└─ Database Function Calls

Layer 4: Database Functions
├─ Account Locking
├─ Password Verification (bcrypt)
├─ Token Rotation
└─ Theft Detection
```

### 6.2. Security Features

#### 1. CSRF Protection
- Token در Cookie (HttpOnly)
- Validation در API routes
- Double Submit Cookie Pattern
- Nonce برای inline scripts

#### 2. Rate Limiting
- در-memory یا Redis
- قابل تنظیم per endpoint
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Retry-After header

#### 3. Brute Force Protection
- 5 تلاش ناموفق = قفل 15 دقیقه
- Tracking در دیتابیس (`failed_attempt`, `locked_until`)
- Auto-unlock بعد از 15 دقیقه

#### 4. IP Filtering
- Whitelist/Blacklist
- Geo-blocking capability
- Logging برای IP blocks

#### 5. Request Size Limits
- Body size validation
- File upload limits
- Protection against DoS

#### 6. Input Validation & Sanitization
- Mobile number validation
- Password strength validation
- XSS prevention
- SQL Injection prevention (Parameterized Queries)

#### 7. Security Headers
- **CSP** (Content Security Policy) with nonce
- **HSTS** (HTTP Strict Transport Security) - در production
- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: camera=(), microphone=(), geolocation=()
- **Cross-Origin-Opener-Policy**: same-origin
- **Cross-Origin-Resource-Policy**: same-origin
- و چندین header دیگر

#### 8. Token Security
- **Token Rotation**: هر refresh توکن جدید
- **Theft Detection**: حذف تمام توکن‌ها در صورت استفاده نامعتبر
- **IP Tracking**: ذخیره IP در هر refresh
- **Hash Storage**: توکن‌ها به صورت hash ذخیره می‌شوند

### 6.3. Security Monitoring

- **Audit Logging**: تمام فعالیت‌های امنیتی لاگ می‌شوند
- **Suspicious Activity Detection**: تشخیص الگوهای مشکوک
- **Error Tracking**: ردیابی خطاها
- **Performance Monitoring**: ردیابی عملکرد

---

## 7. سیستم Hook

### 7.1. Hook Architecture

سیستم Hook برای افزودن منطق خاص پروژه بدون تغییر در core:

```
Hook Registration (core/hooks/auth.ts)
    ↓
Hook Registry (core/lib/hooks/registry.ts)
    ↓
Hook Loader (core/lib/hooks/loader.ts)
    ↓
Auto Load in app/layout.tsx
    ↓
Execute in API Routes
```

### 7.2. Available Hooks

| Hook Name | زمان اجرا | پارامترها | مثال استفاده |
|-----------|-----------|-----------|---------------|
| `auth:after-login` | بعد از login موفق | `user: {id, mobile, firstname, lastname}` | ارسال ایمیل خوش‌آمدگویی |
| `auth:before-logout` | قبل از logout | `userId: number` | ذخیره تنظیمات کاربر |
| `auth:after-logout` | بعد از logout | `userId: number` | پاک کردن کش |
| `auth:token-refresh` | بعد از refresh موفق | `userId: number, ip: string` | ثبت لاگ امنیتی |

### 7.3. Hook Registration

```typescript
// core/hooks/auth.ts (example hooks)
import { hookRegistry } from '@/core/lib/hooks'

hookRegistry.register('auth:after-login', async (user) => {
  // Custom logic
  await sendWelcomeEmail(user.mobile)
  await logUserActivity(user.id, 'login')
})
```

### 7.4. Hook Loading

- Hooks به صورت **sync** در `app/layout.tsx` لود می‌شوند
- Paths از config خوانده می‌شوند (`hooks.paths`)
- Auto-discovery پشتیبانی می‌شود (optional)
- Hooks به صورت **non-blocking** اجرا می‌شوند (`runAsync`)

### 7.5. Hook Execution

```typescript
// در API route
import { hookRegistry } from '@/core/lib/hooks'

const result = await hookRegistry.execute('auth:after-login', user)
if (!result.success) {
  // Log errors (non-blocking)
  console.error('Hook errors:', result.errors)
}
```

---

## 8. API Routes

### 8.1. API Structure

پروژه از الگوی **Wrapper Pattern** استفاده می‌کند:

```
app/api/                    # Wrapper Files (Next.js requirement)
└── auth/
    └── login/route.ts      # Re-export from core

core/app/api/               # Actual Implementation
└── auth/
    └── login/route.ts      # Real implementation
```

**دلیل**: Next.js App Router فقط routes در `app/api/` را شناسایی می‌کند.

### 8.2. API Flow

```
1. Client Request
   ↓
2. app/api/**/route.ts (Wrapper)
   ↓
3. core/app/api/**/route.ts (Implementation)
   ↓
4. validateAPIRequest()
   ├─ CSRF Check
   ├─ Rate Limiting
   ├─ IP Filtering
   └─ Request Size
   ↓
5. Route Handler
   ├─ Input Validation
   ├─ Sanitization
   ├─ Database Function Call
   ├─ Hook Execution
   └─ Response Generation
```

### 8.3. API Endpoints

#### Authentication Endpoints:

| Endpoint | Method | کاربرد | Security |
|----------|--------|--------|----------|
| `/api/auth/login` | POST | ورود کاربر | CSRF, Rate Limit, Brute Force |
| `/api/auth/logout` | POST | خروج از یک دستگاه | CSRF, Auth Required |
| `/api/auth/logout-all` | POST | خروج از همه دستگاه‌ها | CSRF, Auth Required |
| `/api/auth/refresh` | POST | تمدید توکن | CSRF, Rate Limit |
| `/api/auth/otp` | POST | ارسال/تایید OTP | CSRF, Rate Limit |
| `/api/auth/verification-user` | POST | تایید کاربر | CSRF, Rate Limit |
| `/api/auth/verification-register` | POST | ثبت‌نام | CSRF, Rate Limit |
| `/api/auth/verification-password` | POST | تنظیم رمز عبور | CSRF, Rate Limit |

#### Other Endpoints:

| Endpoint | Method | کاربرد |
|----------|--------|--------|
| `/api/health` | GET | بررسی وضعیت سرویس |
| `/api/logger` | POST | ثبت لاگ از کلاینت |

### 8.4. API Response Format

```typescript
// Success Response
{
  success: true,
  title: "Success Title",
  message: "Success message",
  data?: any
}

// Error Response
{
  success: false,
  title: "Error Title",
  message: "Error message"
}
```

---

## 9. Frontend Structure

### 9.1. Client Components

```
project/components/page/
├── DashboardClient.tsx    # Dashboard Page Component
├── HomeClient.tsx         # Home Page Component
└── ProfileClient.tsx      # Profile Page Component
```

### 9.2. Auth Hook (Client-side)

```typescript
// core/lib/auth/use-auth.ts
export function useAuth(iDevice: string): UseAuthReturn {
  // Features:
  // - Access token management in memory
  // - Auto-refresh on expiration
  // - Retry logic with exponential backoff
  // - Error handling
  // - Transient error detection (5xx, network)
}
```

**استفاده:**
```typescript
const { authState, refreshAccessToken, getValidAccessToken } = useAuth(iDevice)
```

### 9.3. Security Provider

```typescript
// core/components/security/SecurityProvider.tsx
// Provides:
// - CSRF token
// - Security context
// - Error boundaries
```

**استفاده:**
```typescript
const { csrfToken } = useSecurity()
```

### 9.4. Page Structure

```
app/[lang]/
├── (admin)/              # Protected routes (require auth)
│   ├── dashboard/page.tsx
│   └── profile/page.tsx
├── (auth)/               # Auth routes
│   ├── login/page.tsx
│   ├── logout-all/page.tsx
│   └── verification/page.tsx
└── layout.tsx            # Language-specific layout
```

---

## 10. Dependencies & Technologies

### 10.1. Core Dependencies

```json
{
  "next": "16.0.10",              // Next.js Framework
  "react": "19.2.1",              // React Library
  "react-dom": "19.2.1",          // React DOM
  "ioredis": "^5.8.2",            // Redis Client (optional)
  "next-themes": "^0.4.6",        // Theme Management
  "radix-ui": "^1.4.3",           // UI Components
  "schema-dts": "^1.1.5",         // Schema.org Types
  "clsx": "^2.1.1",                // Class Name Utility
  "tailwind-merge": "^3.4.0"      // Tailwind Merge
}
```

### 10.2. Dev Dependencies

```json
{
  "typescript": "^5",             // TypeScript
  "tailwindcss": "^4",            // Tailwind CSS
  "eslint": "^9",                  // ESLint
  "jest": "^29",                   // Testing Framework
  "@types/node": "^20",           // Node Types
  "@types/react": "^19"           // React Types
}
```

### 10.3. Database

- **PostgreSQL** با schema `auth`
- توابع دیتابیس با `SECURITY DEFINER`
- Indexes برای بهینه‌سازی queries
- Foreign Keys با CASCADE

### 10.4. Build Tools

- **Next.js**: Framework و Build Tool
- **TypeScript**: Type Safety
- **Tailwind CSS**: Styling
- **ESLint**: Linting
- **Jest**: Testing

---

## 11. Performance Optimizations

### 11.1. Optimizations

1. **Non-blocking Operations**
   - استفاده از `runAsync()` برای عملیات async
   - Logging و monitoring غیرمسدودکننده

2. **Token Format Validation**
   - در proxy فقط format چک می‌شود (سریع)
   - Validation کامل در API routes

3. **Database Indexes**
   - Indexes برای queries پرکاربرد
   - Partial indexes برای توکن‌های فعال

4. **Token Table Separation**
   - جدول فعال و تاریخچه جدا
   - فقط توکن‌های فعال در جدول اصلی

5. **Caching**
   - Redis برای rate limiting (optional)
   - Memory cache برای configs

6. **Image Optimization**
   - Next.js Image Optimization
   - Formats: AVIF, WebP

7. **Bundle Optimization**
   - `optimizePackageImports` برای Radix UI
   - Tree shaking

8. **Code Splitting**
   - Automatic code splitting در Next.js
   - Lazy loading برای components

---

## 12. Best Practices & Patterns

### 12.1. Architecture Patterns

1. **Configuration Injection**
   - Core config از project inject می‌شود
   - بدون تغییر در core

2. **Hook Pattern**
   - Extensibility با Hook System
   - Non-blocking execution

3. **Wrapper Pattern**
   - API routes wrapper برای Next.js compatibility
   - Re-export از core

4. **Separation of Concerns**
   - Core مستقل از Project
   - Project فقط override می‌کند

5. **Security in Depth**
   - چندین لایه امنیتی
   - Defense in depth strategy

### 12.2. Code Patterns

1. **Error Handling**
   - Centralized error handling
   - Structured error responses

2. **Validation**
   - Input validation و sanitization
   - Schema-based validation

3. **Logging**
   - Structured logging
   - Audit logs برای امنیت

4. **Type Safety**
   - TypeScript کامل
   - Type definitions برای همه interfaces

5. **Non-blocking**
   - استفاده از `runAsync` برای async operations
   - Performance optimization

### 12.3. Security Patterns

1. **Token Rotation**
   - هر refresh توکن جدید
   - Theft detection

2. **Brute Force Protection**
   - Account locking
   - Failed attempt tracking

3. **Input Validation**
   - Whitelist approach
   - Sanitization

4. **CSRF Protection**
   - Double Submit Cookie
   - Token validation

---

## 13. نکات مهم

### 13.1. Core Independence

- ✅ Core کاملاً مستقل است
- ✅ هیچ وابستگی به `/project` ندارد
- ✅ **فایل‌های config در `core/config/` هستند**:
  - `core/config/project-override.ts` - Core Config Override
  - `core/config/site.ts` - Site Configuration
  - `core/config/project-override-legacy.ts` - Legacy Override
- ✅ قابل کپی به پروژه‌های جدید
- ✅ Config injection برای customization

### 13.2. Configuration

- ✅ Config در `app/layout.tsx` تنظیم می‌شود
- ✅ Project configs در `project/config/core-override.ts`
- ✅ Merge با defaults به صورت خودکار
- ✅ Type-safe configuration

### 13.3. Security

- ✅ تمام security checks در middleware
- ✅ Non-blocking logging
- ✅ Audit logs برای tracking
- ✅ Multiple security layers

### 13.4. Database

- ✅ استفاده از توابع دیتابیس (نه direct queries)
- ✅ Token rotation برای امنیت
- ✅ Cleanup دوره‌ای برای performance
- ✅ Indexes برای optimization

### 13.5. Performance

- ✅ Non-blocking operations
- ✅ Efficient database queries
- ✅ Caching strategies
- ✅ Code splitting

---

## 14. فایل‌های کلیدی

### Core Files:

| فایل | کاربرد |
|------|--------|
| `core/proxy.ts` | Middleware اصلی |
| `core/config/config.ts` | Configuration system |
| `core/lib/hooks/registry.ts` | Hook system |
| `core/lib/security/api-middleware.ts` | Security middleware |
| `core/app/api/auth/*/route.ts` | API implementations |
| `core/lib/auth/use-auth.ts` | Client-side auth hook |
| `core/lib/rest/rpc.ts` | Database RPC client |

### Project Files:

| فایل | کاربرد | نوع |
|------|--------|-----|
| `core/config/project-override.ts` | Core Config Override | بخشی از Core |
| `core/config/site.ts` | Site Configuration | بخشی از Core |
| `core/config/project-override-legacy.ts` | Legacy Override | بخشی از Core |
| `core/config/types.ts` | Site Types | بخشی از Core |
| `core/hooks/auth.ts` | Core hooks example | بخشی از Core |
| `project/components/page/*.tsx` | Page components | خاص پروژه |

**نکته**: فایل‌های config اکنون در `core/config/` هستند و بخشی از سیستم Core محسوب می‌شوند.

### App Files:

| فایل | کاربرد |
|------|--------|
| `app/layout.tsx` | Root layout (sets config) |
| `app/api/**/route.ts` | API wrappers |
| `app/[lang]/**/page.tsx` | Pages |

---

## 15. جریان داده (Data Flow)

### Request Flow:

```
1. Client Request
   ↓
2. proxy.ts (Middleware)
   ├─ Path Validation
   ├─ Authentication Check (Format)
   ├─ CSRF Token Generation
   └─ Nonce Generation
   ↓
3. API Route (app/api/**/route.ts)
   ↓
4. Core Implementation (core/app/api/**/route.ts)
   ↓
5. validateAPIRequest()
   ├─ IP Filtering
   ├─ Request Size
   ├─ Rate Limiting
   └─ CSRF Validation
   ↓
6. Route Handler
   ├─ Input Validation
   ├─ Sanitization
   ├─ Database Function Call (RPC)
   ├─ Hook Execution
   └─ Response Generation
   ↓
7. Client Response
```

### Authentication Flow:

```
1. Login Request
   ↓
2. Security Checks
   ↓
3. Database: pelak_auth_login()
   ├─ Check Account Lock
   ├─ Verify Password
   ├─ Create Refresh Token
   └─ Update User
   ↓
4. Hook: auth:after-login
   ↓
5. Generate Access Token
   ↓
6. Set Cookie + Return Token
```

### Token Refresh Flow:

```
1. Refresh Request
   ↓
2. Security Checks
   ↓
3. Database: pelak_auth_refreshtoken()
   ├─ Validate Token
   ├─ Check Theft
   ├─ Rotate Token
   └─ Update Last Used
   ↓
4. Hook: auth:token-refresh
   ↓
5. Generate New Access Token
   ↓
6. Return New Token
```

---

## 16. خلاصه معماری

### نقاط قوت:

1. ✅ **معماری Plug-and-Play**: Core قابل استفاده مجدد
2. ✅ **امنیت قوی**: چندین لایه امنیتی
3. ✅ **انعطاف‌پذیری**: Hook system برای extension
4. ✅ **Performance**: بهینه‌سازی‌های مختلف
5. ✅ **Type Safety**: TypeScript کامل
6. ✅ **مستندات**: مستندات کامل و جامع
7. ✅ **Database Functions**: منطق در دیتابیس
8. ✅ **Token Security**: Token rotation و theft detection

### نکات قابل بهبود:

1. ⚠️ تست‌های unit/integration بیشتر
2. ⚠️ Docker setup کامل‌تر
3. ⚠️ CI/CD pipeline
4. ⚠️ Monitoring و alerting
5. ⚠️ API documentation (OpenAPI/Swagger)
6. ⚠️ E2E testing

---

## 17. راهنمای استفاده

### استفاده از Core در پروژه جدید:

1. **کپی Core**: `cp -r core/ new-project/`
   - شامل `core/config/project-override.ts`, `core/config/site.ts` و `core/config/types.ts`
2. **تنظیم TypeScript**: اضافه کردن path aliases
3. **تنظیم Project Config**: ویرایش `core/config/project-override.ts` و `core/config/site.ts`
4. **ایجاد App Layout**: تنظیم config در `app/layout.tsx` با import از `@/core/config/project-override`
5. **ایجاد Proxy**: re-export از `core/proxy.ts`
6. **Hooks**: فایل `core/hooks/auth.ts` به صورت پیش‌فرض وجود دارد (می‌توانید آن را ویرایش کنید)

برای جزئیات بیشتر، به [ARCHITECTURE.md](ARCHITECTURE.md) مراجعه کنید.

---

## 18. سوالات متداول (FAQ)

### چرا فایل‌های config در `core/config/` هستند؟

فایل‌های config برای override کردن تنظیمات Core استفاده می‌شوند و بخشی از ساختار Core محسوب می‌شوند. این فایل‌ها از `project/config/` به `core/config/` منتقل شده‌اند:

- **`core/config/project-override.ts`**: فایل اصلی برای override کردن Core Configs (قبلاً `project/config/core-override.ts`)
- **`core/config/site.ts`**: تنظیمات سایت (زبان‌ها، metadata، theme) که در project-override استفاده می‌شود
- **`core/config/project-override-legacy.ts`**: Legacy override برای routes (قبلاً `project/config/override.ts`)

این فایل‌ها همراه با core منتقل می‌شوند و بخشی از ساختار Core هستند.

### تفاوت بین Core و Project چیست؟

- **Core** (`/core` شامل `core/config/*`): کدهای مستقل و قابل استفاده مجدد
- **Project** (`/project`): کدهای خاص پروژه (hooks، components، data)

### چگونه Core را به پروژه جدید منتقل کنیم؟

1. کپی کردن `/core` به پروژه جدید (شامل تمام فایل‌های config)
2. تنظیم TypeScript paths
3. ویرایش `core/config/project-override.ts` و `core/config/site.ts`
4. ایجاد `app/layout.tsx` با import از `@/core/config/project-override`
5. تنظیم config در `app/layout.tsx`

---

## 19. مستندات مرتبط

- [README.md](README.md) - راهنمای کلی پروژه
- [ARCHITECTURE.md](ARCHITECTURE.md) - راهنمای معماری و استفاده
- [DATABASE.md](DATABASE.md) - مستندات دیتابیس و API
- [core/README.md](core/README.md) - راهنمای استفاده از Core
- [CHANGELOG.md](CHANGELOG.md) - تاریخچه تغییرات

---

**آخرین به‌روزرسانی**: 2025-01-XX  
**نسخه پروژه**: 0.2.1

