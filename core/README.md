# Core - سیستم پایه Next-Pelak

این فولدر شامل تمام کدهای مشترک و قابل استفاده مجدد برای پروژه‌های Next.js است. **Core کاملاً مستقل است** و هیچ وابستگی به project ندارد.

## ساختار

- `lib/` - کتابخانه‌های اصلی (auth, security, token, hooks, ...)
- `config/` - تنظیمات پایه (env, security, metadata, hooks, messages, core-config)
- `components/` - کامپوننت‌های پایه (auth, security, provider)
- `app/` - ساختار Next.js پایه (layout, API routes, not-found)
- `database/` - اسکریپت‌های دیتابیس (schema, migrations, functions)
- `types/` - تایپ‌های پایه
- `styles/` - استایل‌های پایه
- `asset/` - Asset های پایه (fonts, media)
- `data/` - داده‌های پایه (metadata base structure)
- `proxy.ts` - Proxy اصلی Next.js

## نحوه استفاده

برای استفاده در پروژه جدید:

1. **کپی کردن فولدر `core/`** به پروژه جدید
2. **اضافه کردن path alias** `@/core/*` به `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"],
         "@/core/*": ["./core/*"]
       }
     }
   }
   ```
3. **ایجاد `app/layout.tsx`** که core config را تنظیم می‌کند:
   ```typescript
   import CoreLayout from "@/core/app/layout";
   import { setCoreConfig } from "@/core/config/core-config";
   import { projectCoreConfig } from "@/project/config/core-override";
   
   // Set core configuration before rendering
   setCoreConfig(projectCoreConfig);
   
   export default async function RootLayout({ children }) {
     return <CoreLayout>{children}</CoreLayout>
   }
   ```
4. **ویرایش `core/config/project-override.ts`** برای override کردن configs:
   ```typescript
   import type { CoreConfig } from '@/core/config/core-config';
   
   export const projectCoreConfig: CoreConfig = {
     metadata: { /* your metadata config */ },
     hooks: { paths: ['@/core/hooks/auth'] },
     messages: { /* your messages config */ },
   };
   ```
5. **ایجاد `middleware.ts` در root** (Next.js requirement):
   ```typescript
   // Re-export from core
   export { default, config } from '@/core/proxy'
   ```
   یا استفاده از `proxy.ts`:
   ```typescript
   // Import and re-export proxy from core
   import coreProxy from '@/core/proxy'
   import { config as proxyConfig } from '@/core/proxy'
   export default coreProxy
   export const config = proxyConfig
   ```

## سیستم Configuration

Core از سیستم **Configuration Injection** استفاده می‌کند:

### Metadata Configuration
- `core/config/metadata.ts` - Interface و factory functions برای metadata
- پروژه‌ها می‌توانند metadata خود را از طریق `CoreConfig.metadata` override کنند

### Hooks Configuration
- `core/config/hooks.ts` - Interface برای hook paths
- پروژه‌ها می‌توانند hook paths را از طریق `CoreConfig.hooks` تنظیم کنند
- پشتیبانی از environment variable: `CORE_HOOKS_PATHS` (comma-separated)

### Messages Configuration
- `core/config/messages.ts` - Interface برای error messages
- پروژه‌ها می‌توانند messages را از طریق `CoreConfig.messages` override کنند

### Core Config
- `core/config/core-config.ts` - Main configuration interface
- `setCoreConfig()` - تنظیم global config
- `getCoreConfig()` - دریافت merged config با defaults

## مزایای Plug-and-Play

1. **استقلال کامل:** Core هیچ وابستگی به project ندارد
2. **قابلیت کپی‌پیست:** می‌توان core را بدون تغییر کپی کرد
3. **قابلیت توسعه:** پروژه‌ها می‌توانند configs را override کنند
4. **Backward Compatibility:** با تغییرات minimal، کد موجود کار می‌کند

## نحوه به‌روزرسانی

برای به‌روزرسانی core در پروژه‌های دیگر:

1. کپی کردن فولدر `core/` به پروژه هدف
2. بررسی conflict ها (نباید conflict داشته باشد - core مستقل است)
3. تست در پروژه هدف
4. اگر config جدید اضافه شده، آن را در `core/config/project-override.ts` اضافه کنید

## Version

نسخه فعلی: 1.0.0

برای مشاهده تغییرات، به `VERSION.md` مراجعه کنید.

