# استفاده از Node.js 20 LTS
FROM node:20-alpine AS base

# نصب dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# کپی package files
COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app

# کپی dependencies از stage قبلی
COPY --from=deps /app/node_modules ./node_modules

# کپی تمام فایل‌های پروژه
COPY . .

# Build پروژه
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# کپی فایل‌های build شده از standalone output
COPY --from=builder /app/public ./public

# کپی standalone output (شامل server.js و تمام dependencies مورد نیاز)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# کپی فایل‌های env از builder stage (که از لوکال کپی شده‌اند)
COPY --from=builder --chown=nextjs:nodejs /app/.env* ./

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# استفاده از server.js که در standalone output ایجاد می‌شود
CMD ["node", "server.js"]
