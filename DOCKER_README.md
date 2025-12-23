# Docker Setup for Next-Pelak

این راهنما نحوه اجرای پروژه Next-Pelak با Docker را توضیح می‌دهد.

## پیش‌نیازها

- Docker
- Docker Compose (اختیاری)

## روش اجرای سریع

### با Docker Compose (توصیه شده)

```bash
# ساخت و اجرای container
docker-compose up -d

# یا برای مشاهده logs
docker-compose up
```

### با Docker مستقیم

```bash
# ساخت image
docker build -t next-pelak .

# اجرای container
docker run -p 3131:3131 next-pelak
```

## دسترسی به برنامه

بعد از اجرای موفق، برنامه در آدرس زیر قابل دسترسی است:
- http://localhost:3131

## دستورات مفید

```bash
# توقف container
docker-compose down

# مشاهده logs
docker-compose logs -f

# rebuild image
docker-compose build --no-cache

# پاک کردن تمام containerها و images
docker-compose down --rmi all --volumes --remove-orphans
```

## ساختار Docker

### Multi-stage Build

Dockerfile از multi-stage build استفاده می‌کند:

1. **deps**: نصب production dependencies
2. **dev-deps**: نصب development dependencies
3. **builder**: build کردن پروژه
4. **runner**: اجرای production app

### ویژگی‌ها

- ⚡ حجم image بهینه شده
- 🔒 اجرای با کاربر غیر root
- 🏥 Health check
- 🔄 Auto restart
- 🚀 Standalone output برای performance بهتر

## Environment Variables

در production mode اجرا می‌شود. برای تنظیم متغیرهای محیطی:

```yaml
# docker-compose.yml
environment:
  - NODE_ENV=production
  - PORT=3131
```

## Troubleshooting

### مشکل در build

```bash
# پاک کردن cache Docker
docker system prune -a

# rebuild بدون cache
docker-compose build --no-cache
```

### مشکل در port

اگر پورت 3131 occupied است:

```yaml
# docker-compose.yml
ports:
  - "3132:3131"  # تغییر پورت host
```

### مشاهده logs

```bash
# logs برنامه
docker-compose logs app

# logs real-time
docker-compose logs -f app
```

## Production Deployment

برای deployment در production:

1. تنظیم environment variables مناسب
2. استفاده از reverse proxy (nginx/caddy)
3. تنظیم SSL certificate
4. monitoring و logging

### مثال nginx config

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3131;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```