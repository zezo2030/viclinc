# 🔧 Fix for 404 Errors on Admin Dashboard Assets

## 🔍 Problem Description

When accessing the admin dashboard, you may see errors like:
```
GET http://localhost/assets/index-BHji0Xn8.js 404 (Not Found)
GET http://localhost/assets/rolldown-runtime-GyhWBpbT.js 404 (Not Found)
GET http://localhost/assets/charts-BcwyHAPy.js 404 (Not Found)
GET http://localhost/assets/index-30r9uNDz.css 404 (Not Found)
GET http://localhost/assets/react-vendor-DS_Q5uyw.js 404 (Not Found)
```

## 🎯 Root Cause

The issue occurs because:

1. **Build-time vs Runtime Configuration**: The `VITE_BASE` environment variable was only set at runtime (in docker-compose), but **not during the build process** in the Dockerfile.

2. **Base Path Mismatch**: When `VITE_BASE=/admin/`, Vite needs to know this during the build to:
   - Generate correct asset paths in the HTML
   - Output assets to the correct directory structure
   - Set up proper base paths for routing

3. **Nginx Proxy Configuration**: The reverse proxy strips the `/admin` prefix when forwarding requests, but the assets weren't built with the correct base path.

## ✅ Solution Applied

### 1. Updated Dockerfile
- Added `ARG` declarations for build-time environment variables
- Set `ENV` variables from build arguments so Vite can use them during build
- Updated nginx configuration to properly serve assets

### 2. Updated docker-compose.yml Files
- Added `build.args` section to pass environment variables during build
- This ensures `VITE_BASE` is available when `vite build` runs

### 3. Improved Nginx Configuration
- Added explicit `/assets/` location block
- Added proper CORS headers for assets
- Improved error handling

## 🚀 How to Apply the Fix

### Option 1: Rebuild Docker Containers (Recommended)

```bash
# Rebuild the admin dashboard container with the new configuration
docker-compose -f docker-compose.prod.yml build --no-cache admin

# Restart the container
docker-compose -f docker-compose.prod.yml up -d admin
```

Or for development:
```bash
docker-compose build --no-cache admin
docker-compose up -d admin
```

### Option 2: Full Rebuild

```bash
# Stop all containers
docker-compose -f docker-compose.prod.yml down

# Rebuild all services
docker-compose -f docker-compose.prod.yml build --no-cache

# Start all services
docker-compose -f docker-compose.prod.yml up -d
```

## 📋 Verification Steps

After rebuilding, verify the fix:

1. **Check the build output**:
   ```bash
   docker-compose -f docker-compose.prod.yml logs admin | grep -i "vite"
   ```

2. **Access the admin dashboard**:
   - Open: `http://localhost/admin/` (or your domain)
   - Open browser DevTools (F12)
   - Check the Network tab - all assets should load with 200 status

3. **Check container contents** (optional):
   ```bash
   docker exec virclinc-admin ls -la /usr/share/nginx/html/assets/
   ```
   You should see the built JavaScript and CSS files.

## 🔍 Troubleshooting

### If assets still don't load:

1. **Verify VITE_BASE is set correctly**:
   ```bash
   # Check your .env file
   cat .env | grep VITE_BASE
   # Should show: VITE_BASE=/admin/
   ```

2. **Check build logs**:
   ```bash
   docker-compose -f docker-compose.prod.yml logs admin
   ```

3. **Verify nginx configuration**:
   ```bash
   docker exec virclinc-admin cat /etc/nginx/conf.d/default.conf
   ```

4. **Test asset serving directly**:
   ```bash
   # Get a file name from the container
   docker exec virclinc-admin ls /usr/share/nginx/html/assets/ | head -1
   
   # Test if nginx serves it (replace FILENAME with actual file)
   curl -I http://localhost/admin/assets/FILENAME
   ```

### If running in development mode:

If you're running `npm run dev` locally (not in Docker), make sure:

1. **Create `.env` file** in `admin-dashboard/`:
   ```env
   VITE_BASE=/admin/
   VITE_API_URL=http://localhost/api
   VITE_SITE_URL=http://localhost/admin
   VITE_SITE_NAME=Admin Dashboard
   ```

2. **Restart the dev server**:
   ```bash
   cd admin-dashboard
   npm run dev
   ```

3. **Access at**: `http://localhost:3002/admin/` (note the `/admin/` path)

## 📝 Technical Details

### Build Process Flow

1. **Dockerfile receives build args** from docker-compose.yml
2. **Environment variables are set** before `npm install` and `vite build`
3. **Vite reads VITE_BASE** during build and generates correct paths
4. **HTML references assets** as `/admin/assets/...` (if VITE_BASE=/admin/)
5. **Nginx reverse proxy** strips `/admin` prefix when forwarding
6. **Admin container nginx** serves assets from `/usr/share/nginx/html/assets/`

### File Structure After Build

```
/usr/share/nginx/html/
├── index.html          (references /admin/assets/...)
├── assets/
│   ├── index-*.js      (JavaScript bundles)
│   ├── index-*.css     (CSS files)
│   ├── react-vendor-*.js
│   ├── charts-*.js
│   └── rolldown-runtime-*.js
└── ...
```

## 🎉 Expected Result

After applying the fix:
- ✅ All assets load successfully (200 status codes)
- ✅ No 404 errors in browser console
- ✅ Admin dashboard loads completely
- ✅ All JavaScript and CSS files are served correctly

## 📚 Related Files

- `admin-dashboard/Dockerfile` - Build configuration
- `docker-compose.yml` - Development Docker configuration
- `docker-compose.prod.yml` - Production Docker configuration
- `admin-dashboard/vite.config.ts` - Vite configuration
- `deploy/nginx.conf` - Reverse proxy configuration



