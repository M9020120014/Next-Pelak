# معماری پروژه Next-Pelak

**نسخه**: 1.0.0  
**آخرین به‌روزرسانی**: 2025-01-XX

## فهرست مطالب

- [معرفی](#معرفی)
- [تکنولوژی‌ها](#تکنولوژی‌ها)
- [ساختار دایرکتوری‌ها](#ساختار-دایرکتوری‌ها)
- [معماری کلی](#معماری-کلی)
- [جریان داده‌ها](#جریان-داده‌ها)
- [Design Patterns](#design-patterns)
- [Dependency Graph](#dependency-graph)

---

## معرفی

Next-Pelak یک سیستم مدیریت محتوا (CMS) مبتنی بر Next.js است که با معماری modular و قابل توسعه طراحی شده است. این پروژه از معماری سه‌لایه (Client-Server-Database) استفاده می‌کند و شامل سیستم‌های پیشرفته احراز هویت، امنیت و مدیریت محتوا است.

### ویژگی‌های کلیدی

- **معماری Modular**: جداسازی core و project-specific code
- **امنیت پیشرفته**: CSRF Protection، Rate Limiting، Authorization، Audit Logging
- **احراز هویت کامل**: JWT Tokens، Refresh Tokens، OTP System
- **پشتیبانی چندزبانه**: RTL/LTR Support، Language Routing
- **Performance Optimization**: Caching، Code Splitting، Image Optimization
- **Type Safety**: TypeScript با strict mode

---

## تکنولوژی‌ها

### Frontend

- **Next.js 16.0.10**: React Framework با App Router
- **React 19.2.1**: UI Library
- **TypeScript 5**: Type Safety
- **Tailwind CSS 4**: Styling
- **Radix UI**: Accessible UI Components

### Backend

- **Next.js API Routes**: Server-side API endpoints
- **PostgreSQL**: Database
- **PostgREST**: REST API برای Database
- **Redis (ioredis)**: Rate Limiting و Caching

### Security & Monitoring

- **JWT**: Access Token Management
- **CSRF Protection**: Token-based CSRF Protection
- **Rate Limiting**: Redis-based Rate Limiting
- **PostHog**: Analytics و Monitoring
- **Google Analytics**: User Tracking

### Development Tools

- **ESLint**: Code Linting
- **Jest**: Testing Framework
- **Docker**: Containerization

---

## ساختار دایرکتوری‌ها

```
Next-Pelak/
├── app/                          # Next.js App Router
│   ├── [lang]/                   # Language-based routing
│   │   ├── (admin)/              # Admin routes (protected)
│   │   │   ├── dashboard/        # Dashboard pages
│   │   │   └── profile/          # Profile pages
│   │   ├── (auth)/               # Authentication routes
│   │   │   ├── login/            # Login page
│   │   │   ├── logout-all/       # Logout all devices
│   │   │   └── verification/     # OTP verification
│   │   ├── (page)/               # Public pages
│   │   │   ├── category/         # Category pages
│   │   │   ├── privacy/          # Privacy policy
│   │   │   └── terms/             # Terms of service
│   │   ├── donate/               # Donation pages
│   │   └── page/                 # Content pages
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication APIs
│   │   ├── comments/             # Comments API
│   │   ├── page/                 # Page API
│   │   ├── payment/              # Payment API
│   │   └── user/                 # User API
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
│
├── core/                         # Core Module (Reusable)
│   ├── api/                      # Core API implementations
│   ├── asset/                    # Core assets (fonts, media)
│   ├── components/               # Core React components
│   │   ├── auth/                 # Auth components
│   │   ├── provider/            # Context providers
│   │   ├── security/            # Security components
│   │   └── ui/                   # UI components
│   ├── config/                   # Core configuration
│   │   ├── base.ts              # Base config (env, production)
│   │   ├── config.ts            # Core config interface
│   │   ├── env.ts               # Environment variables
│   │   ├── security.ts          # Security config
│   │   └── lang.ts              # Language config
│   ├── database/                 # Database schema and functions
│   │   ├── schema/              # SQL schema files
│   │   ├── functions/          # RPC functions
│   │   └── migrations/          # Migration scripts
│   ├── hooks/                    # Core React hooks
│   ├── lib/                      # Core libraries
│   │   ├── api/                 # API utilities
│   │   ├── auth/                # Auth utilities
│   │   ├── security/            # Security utilities
│   │   ├── token/               # Token management
│   │   ├── rest/                # REST client (RPC)
│   │   ├── validation/          # Validation functions
│   │   ├── normalize/           # Normalization functions
│   │   └── hooks/               # Hook system
│   ├── proxy.ts                 # Middleware proxy
│   └── styles/                  # Core styles
│
├── project/                      # Project-specific code
│   ├── config/                  # Project config
│   │   ├── config.ts           # Project routes
│   │   ├── environment/        # Project env vars
│   │   ├── language/           # Project languages
│   │   └── site/               # Site config
│   ├── data/                    # Project data
│   ├── provider/                # Project providers
│   ├── styles/                  # Project styles
│   └── theme/                   # Project theme
│       ├── footer/             # Footer component
│       ├── header/             # Header component
│       └── navbar/             # Navbar component
│
├── site/                         # Site-specific components
│   ├── components/             # Site components
│   ├── media/                  # Site media
│   ├── page/                   # Page components
│   └── translations/           # Translation files
│
├── docs/                         # Documentation
├── public/                       # Static assets
└── docker-compose.yml           # Docker configuration
```

### توضیح بخش‌های کلیدی

#### `app/`
مسیرهای Next.js App Router. شامل صفحات، API routes و layout ها.

#### `core/`
ماژول اصلی قابل استفاده مجدد. شامل:
- **API**: پیاده‌سازی‌های API مشترک
- **Components**: کامپوننت‌های React قابل استفاده مجدد
- **Config**: تنظیمات core
- **Database**: Schema و RPC Functions
- **Lib**: کتابخانه‌های utility

#### `project/`
کدهای خاص پروژه که می‌توانند core را override کنند:
- **Config**: تنظیمات پروژه (routes، languages، site)
- **Theme**: کامپوننت‌های theme (header، footer، navbar)
- **Provider**: Context providers پروژه

#### `site/`
کامپوننت‌ها و صفحات خاص سایت:
- **Page**: کامپوننت‌های صفحه (Home، PageDetail، Comments)
- **Translations**: فایل‌های ترجمه

---

## معماری کلی

### معماری سه‌لایه

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        Browser[Browser]
        React[React Components]
        NextClient[Next.js Client]
    end
    
    subgraph Server["Server Layer"]
        NextServer[Next.js Server]
        Proxy[Middleware Proxy]
        APIRoutes[API Routes]
        Middleware[Security Middleware]
    end
    
    subgraph Database["Database Layer"]
        PostgREST[PostgREST]
        PostgreSQL[(PostgreSQL)]
        Redis[(Redis)]
    end
    
    Browser --> React
    React --> NextClient
    NextClient --> NextServer
    NextServer --> Proxy
    Proxy --> APIRoutes
    APIRoutes --> Middleware
    Middleware --> PostgREST
    PostgREST --> PostgreSQL
    APIRoutes --> Redis
    
    style Client fill:#e1f5ff
    style Server fill:#fff4e1
    style Database fill:#e8f5e9
```

### Request Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant P as Proxy/Middleware
    participant A as API Route
    participant M as Middleware
    participant R as PostgREST
    participant D as PostgreSQL
    
    C->>P: HTTP Request
    P->>P: Check Pathname
    P->>P: Generate Nonce
    P->>P: Set CSP Headers
    P->>P: Check Auth (if admin route)
    P->>A: Forward Request
    
    A->>M: validateAPIRequest()
    M->>M: Check CSRF
    M->>M: Check Rate Limit
    M->>M: Check IP Filter
    M->>A: Validation Result
    
    A->>A: Process Request
    A->>R: callRpc(function, params)
    R->>D: Execute SQL Function
    D->>R: Return Result
    R->>A: JSON Response
    A->>C: HTTP Response
```

---

## جریان داده‌ها

### Authentication Flow

```mermaid
flowchart LR
    A[User Login] --> B[Validate Credentials]
    B --> C{Valid?}
    C -->|No| D[Return Error]
    C -->|Yes| E[Generate Refresh Token]
    E --> F[Store in Database]
    F --> G[Generate Access Token JWT]
    G --> H[Return Tokens]
    H --> I[Client Stores Tokens]
    
    I --> J[API Request]
    J --> K{Access Token Valid?}
    K -->|Yes| L[Process Request]
    K -->|No| M[Check Refresh Token]
    M --> N{Refresh Token Valid?}
    N -->|Yes| O[Generate New Access Token]
    N -->|No| P[Require Login]
    O --> L
```

### Data Flow در API Routes

```mermaid
flowchart TD
    A[API Request] --> B[validateAPIRequest]
    B --> C{CSRF Valid?}
    C -->|No| D[403 Forbidden]
    C -->|Yes| E{Rate Limit OK?}
    E -->|No| F[429 Too Many Requests]
    E -->|Yes| G[Parse Request Body]
    G --> H[Validate Input]
    H --> I{Input Valid?}
    I -->|No| J[400 Bad Request]
    I -->|Yes| K[guardWriteOperation]
    K --> L{Write Operation?}
    L -->|Yes| M[Verify Refresh Token]
    L -->|No| N[Process Request]
    M --> O{Token Valid?}
    O -->|No| P[401 Unauthorized]
    O -->|Yes| N
    N --> Q[callRpc]
    Q --> R[PostgREST]
    R --> S[PostgreSQL Function]
    S --> T[Return Result]
    T --> U[Format Response]
    U --> V[Return to Client]
```

---

## Design Patterns

### 1. Modular Architecture Pattern

پروژه از معماری modular استفاده می‌کند که core و project-specific code را جدا می‌کند:

```typescript
// core/ - Reusable code
export function validateMobile(mobile: string): ValidationResult { ... }

// project/ - Project-specific overrides
export const ROUTES = { ADMIN_ROUTE_PATTERN: /^\/[^\/]+\/(dashboard|profile)/ }
```

**مزایا**:
- قابلیت استفاده مجدد
- جداسازی concerns
- آسان‌تر کردن maintenance

### 2. Middleware Pattern

استفاده از middleware chain برای پردازش requests:

```typescript
// Proxy middleware
export default async function proxy(request: NextRequest) {
  // 1. Pathname validation
  // 2. Authentication check
  // 3. Nonce generation
  // 4. CSP headers
  // 5. Cookie management
}

// API middleware
export async function validateAPIRequest(request: NextRequest) {
  // 1. IP filtering
  // 2. Request size validation
  // 3. Rate limiting
  // 4. CSRF validation
}
```

### 3. Repository Pattern (RPC)

استفاده از RPC functions به عنوان abstraction layer:

```typescript
// Instead of direct SQL queries
const result = await callRpc("pelak_auth_login", {
  p_mobile: mobile,
  p_password: password,
  p_idevice: iDevice,
});
```

**مزایا**:
- جداسازی business logic از database
- امنیت بیشتر (SQL injection prevention)
- قابلیت تست بهتر

### 4. Hook Pattern

سیستم hook برای extensibility:

```typescript
// Register hook
registerHook('auth:after_login', async (user) => {
  // Custom logic
});

// Execute hook
await executeHook('auth:after_login', user);
```

### 5. Provider Pattern

استفاده از React Context Providers:

```typescript
<Security>
  <Providers>
    <ProjectProvider>
      <App />
    </ProjectProvider>
  </Providers>
</Security>
```

### 6. Strategy Pattern

استفاده از strategy pattern برای validation و normalization:

```typescript
// Validation strategies
validateMobile(mobile)
validatePassword(password)
validateNationalCode(code)

// Normalization strategies
normalize('mobile', value)
normalize('text', value)
normalize('number', value)
```

---

## Dependency Graph

### Core Dependencies

```mermaid
graph TD
    A[app/layout.tsx] --> B[core/config/config.ts]
    A --> C[core/components/provider/Security.tsx]
    A --> D[core/components/provider/Provider.tsx]
    A --> E[project/provider/Provider.tsx]
    
    B --> F[core/config/env.ts]
    B --> G[core/config/project-override.ts]
    
    C --> H[core/components/security/SecurityProvider.tsx]
    H --> I[core/lib/security/cookies.ts]
    
    D --> J[core/lib/hooks/loader.ts]
    J --> K[core/lib/hooks/registry.ts]
    
    E --> L[project/config/config.ts]
    E --> M[project/theme/navbar/Navbar.tsx]
    E --> N[project/theme/footer/Footer.tsx]
```

### API Route Dependencies

```mermaid
graph TD
    A[API Route] --> B[core/lib/security/api-middleware.ts]
    A --> C[core/lib/rest/rpc.ts]
    A --> D[core/lib/api/response.ts]
    A --> E[core/lib/api/error-handler.ts]
    
    B --> F[core/lib/security/cookies.ts]
    B --> G[core/lib/security/rate-limit.ts]
    B --> H[core/lib/security/ip-filter.ts]
    
    C --> I[core/config/env.ts]
    C --> J[core/lib/api/cache.ts]
    
    D --> K[core/lib/api/error-messages.ts]
    
    E --> K
```

### Authentication Dependencies

```mermaid
graph TD
    A[useAuth Hook] --> B[core/lib/auth/token-manager.ts]
    A --> C[core/components/security/SecurityProvider.tsx]
    
    B --> D[core/lib/token/jwt-client.ts]
    
    E[API Auth Route] --> F[core/lib/security/authorization.ts]
    E --> G[core/lib/rest/rpc.ts]
    E --> H[core/lib/token/jwt.ts]
    
    F --> H
    F --> I[core/lib/token/auth-cookie.ts]
    
    G --> J[core/database/functions/01_auth_functions.sql]
```

---

## نکات مهم معماری

### 1. Separation of Concerns

- **Core**: کدهای قابل استفاده مجدد
- **Project**: کدهای خاص پروژه
- **Site**: کامپوننت‌های خاص سایت

### 2. Security First

- تمام API routes از middleware امنیتی استفاده می‌کنند
- Write operations نیاز به دو مرحله verification دارند
- تمام sensitive operations لاگ می‌شوند

### 3. Type Safety

- استفاده از TypeScript با strict mode
- Type definitions برای تمام API responses
- Type guards برای runtime validation

### 4. Performance

- Caching در RPC calls
- Code splitting در Next.js
- Image optimization
- Lazy loading برای components

### 5. Extensibility

- Hook system برای custom logic
- Project override برای configuration
- Modular components

---

## منابع بیشتر

- [AUTHENTICATION.md](./AUTHENTICATION.md) - سیستم احراز هویت
- [SECURITY.md](./SECURITY.md) - سیستم‌های امنیتی
- [DATABASE.md](./DATABASE.md) - ساختار دیتابیس
- [API.md](./API.md) - راهنمای API
- [CORE_LIBRARIES.md](./CORE_LIBRARIES.md) - کتابخانه‌های core
- [CONFIGURATION.md](./CONFIGURATION.md) - راهنمای Configuration

---

**آخرین به‌روزرسانی**: 2025-01-XX  
**نگهدارنده**: Development Team
