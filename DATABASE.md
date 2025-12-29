# مستندات دیتابیس - سیستم احراز هویت

## ساختار جداول

### `auth.users`
جدول اصلی کاربران

**فیلدهای مهم**:
- `id` - شناسه یکتا
- `mobile` - شماره موبایل (unique)
- `userpassword` - رمز عبور hash شده
- `is_active` - وضعیت فعال بودن
- `locked_until` - زمان قفل شدن حساب
- `failed_attempt` - تعداد تلاش‌های ناموفق

### `auth.refresh_tokens`
**فقط توکن‌های فعال** (expires_at > NOW() و revoked_at IS NULL)

**فیلدهای مهم**:
- `id` - شناسه یکتا
- `token_hash` - Hash توکن (unique)
- `user_id` - شناسه کاربر
- `idevice` - شناسه دستگاه
- `expires_at` - زمان انقضا
- `last_used_at` - آخرین زمان استفاده
- `last_used_ip` - آخرین IP استفاده شده

**نکته**: این جدول فقط توکن‌های فعال را نگه می‌دارد برای عملکرد بهتر.

### `auth.refresh_tokens_history`
**تاریخچه تمام توکن‌های منقضی یا حذف شده**

**فیلدهای مهم**:
- تمام فیلدهای `refresh_tokens` به اضافه:
- `archived_at` - زمان انتقال به تاریخچه

**نکته**: این جدول برای audit و تاریخچه نگهداری می‌شود.

## توابع دیتابیس

### `auth_revoke_token(p_user_id, p_idevice)`
انتقال refresh token از جدول فعال به تاریخچه هنگام logout.

**پارامترها**:
- `p_user_id` (int4) - شناسه کاربر
- `p_idevice` (text) - شناسه دستگاه

**بازگشت**: JSON با success و message

**استفاده**:
```sql
SELECT auth_revoke_token(1, 'device-id-here');
```

### `auth_refresh_token(p_refresh_token, p_idevice, p_ip)`
تمدید refresh token با ردیابی IP و انتقال توکن قدیمی به تاریخچه.

**پارامترها**:
- `p_refresh_token` (text) - توکن فعلی
- `p_idevice` (text) - شناسه دستگاه
- `p_ip` (text) - IP کاربر (می‌تواند 'unknown' باشد)

**بازگشت**: JSON با success، refresh_token جدید، و اطلاعات کاربر

**نکته**: اگر IP = 'unknown' باشد، `last_used_ip` به NULL تنظیم می‌شود.

### `auth_cleanup_expired_tokens()`
انتقال خودکار توکن‌های منقضی شده به تاریخچه.

**پارامترها**: ندارد

**بازگشت**: JSON با success، message، و تعداد توکن‌های منتقل شده

**استفاده**:
```sql
SELECT auth_cleanup_expired_tokens();
```

**نکته**: این تابع باید به صورت دوره‌ای (cron job) اجرا شود.

### `auth_login(p_mobile, p_password, p_idevice)`
ورود کاربر با انتقال توکن قدیمی به تاریخچه در صورت وجود.

**پارامترها**:
- `p_mobile` (varchar) - شماره موبایل
- `p_password` (varchar) - رمز عبور
- `p_idevice` (text) - شناسه دستگاه

**بازگشت**: JSON با success، refresh_token، و اطلاعات کاربر

**نکته**: اگر توکن قدیمی برای همان user_id و idevice وجود داشته باشد، به تاریخچه منتقل می‌شود.

## Migration

### انتقال توکن‌های موجود

اگر توکن‌های منقضی شده در `refresh_tokens` وجود دارد:

1. فایل `database_migration.sql` را اجرا کنید
2. بررسی کنید که توکن‌ها به درستی منتقل شده‌اند
3. بررسی کنید که جدول فعال فقط توکن‌های فعال را دارد

## Cron Job Setup

برای اجرای دوره‌ای cleanup:

### با pg_cron (PostgreSQL extension)

```sql
-- نصب pg_cron (اگر نصب نشده)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- تنظیم cron job برای اجرای هر ساعت
SELECT cron.schedule(
  'cleanup-expired-tokens',
  '0 * * * *', -- هر ساعت
  $$SELECT auth_cleanup_expired_tokens();$$
);
```

### با سیستم cron خارجی

```bash
# در crontab
0 * * * * psql -U htni_admin -d your_database -c "SELECT auth_cleanup_expired_tokens();"
```

## Indexes

برای عملکرد بهتر، indexes زیر ایجاد شده‌اند:

- `idx_refresh_tokens_expires_at` - برای کوئری‌های cleanup
- `idx_refresh_tokens_token_hash` - برای lookup توکن
- `idx_refresh_tokens_user_id` - برای کوئری‌های کاربر
- `idx_refresh_tokens_history_user_id` - برای کوئری‌های تاریخچه
- `idx_refresh_tokens_history_archived_at` - برای کوئری‌های تاریخچه

## نکات امنیتی

1. **Token Rotation**: هر بار refresh، توکن قدیمی حذف و جدید ساخته می‌شود
2. **Token Theft Detection**: اگر توکن نامعتبر استفاده شود، تمام توکن‌های کاربر حذف می‌شوند
3. **IP Tracking**: IP کاربر در هر refresh ذخیره می‌شود (اگر در دسترس باشد)
4. **History**: تمام توکن‌های منقضی/حذف شده در تاریخچه نگهداری می‌شوند

