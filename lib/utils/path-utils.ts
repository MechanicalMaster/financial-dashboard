/**
 * Utility functions for handling paths and URLs in both development and production environments
 */

// We don't need a basePath as Vercel handles routing directly
const isProd = process.env.NODE_ENV === 'production';

// No basePath needed anymore
const basePath = '';

/**
 * Returns the correct path
 * @param path - The relative path (e.g., '/invoices/create')
 * @returns The normalized path
 */
export function getPath(path: string): string {
  // Ensure the path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return normalizedPath;
}

/**
 * Returns the correct API path
 * @param apiPath - The relative API path (e.g., '/api/invoices')
 * @returns The normalized API path
 */
export function getApiPath(apiPath: string): string {
  // Ensure the path starts with a slash
  const normalizedPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
  return normalizedPath;
}

/**
 * Convert a full URL (including hostname) to the correct path
 * @param url - The full URL
 * @returns The path part of the URL
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