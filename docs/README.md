# مستندات Next-Pelak

**نسخه**: 1.0.0  
**آخرین به‌روزرسانی**: 2025-01-XX

## خوش آمدید

این دایرکتوری شامل مستندات کامل و جامع پروژه Next-Pelak است. تمام ماژول‌های اصلی و پرکاربرد به صورت تفصیلی مستندسازی شده‌اند.

---

## فهرست مستندات

### مستندات اصلی

#### [ARCHITECTURE.md](./ARCHITECTURE.md)
معماری کلی پروژه، ساختار دایرکتوری‌ها، جریان داده‌ها و Design Patterns

**شامل**:
- معرفی پروژه و تکنولوژی‌ها
- ساختار دایرکتوری‌ها
- معماری سه‌لایه
- جریان داده‌ها
- Design Patterns
- Dependency Graph

---

#### [AUTHENTICATION.md](./AUTHENTICATION.md)
سیستم احراز هویت کامل با Flow Diagram، JWT، Refresh Token، OTP و Authorization

**شامل**:
- معماری احراز هویت
- Token System (Access Token، Refresh Token، iDevice Token)
- Authentication Flow (Login، Refresh، Logout)
- Authorization و RBAC
- Device Management
- OTP System
- مثال‌های استفاده
- Troubleshooting

---

#### [SECURITY.md](./SECURITY.md)
تمام سیستم‌های امنیتی شامل CSRF Protection، Rate Limiting، Authorization، Audit Log

**شامل**:
- CSRF Protection
- Rate Limiting (Redis-based)
- IP Filtering (Whitelist/Blacklist)
- Authorization System (RBAC)
- Write Operation Guard (Two-Step Verification)
- Brute Force Protection
- Audit Logging
- Security Headers
- SSRF Protection
- Suspicious Activity Detection

---

#### [DATABASE.md](./DATABASE.md)
ساختار دیتابیس، Schema، RPC Functions، Migrations و Relationships

**شامل**:
- Database Schemas (pelak، project)
- Table Structures
- RPC Functions Documentation
- Relationships بین جداول
- Indexes و Performance
- Migrations Guide
- مثال‌های Query

---

#### [API.md](./API.md)
راهنمای کامل API Routes، Middleware، Response Handling و Error Handling

**شامل**:
- API Structure و Conventions
- Request/Response Format
- Authentication در API
- Middleware Stack
- Error Handling
- Rate Limiting
- تمام Endpoints با مثال
- Best Practices

---

#### [CORE_LIBRARIES.md](./CORE_LIBRARIES.md)
مستندات کتابخانه‌های core شامل Token Management، RPC Client، Validation و Hooks

**شامل**:
- Token Management (JWT، Refresh Token، iDevice)
- RPC Client (callRpc، extractUserData)
- Validation System
- Normalization System
- Hooks System
- Logging System
- Performance Monitoring

---

#### [CONFIGURATION.md](./CONFIGURATION.md)
راهنمای کامل Configuration، Environment Variables، Config Files و Project Override

**شامل**:
- Environment Variables (Core + Project)
- Configuration Files Structure
- Project Override System
- Security Configuration
- Language Configuration
- راهنمای Setup

---

#### [PROXY_MIDDLEWARE.md](./PROXY_MIDDLEWARE.md)
Proxy System، CSP Configuration، Security Headers و Request Handling

**شامل**:
- Proxy System Overview
- Request Flow
- Authentication Check در Proxy
- CSP Configuration
- Security Headers
- Cookie Management
- Nonce Generation

---

#### [DEVELOPMENT.md](./DEVELOPMENT.md)
راهنمای توسعه، Setup Guide، Development Workflow، Best Practices و Troubleshooting

**شامل**:
- Setup Guide (Installation، Environment Setup)
- Development Workflow
- Code Structure و Conventions
- Testing Guide
- Debugging Tips
- Common Patterns
- Best Practices
- Troubleshooting Guide

---

### مستندات ماژول‌های خاص

