# Stage 1: Build
# استفاده از deps image که قبلاً ساخته شده
FROM r.htni.ir/next-pelak/deps:latest AS builder
WORKDIR /app

# کپی فایل‌های پروژه
COPY . .

# Build پروژه (standalone output)
RUN npm run build

# Stage 2: Production (سبک‌ترین حالت)
FROM r.htni.ir/node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# کپی فایل‌های standalone build (فقط فایل‌های runtime)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

# استفاده از server.js که در standalone build موجود است
CMD ["node", "server.js"]