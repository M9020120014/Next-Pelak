# چک‌لیست پیاده‌سازی - بهبود امنیت و معماری

## ✅ تغییرات انجام شده

### امنیت
- [x] بهبود `/app/api/auth/logout/route.ts` - اضافه شدن revoke token
- [x] بهبود `/app/api/auth/refresh/route.ts` - اضافه شدن IP tracking
- [x] حذف IP filtering از `proxy.ts` - جلوگیری از دوباره‌کاری

### معماری
- [x] ایجاد ساختار `/project` برای کدهای خاص پروژه
- [x] ایجاد سیستم Hook در `/lib/hooks`
- [x] ایجاد سیستم کانفیگ قابل override در `/project/config`
- [x] به‌روزرسانی `tsconfig.json` برای path aliases

### مستندسازی
- [x] ایجاد `ARCHITECTURE.md` - راهنمای معماری
- [x] ایجاد `DATABASE.md` - مستندات دیتابیس
- [x] ایجاد `database_migration.sql` - اسکریپت migration

## ⏳ کارهای باقی‌مانده (نیاز به اجرای دستی)

### دیتابیس

#### مرحله 1: ایجاد ساختار دیتابیس (جداول و توابع)
```bash
# روش 1: اجرای فایل master (پیشنهادی)
psql -U htni_admin -d your_database -f core/database/master.sql

# روش 2: اجرای جداگانه فایل‌ها
# Schema (جداول)
psql -U htni_admin -d your_database -f core/database/schema/01_auth_tables.sql
psql -U htni_admin -d your_database -f core/database/schema/02_content_tables.sql
psql -U htni_admin -d your_database -f core/database/schema/03_comments_tables.sql
psql -U htni_admin -d your_database -f core/database/schema/04_sequences.sql

# Functions (توابع)
psql -U htni_admin -d your_database -f core/database/functions/01_auth_functions.sql
psql -U htni_admin -d your_database -f core/database/functions/02_content_functions.sql
psql -U htni_admin -d your_database -f core/database/functions/03_comments_functions.sql
```

**بررسی**:
- [ ] بررسی وجود جدول `refresh_tokens_history`
- [ ] بررسی indexes ایجاد شده
- [ ] بررسی وجود تمام جداول (users, refresh_tokens, selectortype, selector, page, comments, comment_likes)
- [ ] بررسی وجود تمام sequences

**بررسی توابع**:
- [ ] تست توابع احراز هویت (`auth_register_user`, `auth_set_password`, `auth_login`, `auth_refresh_token`, `auth_revoke_token`, `auth_revoke_all_tokens`, `auth_check_idevice_refresh_token`, `auth_cleanup_expired_tokens`)
- [ ] تست توابع محتوا (`selectors_get_tree`, `selectors_get`, `selectors_get_selector`, `page_get_summaries`, `page_get_url`, `page_get_id`)
- [ ] تست توابع نظرات (`comments_get_by_pageid`, `comments_create`, `comments_update`, `comments_delete`, `comments_toggle_like`)
- [ ] تست تابع `auth_refresh_token` با IP معتبر
- [ ] تست تابع `auth_refresh_token` با IP = 'unknown'
- [ ] تست تابع `auth_login` برای انتقال توکن قدیمی

#### مرحله 2: Migration داده‌های موجود
```bash
# اگر توکن‌های منقضی شده وجود دارد
psql -U htni_admin -d your_database -f core/database/migrations/database_migration.sql
```

**بررسی**:
- [ ] بررسی تعداد توکن‌های منتقل شده
- [ ] بررسی صحت انتقال داده‌ها
- [ ] بررسی اینکه جدول فعال فقط توکن‌های فعال را دارد

### تست‌های امنیتی

#### تست 1: Logout با Revoke Token
- [ ] Login موفق
- [ ] دریافت access token و refresh token
- [ ] Logout
- [ ] بررسی انتقال refresh token به تاریخچه در دیتابیس
- [ ] تلاش refresh با توکن قدیمی (باید fail شود)

#### تست 2: Refresh Token با IP Tracking
- [ ] Refresh token با IP معتبر
- [ ] بررسی `last_used_ip` در دیتابیس (باید IP باشد)
- [ ] Refresh token با IP = 'unknown'
- [ ] بررسی `last_used_ip = NULL` در دیتابیس

