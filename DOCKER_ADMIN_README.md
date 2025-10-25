# Docker Setup for Admin Dashboard

## نظرة عامة

تم إضافة Admin Dashboard إلى Docker setup مع دعم كامل للـ development والـ production environments.

## البنية الجديدة

### Development Environment
- **API**: http://localhost:3000
- **Website**: http://localhost:3001  
- **Admin Dashboard**: http://localhost:3002/admin
- **MailHog**: http://localhost:8025

### Production Environment
- **API**: http://localhost:3000
- **Website**: http://localhost:3001
- **Admin Dashboard**: http://localhost:3002/admin

## الملفات المضافة/المحدثة

### 1. Docker Compose Files
- `docker-compose.yml` - Production environment
- `docker-compose.dev.yml` - Development environment  
- `docker-compose.prod.yml` - Production environment (backup)

### 2. Admin Dashboard Docker Files
- `admin-dashboard/Dockerfile.dev` - Development Dockerfile
- `admin-dashboard/Dockerfile` - Production Dockerfile
- `admin-dashboard/.dockerignore` - Docker ignore file
- `admin-dashboard/env.example` - Environment variables example

### 3. Updated Command Files
- `docker-commands.bat` - Windows batch commands
- `Makefile` - Unix/Linux make commands

## كيفية التشغيل

### Development Environment

#### Windows
```bash
# Start development environment
docker-commands.bat dev-build

# Or quick start
docker-commands.bat start
```

#### Unix/Linux/Mac
```bash
# Start development environment
make dev-build

# Or quick start
make start
```

#### Manual Docker Commands
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up --build -d

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

### Production Environment

#### Windows
```bash
# Start production environment
docker-commands.bat prod-build
```

#### Unix/Linux/Mac
```bash
# Start production environment
make prod-build
```

#### Manual Docker Commands
```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up --build -d

# Stop production environment
docker-compose -f docker-compose.prod.yml down
```

## الخدمات المتاحة

### Development Services
1. **api** - Backend API (Port 3000)
2. **website** - Main website (Port 3001)
3. **admin-dashboard** - Admin dashboard (Port 3002)
4. **mongo** - MongoDB database (Port 27017)
5. **redis** - Redis cache (Port 6379)
6. **mailhog** - Email testing (Port 8025)

### Production Services
1. **api** - Backend API (Port 3000)
2. **website** - Main website (Port 3001)
3. **admin-dashboard** - Admin dashboard (Port 3002)
4. **mongo** - MongoDB database (Port 27017)
5. **redis** - Redis cache (Port 6379)

## Environment Variables

### Admin Dashboard
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3002
NEXT_PUBLIC_SITE_NAME=لوحة الإدارة
NODE_ENV=development
```

## Volumes

### Development
- `./admin-dashboard:/app` - Source code mounting
- `./shared:/app/shared` - Shared library mounting
- `/app/node_modules` - Node modules cache
- `/app/.next` - Next.js build cache

### Production
- No volumes (built into image)

## الأوامر المتاحة

### Development Commands
```bash
# Start services
docker-commands.bat dev
make dev

# Build and start
docker-commands.bat dev-build
make dev-build

# Stop services
docker-commands.bat dev-down
make dev-down
```

### Production Commands
```bash
# Start services
docker-commands.bat prod
make prod

# Build and start
docker-commands.bat prod-build
make prod-build

# Stop services
docker-commands.bat prod-down
make prod-down
```

### Utility Commands
```bash
# Show logs
docker-commands.bat logs
make logs

# Show status
docker-commands.bat status
make status

# Restart services
docker-commands.bat restart
make restart

# Clean up
docker-commands.bat clean
make clean
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Make sure ports 3000, 3001, 3002, 27017, 6379, 8025 are available
   - Check if other services are using these ports

2. **Build Failures**
   - Clean Docker cache: `docker system prune -f`
   - Rebuild without cache: `docker-compose -f docker-compose.dev.yml build --no-cache`

3. **Permission Issues (Linux/Mac)**
   - Fix file permissions: `sudo chown -R $USER:$USER .`
   - Check Docker daemon is running: `sudo systemctl start docker`

4. **Admin Dashboard Not Loading**
   - Check if API is running: http://localhost:3000/health
   - Check admin dashboard logs: `docker-compose -f docker-compose.dev.yml logs admin-dashboard`

### Useful Commands

```bash
# Check service status
docker-compose -f docker-compose.dev.yml ps

# View logs for specific service
docker-compose -f docker-compose.dev.yml logs admin-dashboard

# Execute command in running container
docker-compose -f docker-compose.dev.yml exec admin-dashboard sh

# Rebuild specific service
docker-compose -f docker-compose.dev.yml up --build admin-dashboard
```

## Development Workflow

1. **Start Development Environment**
   ```bash
   make start
   ```

2. **Access Services**
   - Website: http://localhost:3001
   - Admin Dashboard: http://localhost:3002/admin
   - API: http://localhost:3000
   - MailHog: http://localhost:8025

3. **Make Changes**
   - Code changes are automatically reflected (hot reload)
   - Shared library changes require restart

4. **Stop Environment**
   ```bash
   make dev-down
   ```

## Production Deployment

1. **Build Production Images**
   ```bash
   make prod-build
   ```

2. **Access Production Services**
   - Website: http://localhost:3001
   - Admin Dashboard: http://localhost:3002/admin
   - API: http://localhost:3000

3. **Stop Production Environment**
   ```bash
   make prod-down
   ```

## Security Notes

- Admin Dashboard is accessible at `/admin` path
- API endpoints are protected with authentication
- Database connections are internal to Docker network
- Redis is used for session management and caching

## Performance Tips

1. **Development**
   - Use volumes for hot reload
   - Shared library is mounted for live updates

2. **Production**
   - Images are optimized for production
   - No source code volumes for security
   - Built-in restart policies

## Monitoring

### Health Checks
- API: http://localhost:3000/health
- Website: http://localhost:3001
- Admin Dashboard: http://localhost:3002/admin

### Logs
```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f admin-dashboard
```

---

**ملاحظة**: تأكد من أن جميع المتطلبات مثبتة (Docker, Docker Compose) قبل التشغيل.
