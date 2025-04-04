/**
 * Utility functions for handling paths and URLs in both development and production environments
 */

// Check if we're in production environment
const isProd = process.env.NODE_ENV === 'production';

// The base path used in production environment (Vercel)
const basePath = isProd ? '/financial-dashboard' : '';

/**
 * Returns the correct path with basePath prefix if in production
 * @param path - The relative path (e.g., '/invoices/create')
 * @returns The path with basePath prefix if in production
 */
export function getPath(path: string): string {
  // Ensure the path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}

/**
 * Returns the correct API path with basePath prefix if in production
 * @param apiPath - The relative API path (e.g., '/api/invoices')
 * @returns The API path with basePath prefix if in production
 */
export function getApiPath(apiPath: string): string {
  // Ensure the path starts with a slash
  const normalizedPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
  return `${basePath}${normalizedPath}`;
}

/**
 * Convert a full URL (including hostname) to the correct path with basePath prefix if needed
 * @param url - The full URL
 * @returns The path part of the URL with basePath prefix if in production
 */
export function getPathFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return getPath(urlObj.pathname);
  } catch (e) {
    // If it's not a valid URL, just use it as a path
    return getPath(url);
  }
}

/**
 * Get environment information
 * @returns Object with environment details
 */
export function getEnvironmentInfo() {
  return {
    isProd,
    basePath,
    nodeEnv: process.env.NODE_ENV,
  };
} 