#### [WRITE_OPERATION_GUARD.md](./WRITE_OPERATION_GUARD.md)
سیستم دو مرحله‌ای برای محافظت از عملیات نوشتن در دیتابیس

**شامل**:
- معماری سیستم
- نحوه استفاده
- مثال‌های عملی
- Best Practices

---

#### [api/README.md](./api/README.md)
مستندات OpenAPI و API Endpoints

**شامل**:
- OpenAPI Specification
- API Endpoints
- Authentication
- Rate Limiting
- Error Responses

---

## شروع سریع

### برای توسعه‌دهندگان جدید

1. شروع با [ARCHITECTURE.md](./ARCHITECTURE.md) برای درک کلی معماری
2. مطالعه [DEVELOPMENT.md](./DEVELOPMENT.md) برای setup و workflow
3. مراجعه به [API.md](./API.md) برای درک API structure
4. مطالعه [AUTHENTICATION.md](./AUTHENTICATION.md) برای سیستم احراز هویت
5. مراجعه به [SECURITY.md](./SECURITY.md) برای سیستم‌های امنیتی

### برای کار با ماژول خاص

- **احراز هویت**: [AUTHENTICATION.md](./AUTHENTICATION.md)
- **امنیت**: [SECURITY.md](./SECURITY.md)
- **دیتابیس**: [DATABASE.md](./DATABASE.md)
- **API**: [API.md](./API.md)
- **کتابخانه‌ها**: [CORE_LIBRARIES.md](./CORE_LIBRARIES.md)
- **Configuration**: [CONFIGURATION.md](./CONFIGURATION.md)

---

## ساختار مستندات

```
docs/
├── README.md                    # این فایل
├── ARCHITECTURE.md              # معماری کلی
├── AUTHENTICATION.md            # سیستم احراز هویت
├── SECURITY.md                  # سیستم‌های امنیتی
├── DATABASE.md                  # ساختار دیتابیس
├── API.md                       # راهنمای API
├── CORE_LIBRARIES.md            # کتابخانه‌های core
├── CONFIGURATION.md             # راهنمای Configuration
├── PROXY_MIDDLEWARE.md          # Proxy و Middleware
├── DEVELOPMENT.md               # راهنمای توسعه
├── WRITE_OPERATION_GUARD.md     # Write Operation Guard
└── api/
    ├── README.md                # API Documentation
    └── openapi.yaml             # OpenAPI Specification
```

---

## ویژگی‌های مستندات

✅ **جامعیت**: پوشش کامل تمام ماژول‌های اصلی  
✅ **جزئیات**: توضیحات دقیق با مثال‌های عملی  
✅ **دیاگرام**: استفاده از Mermaid برای Visualization  
✅ **مثال‌های کد**: مثال‌های واقعی از پروژه  
✅ **Cross-References**: لینک‌های متقابل بین مستندات  
✅ **فارسی/انگلیسی**: مستندات به فارسی با اصطلاحات فنی انگلیسی

---

## به‌روزرسانی مستندات

مستندات باید همزمان با تغییرات کد به‌روزرسانی شوند:

1. هنگام تغییر API: به‌روزرسانی [API.md](./API.md)
2. هنگام تغییر Security: به‌روزرسانی [SECURITY.md](./SECURITY.md)
3. هنگام تغییر Database: به‌روزرسانی [DATABASE.md](./DATABASE.md)
4. هنگام تغییر Architecture: به‌روزرسانی [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## کمک و پشتیبانی

برای سوالات یا مشکلات:

1. بررسی مستندات مرتبط
2. بررسی مثال‌های موجود
3. مراجعه به Troubleshooting sections
4. تماس با تیم توسعه

---

## نسخه‌بندی

- **نسخه مستندات**: 1.0.0
- **آخرین به‌روزرسانی**: 2025-01-XX
- **نگهدارنده**: Development Team

---

**نکته**: این مستندات به صورت مداوم به‌روزرسانی می‌شوند. برای آخرین نسخه، همیشه به repository مراجعه کنید.
