/**
 * Helper function to get the correct image URL
 * Handles different image URL formats:
 * - Full URLs (http/https): use as is
 * - /static/ paths: prepend API base URL
 * - Local paths starting with /: use as is
 * - Other paths: assume local public file
 */
export const getImageUrl = (icon?: string | null, fallback: string = '/service.jpg'): string => {
  if (!icon) return fallback;
  
  // If it's already a full URL (http/https), use it as is
  if (icon.startsWith('http://') || icon.startsWith('https://')) {
    return icon;
  }
  
  // If it starts with /static, it's from the API - prepend API base URL
  if (icon.startsWith('/static/')) {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    // Remove /v1 if present in API URL for static files
    const baseUrl = apiBaseUrl.replace(/\/v1$/, '');
    return `${baseUrl}${icon}`;
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


