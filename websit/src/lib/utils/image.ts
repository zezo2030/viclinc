/**
 * Helper function to get the API base URL (same logic as apiClient)
 * Handles both nginx proxy mode and direct API mode
 */
const getApiBaseUrl = (): string => {
  if (typeof window === 'undefined') {
    // Server-side: use environment variable
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }
  
  // Client-side: use same logic as API client
  const url = process.env.NEXT_PUBLIC_API_URL || 
    (window.location.origin === 'http://localhost' ? 'http://localhost/api' : 'http://localhost:3000');
  
  // Remove /v1 from end if present, but keep /api
  return url.replace(/\/v1\/?$/, '').replace(/\/api\/?$/, '/api');
};

/**
 * Helper function to get the API origin (same logic as admin dashboard)
 * This extracts just the origin (protocol + host + port) from the API URL
 */
const getApiOrigin = (): string => {
  const apiBaseUrl = getApiBaseUrl();
  try {
    // Extract origin from API URL (same as admin dashboard does)
    const url = new URL(apiBaseUrl);
    return url.origin;
  } catch {
    // If URL parsing fails, try to extract origin manually
    const match = apiBaseUrl.match(/^https?:\/\/[^\/]+/);
    return match ? match[0] : apiBaseUrl;
  }
};

/**
 * Helper function to get the correct image URL
 * Handles different image URL formats:
 * - Full URLs (http/https): use as is
 * - /static/ paths: prepend API origin (same logic as admin dashboard)
 * - Local paths starting with /: use as is
 * - Other paths: assume local public file
 */
export const getImageUrl = (icon?: string | null, fallback: string = '/service.jpg'): string => {
  if (!icon) return fallback;
  
  // If it's already a full URL (http/https), use it as is
  if (icon.startsWith('http://') || icon.startsWith('https://')) {
    return icon;
  }
  
  // If it starts with /static, it's from the API - prepend API origin (same as admin dashboard)
  if (icon.startsWith('/static/')) {
    const apiOrigin = getApiOrigin();
    // Use origin + path (same logic as admin dashboard's resolveLogoUrl)
    return `${apiOrigin}${icon}`;
  }
  
  // If it starts with /, it's a local public file
  if (icon.startsWith('/')) {
    return icon;
  }
  
  // Otherwise, assume it's a local public file
  return `/${icon}`;
};

/**
 * Helper function to get department logo URL
 * Prioritizes logoUrl over icon
 */
export const getDepartmentImageUrl = (logoUrl?: string | null, icon?: string | null, fallback: string = '/service.jpg'): string => {
  return getImageUrl(logoUrl || icon, fallback);
};


