# Security Library

کتابخانه امنیتی برای سیستم Next-Pelak شامل middleware ها و توابع امنیتی مختلف.

## فایل‌ها

### `write-operation-guard.ts`

سیستم دو مرحله‌ای برای محافظت از عملیات نوشتن در دیتابیس.

**مستندات کامل**: [../../docs/WRITE_OPERATION_GUARD.md](../../docs/WRITE_OPERATION_GUARD.md)

**استفاده سریع**:

```typescript
import { guardWriteOperation } from "@/core/lib/security/write-operation-guard"

async function POSTHandler(request: NextRequest) {
  const body = await request.json()
  
  return guardWriteOperation(body, async () => {
    // عملیات نوشتن شما
    const result = await callRpc("your_function", {...})
    return successResponse({...})
  })
}
```

### سایر فایل‌های امنیتی

- `api-middleware.ts`: Middleware اصلی برای API ها (CSRF, Rate Limiting, IP Filtering)
- `authorization.ts`: بررسی دسترسی و نقش کاربر
- `cookies.ts`: مدیریت CSRF cookies
- `rate-limit.ts`: Rate limiting
- `ip-filter.ts`: IP filtering
- `request-limits.ts`: محدودیت اندازه درخواست
- `audit-log.ts`: ثبت لاگ امنیتی
- `ssrf-protection.ts`: محافظت در برابر SSRF

## مستندات

برای اطلاعات بیشتر به [../../docs/WRITE_OPERATION_GUARD.md](../../docs/WRITE_OPERATION_GUARD.md) مراجعه کنید.

