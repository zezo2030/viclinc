# CORS Error Fix Guide

## Understanding the Error

### Error Message
```
Access to fetch at 'http://localhost:3000/v1/auth/login' from origin 'http://localhost' 
has been blocked by CORS policy: Response to preflight request doesn't pass access 
control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### What This Means

1. **Cross-Origin Request**: Your frontend at `http://localhost` (port 80) is trying to access the backend at `http://localhost:3000` (port 3000)
2. **Different Origins**: Even though both are localhost, different ports = different origins
3. **Preflight Request Failed**: The browser sends an OPTIONS request first (preflight) to check if the request is allowed
4. **Missing CORS Headers**: The backend didn't send the required `Access-Control-Allow-Origin` header in the preflight response

## Root Causes

1. **CORS Not Configured Properly**: The backend wasn't explicitly allowing `http://localhost` (no port)
2. **NODE_ENV Setting**: If `NODE_ENV=production`, the CORS was more restrictive
3. **Server Not Restarted**: Code changes require server restart
4. **Preflight Handling**: OPTIONS requests weren't being handled correctly

## The Fix

I've updated the CORS configuration in `clinic-api/src/main.ts` to:

1. ✅ **Always allow localhost origins** - Even if NODE_ENV is production, localhost is allowed
2. ✅ **Explicitly allow `http://localhost`** - Added to allowed origins list
3. ✅ **Better preflight handling** - Configured OPTIONS requests properly
4. ✅ **Added logging** - Console logs to debug CORS issues
5. ✅ **Flexible development mode** - Any localhost origin is allowed in development

## How to Apply the Fix

### Step 1: Restart the Backend Server

The server **must be restarted** for the changes to take effect:

```bash
# If running with npm:
cd new/clinic-api
npm run start:dev

# Or if using Docker:
docker-compose restart clinic-api

# Or if running directly:
# Stop the server (Ctrl+C) and restart it
```

### Step 2: Check Server Logs

After restarting, you should see CORS logs in the console:
```
[CORS] Checking origin: http://localhost, NODE_ENV: production, isLocalhost: true
[CORS] Allowing localhost origin: http://localhost
```

### Step 3: Test the Login

Try the login request again. The CORS error should be resolved.

## Verification

### Check CORS Headers

You can verify CORS is working by checking the response headers:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Make a request to the API
4. Check the response headers should include:
   - `Access-Control-Allow-Origin: http://localhost`
   - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS`
   - `Access-Control-Allow-Headers: Content-Type, Authorization, Accept, x-role, X-Requested-With`
   - `Access-Control-Allow-Credentials: true`

### Test with curl

```bash
# Test OPTIONS preflight request
curl -X OPTIONS http://localhost:3000/v1/auth/login \
  -H "Origin: http://localhost" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Should see Access-Control-Allow-Origin in response headers
```

## Troubleshooting

### If Error Still Persists

1. **Verify Server Restarted**: Check that the server actually restarted with new code
2. **Check NODE_ENV**: 
   ```bash
   # In your .env file, set:
   NODE_ENV=development
   ```
3. **Check Port**: Make sure backend is running on port 3000
4. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R)
5. **Check Console Logs**: Look for CORS logs in server console
6. **Try Different Origin**: If frontend is on different port, check if it's in allowed list

### Common Issues

#### Issue: Server says "Not allowed by CORS"
- **Solution**: Check server logs to see which origin was rejected
- **Fix**: Add that origin to `allowedOrigins` array

#### Issue: Still getting preflight error
- **Solution**: Make sure `OPTIONS` is in the `methods` array (it is)
- **Solution**: Verify `preflightContinue: false` and `optionsSuccessStatus: 204`

#### Issue: Credentials not working
- **Solution**: Make sure `credentials: true` is set (it is)
- **Solution**: Frontend must set `credentials: 'include'` in fetch options

## Frontend Configuration

Make sure your frontend is configured correctly:

### If using fetch:
```javascript
fetch('http://localhost:3000/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important for CORS with credentials
  body: JSON.stringify({ email, password })
})
```

### If using axios (already configured):
The axios client in `admin-dashboard/src/api/client.ts` should work correctly.

## Summary

✅ **Fixed**: CORS configuration now allows `http://localhost`
✅ **Fixed**: Preflight OPTIONS requests handled correctly
✅ **Fixed**: Added logging for debugging
✅ **Action Required**: **Restart your backend server** to apply changes

---

**Important**: The server must be restarted for the CORS fix to take effect!





