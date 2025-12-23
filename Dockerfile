# استفاده از Node.js 20 LTS
FROM node:20-alpine AS base

# نصب dependencies فقط برای production
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# کپی package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# نصب dependencies برای development
FROM base AS dev-deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci && npm cache clean --force

# Build stage
FROM dev-deps AS builder
WORKDIR /app

COPY . .
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# کپی فایل‌های build شده
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3131

ENV PORT=3131
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]