#### تست 3: Cleanup Expired Tokens
- [ ] ایجاد توکن منقضی شده (تست)
- [ ] اجرای `auth_cleanup_expired_tokens`
- [ ] بررسی انتقال به تاریخچه
- [ ] بررسی حذف از جدول فعال

#### تست 4: Login با توکن قدیمی
- [ ] Login با توکن قدیمی موجود
- [ ] بررسی انتقال توکن قدیمی به تاریخچه
- [ ] بررسی ایجاد توکن جدید

### تنظیم Cron Job

برای اجرای دوره‌ای cleanup:

#### با pg_cron
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'cleanup-expired-tokens',
  '0 * * * *', -- هر ساعت
  $$SELECT auth_cleanup_expired_tokens();$$
);
```

#### با سیستم cron خارجی
```bash
# اضافه کردن به crontab
0 * * * * psql -U htni_admin -d your_database -c "SELECT auth_cleanup_expired_tokens();"
```

**بررسی**:
- [ ] تست اجرای دستی cron job
- [ ] بررسی لاگ‌های اجرا
- [ ] بررسی عملکرد cleanup

### به‌روزرسانی Imports (اختیاری)

اگر می‌خواهید از ساختار جدید استفاده کنید:

#### استفاده از Hook System (اختیاری)

Hook system در `/lib/hooks` ایجاد شده است. برای استفاده:

```typescript
import { hookRegistry } from '@/lib/hooks'

hookRegistry.register('auth:after-login', async (user) => {
  // منطق خاص پروژه
})
```

**فایل‌های نیازمند تغییر**:
- [ ] `proxy.ts`
- [ ] تمام فایل‌های API routes
- [ ] سایر فایل‌هایی که از config استفاده می‌کنند

**نکته**: این تغییر اختیاری است. ساختار قدیم هنوز کار می‌کند.

### استفاده از Hooks (اختیاری)

برای اضافه کردن منطق خاص پروژه:

1. فایل `/core/hooks/auth.ts` را ویرایش کنید
2. Hook های مورد نیاز را اضافه کنید

**مثال**:
```typescript
hookRegistry.register('auth:after-login', async (user) => {
  // منطق خاص پروژه
  console.log('User logged in:', user.id)
})
```

## 📝 نکات مهم

1. **Backup**: قبل از هر تغییر دیتابیس، backup بگیرید
2. **Testing**: تمام تغییرات را در محیط test تست کنید
3. **Monitoring**: بعد از deploy، monitoring را فعال کنید
4. **Documentation**: تمام تغییرات را مستند کنید

## 🚀 Deploy Checklist

### قبل از Deploy
- [ ] تمام تست‌های امنیتی پاس شده
- [ ] Build موفق (`npm run build`)
- [ ] Linter errors برطرف شده
- [ ] Type errors برطرف شده
- [ ] مستندات به‌روز شده

### بعد از Deploy
- [ ] بررسی لاگ‌ها
- [ ] بررسی performance
- [ ] بررسی امنیت در production
- [ ] تنظیم Cron Job برای cleanup
- [ ] Monitoring فعال

## 📚 مستندات

- `ARCHITECTURE.md` - راهنمای معماری و استفاده از سیستم CMS
- `DATABASE.md` - مستندات دیتابیس و توابع
- `master.sql` - فایل master برای اجرای همه فایل‌ها
- `schema/01_auth_tables.sql` - جداول احراز هویت
- `schema/02_content_tables.sql` - جداول محتوا
- `schema/03_comments_tables.sql` - جداول نظرات
- `schema/04_sequences.sql` - Sequences
- `functions/01_auth_functions.sql` - توابع احراز هویت
- `functions/02_content_functions.sql` - توابع محتوا
- `functions/03_comments_functions.sql` - توابع نظرات
- `migrations/database_migration.sql` - اسکریپت migration

## 🆘 Troubleshooting

### مشکل: توابع دیتابیس کار نمی‌کنند
- بررسی کنید که schema `auth` وجود دارد
- بررسی کنید که owner صحیح است (`htni_admin`)
- بررسی کنید که extension `pgcrypto` نصب شده است

### مشکل: IP tracking کار نمی‌کند
- بررسی کنید که `getClientIP` درست کار می‌کند
- بررسی کنید که headers درست set می‌شوند
- بررسی کنید که IP = 'unknown' handle می‌شود

### مشکل: Import errors بعد از تغییر ساختار
- بررسی کنید که `tsconfig.json` به‌روز شده است
- بررسی کنید که path aliases درست هستند
- Restart TypeScript server

