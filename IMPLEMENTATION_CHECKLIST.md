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
psql -U htni_admin -d your_database -f core/database/schema/00_create_schema.sql
psql -U htni_admin -d your_database -f core/database/schema/01_sequences.sql
psql -U htni_admin -d your_database -f core/database/schema/02_base_tables.sql
psql -U htni_admin -d your_database -f core/database/schema/03_auth_tables.sql
psql -U htni_admin -d your_database -f core/database/schema/04_content_tables.sql
psql -U htni_admin -d your_database -f core/database/schema/05_comments_tables.sql
psql -U htni_admin -d your_database -f core/database/schema/06_project_tables.sql

# Functions (توابع)
psql -U htni_admin -d your_database -f core/database/functions/01_auth_functions.sql
psql -U htni_admin -d your_database -f core/database/functions/02_content_functions.sql
psql -U htni_admin -d your_database -f core/database/functions/03_comments_functions.sql
psql -U htni_admin -d your_database -f core/database/functions/04_user_functions.sql
```

**بررسی**:
- [ ] بررسی وجود schema های `pelak` و `project`
- [ ] بررسی وجود جدول `pelak.refreshtokenhistory`
- [ ] بررسی indexes ایجاد شده
- [ ] بررسی وجود تمام جداول (pelak.user, pelak.refreshtoken, pelak.refreshtokenhistory, pelak.page, pelak.comments, pelak.commentlike, project.selector, project.selectortype, project.useradditionalinfo)
- [ ] بررسی وجود تمام sequences

**بررسی توابع**:
- [ ] تست توابع احراز هویت (`pelak_auth_register`, `pelak_auth_password`, `pelak_auth_login`, `pelak_auth_refreshtoken`, `pelak_auth_revoketoken`, `pelak_auth_revokeall`, `pelak_auth_checkrefreshtoken`, `pelak_auth_checkrefreshtoken_mobile`, `pelak_auth_checkrefreshtoken_device_mobile`, `pelak_auth_checkuser`, `pelak_auth_archive_inactive_tokens`)
- [ ] تست توابع محتوا (`project_selector_gettree`, `project_selector_get`, `project_selector_getselector`, `pelak_page_getsummaries`, `pelak_page_geturl`, `pelak_page_getid`)
- [ ] تست توابع نظرات (`pelak_comment_get`, `pelak_comment_create`, `pelak_comment_update`, `pelak_comment_delete`, `pelak_comment_toggle`)
- [ ] تست توابع کاربر (`pelak_user_get`, `pelak_user_updatename`, `pelak_user_updateprofile`)
- [ ] تست توابع اطلاعات تکمیلی (`project_user_additional`, `project_user_additionala`, `project_user_additionalb`, `project_user_additionalc`, `project_user_additionald`)
- [ ] تست تابع `pelak_auth_refreshtoken` با IP معتبر
- [ ] تست تابع `pelak_auth_refreshtoken` با IP = 'unknown'
- [ ] تست تابع `pelak_auth_login` برای انتقال توکن قدیمی

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

#### تست 3: Archive Inactive Tokens
- [ ] ایجاد توکن منقضی شده (تست)
- [ ] اجرای `pelak_auth_archive_inactive_tokens`
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
  'archive-inactive-tokens',
  '0 * * * *', -- هر ساعت
  $$SELECT pelak_auth_archive_inactive_tokens();$$
);
```

#### با سیستم cron خارجی
```bash
# اضافه کردن به crontab
0 * * * * psql -U htni_admin -d your_database -c "SELECT pelak_auth_archive_inactive_tokens();"
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
- `schema/00_create_schema.sql` - ایجاد schema های pelak و project
- `schema/01_sequences.sql` - Sequences مشترک
- `schema/02_base_tables.sql` - جداول پایه
- `schema/03_auth_tables.sql` - جداول احراز هویت
- `schema/04_content_tables.sql` - جداول محتوا
- `schema/05_comments_tables.sql` - جداول نظرات
- `schema/06_project_tables.sql` - جداول پروژه
- `functions/01_auth_functions.sql` - توابع احراز هویت
- `functions/02_content_functions.sql` - توابع محتوا و سلکتور
- `functions/03_comments_functions.sql` - توابع نظرات
- `functions/04_user_functions.sql` - توابع کاربر و اطلاعات تکمیلی
- `migrations/database_migration.sql` - اسکریپت migration

## 🆘 Troubleshooting

### مشکل: توابع دیتابیس کار نمی‌کنند
- بررسی کنید که schema های `pelak` و `project` وجود دارند
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

