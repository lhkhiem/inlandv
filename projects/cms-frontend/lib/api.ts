// API configuration
// This file centralizes API URLs to avoid hardcoding localhost

const DEFAULT_BACKEND_PORT = 4001;

const buildUrlFromWindow = (port: number) => {
  if (typeof window === 'undefined') {
    return null;
  }
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:${port}`;
};

let apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || apiBaseUrl;

const trimTrailingSlash = (url: string) => {
  if (!url) return url;
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

if (typeof window !== 'undefined') {
  const runtimeUrl = buildUrlFromWindow(DEFAULT_BACKEND_PORT);
  if (!process.env.NEXT_PUBLIC_API_URL && runtimeUrl) {
    apiBaseUrl = runtimeUrl;
  }
  if (!process.env.NEXT_PUBLIC_BACKEND_URL && runtimeUrl) {
    backendUrl = runtimeUrl;
  }
}

export const API_BASE_URL = apiBaseUrl;
export const BACKEND_URL = backendUrl;

export const resolveApiBaseUrl = () => {
  if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_API_URL) {
    const runtimeUrl = buildUrlFromWindow(DEFAULT_BACKEND_PORT);
    if (runtimeUrl) {
      return runtimeUrl;
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || apiBaseUrl;
};

export const resolveBackendUrl = () => {
  if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_BACKEND_URL) {
    const runtimeUrl = buildUrlFromWindow(DEFAULT_BACKEND_PORT);
    if (runtimeUrl) {
      return runtimeUrl;
    }
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL || backendUrl;
};

export const getNormalizedApiBaseUrl = () => trimTrailingSlash(resolveApiBaseUrl());

export const getNormalizedBackendUrl = () => trimTrailingSlash(resolveBackendUrl());

export const buildApiUrl = (path = '') => {
  // Always use direct backend URL, not Next.js rewrite
  // This ensures cookies are sent correctly
  const base = getNormalizedBackendUrl();
  if (!path) return base;
  // Remove leading /api if present since backend already has /api prefix
  const cleanPath = path.startsWith('/api/') ? path : path.startsWith('/') ? `/api${path}` : `/api/${path}`;
  return `${base}${cleanPath}`;
};

export const buildBackendUrl = (path = '') => {
  const base = getNormalizedBackendUrl();
  if (!path) return base;
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
};

export const getAssetUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  // If path already has protocol, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Otherwise prepend backend URL
  return buildBackendUrl(path);
};

export const getThumbnailUrl = (asset: { thumb_url?: string; url?: string } | null | undefined): string => {
  if (!asset) return '';
  return getAssetUrl(asset.thumb_url || asset.url);
};
