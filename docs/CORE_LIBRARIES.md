# کتابخانه‌های Core Next-Pelak

**نسخه**: 1.0.0  
**آخرین به‌روزرسانی**: 2025-01-XX

## فهرست مطالب

- [Token Management](#token-management)
- [RPC Client](#rpc-client)
- [Validation System](#validation-system)
- [Normalization System](#normalization-system)
- [Hooks System](#hooks-system)
- [Logging System](#logging-system)
- [Performance Monitoring](#performance-monitoring)

---

## Token Management

### JWT Tokens

#### generateAccessToken

ایجاد Access Token.

```typescript
import { generateAccessToken } from '@/core/lib/token/jwt'

const token = generateAccessToken({
  id: user.id,
  mobile: user.mobile,
  firstname: user.firstname,
  lastname: user.lastname,
  email: user.email,
  profileimage: user.profileimage,
  profileurl: user.profileurl,
})
```

#### verifyAccessToken

بررسی و decode کردن Access Token.

```typescript
import { verifyAccessToken } from '@/core/lib/token/jwt'

const payload = verifyAccessToken(token)
if (!payload) {
  // Token invalid or expired
}
```

### Client-Side Token Management

#### getAccessToken / setAccessToken / clearAccessToken

```typescript
import { 
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  isTokenExpired 
} from '@/core/lib/auth/token-manager'

const token = getAccessToken()
setAccessToken(newToken)
clearAccessToken()

if (isTokenExpired(token)) {
  // Token expired
}
```

### Refresh Token Management

```typescript
import {
  getRefreshTokenCookie,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  validateRefreshTokenFormat
} from '@/core/lib/token/auth-cookie'

const refreshToken = await getRefreshTokenCookie()
await setRefreshTokenCookie(token)
const response = clearRefreshTokenCookie(response)

if (!validateRefreshTokenFormat(token)) {
  // Invalid format
}
```

### iDevice Token

```typescript
import { generateIDeviceToken, getIDeviceToken } from '@/core/lib/token/idevice'

const iDevice = generateIDeviceToken(userAgent)
const existingIDevice = await getIDeviceToken()
```

---

## RPC Client

### callRpc

فراخوانی RPC function در دیتابیس.

```typescript
import { callRpc } from '@/core/lib/rest/rpc'

const result = await callRpc("pelak_auth_login", {
  p_mobile: mobile,
  p_password: password,
  p_idevice: iDevice,
})

if (!result.success) {
  // Handle error
}
```

### extractUserData

استخراج داده‌های کاربر از RPC response.

```typescript
import { extractUserData } from '@/core/lib/rest/rpc'

const userData = extractUserData(result)
if (userData) {
  // Use userData.id, userData.mobile, etc.
}
```

### hasRefreshToken

بررسی وجود Refresh Token در response.

```typescript
import { hasRefreshToken } from '@/core/lib/rest/rpc'

if (hasRefreshToken(result)) {
  const refreshToken = result.refreshtoken
}
```

---

## Validation System

### Mobile Validation

```typescript
import { validateMobile } from '@/core/lib/validation'

const result = validateMobile(mobile)
if (!result.success) {
  return validationError(result)
}
```

### Password Validation

```typescript
import { validatePassword } from '@/core/lib/validation'

const result = validatePassword(password, 8, 50)
if (!result.success) {
  return validationError(result)
}
```

### Device ID Validation

```typescript
import { validateDeviceId } from '@/core/lib/validation'

const result = validateDeviceId(iDevice)
if (!result.success) {
  return validationError(result)
}
```

### National Code Validation

```typescript
import { validateNationalCode } from '@/core/lib/validation'

const result = validateNationalCode(nationalCode)
if (!result.success) {
  return validationError(result)
}
```

### Date Validation

```typescript
import { validateShortDate, validateDate } from '@/core/lib/validation'

// Short date (YYYY-MM-DD)
const result = validateShortDate("1403-01-15")

// Date with time (YYYY-MM-DD HH:MM:SS)
const result = validateDate("1403-01-15 14:30:00")
```

---

## Normalization System

### normalize Function

```typescript
import { normalize } from '@/core/lib/normalize'

// Mobile normalization
const normalized = normalize('mobile', '۰۹۱۲۳۴۵۶۷۸۹')
// Returns: "09123456789"

// OTP normalization
const normalized = normalize('otp', '۱۲۳۴')
// Returns: "1234"

// Text normalization
const normalized = normalize('text', '  hello  ')
// Returns: "hello"
```

### Individual Normalizers

```typescript
import {
  normalizeMobile,
  normalizeOtp,
  normalizeNationalCode,
  normalizeNumber,
  normalizeText,
  normalizePassword
} from '@/core/lib/normalize'

const mobile = normalizeMobile('۰۹۱۲۳۴۵۶۷۸۹')
const otp = normalizeOtp('۱۲۳۴')
const nationalCode = normalizeNationalCode('۱۲۳۴۵۶۷۸۹۰')
const number = normalizeNumber('۱۲۳')
const text = normalizeText('  hello  ')
const password = normalizePassword('my password123!')
```

---

## Hooks System

### Register Hook

```typescript
import { registerHook } from '@/core/lib/hooks'

registerHook('auth:after_login', async (user) => {
  // Custom logic after login
})
```

### Execute Hook

```typescript
import { hookRegistry } from '@/core/lib/hooks'

await hookRegistry.execute('auth:after_login', user)
```

### Available Hooks

- `auth:after_login`: بعد از ورود موفق
- `auth:before-logout`: قبل از خروج
- `auth:after-logout`: بعد از خروج
- `auth:token-refresh`: بعد از refresh token

---

## Logging System

### Server-Side Logging

```typescript
import { SubmitLogServer } from '@/core/lib/log/logger'

await SubmitLogServer(
  'info',
  'module/file',
  'Log message',
  { metadata: 'data' }
)
```

### Log Helpers

```typescript
import { logError, logWarn, logInfo } from '@/core/lib/log/logger-utils'

logError('Error message', error, 'module/file')
logWarn('Warning message', { data }, 'module/file')
logInfo('Info message', { data }, 'module/file')
```

---

## Performance Monitoring

### trackPerformance

```typescript
import { trackPerformance } from '@/core/lib/performance/monitoring'

await trackPerformance(
  '/api/endpoint',
  'POST',
  duration,
  status
)
```

### withErrorHandlingAndTracking

```typescript
import { withErrorHandlingAndTracking } from '@/core/lib/performance/monitoring'

export const POST = withErrorHandlingAndTracking(
  POSTHandler,
  '/api/endpoint'
)
```

---

## منابع بیشتر

- [AUTHENTICATION.md](./AUTHENTICATION.md) - Token Management
- [API.md](./API.md) - RPC Client Usage
- [SECURITY.md](./SECURITY.md) - Validation و Security

---

**آخرین به‌روزرسانی**: 2025-01-XX  
**نگهدارنده**: Development Team
