const backendUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');

if (!backendUrl) {
    console.error(
        'VITE_BACKEND_URL is not set. Add it to your .env file (see .env.example).'
    );
}

export const BACKEND_URL = backendUrl;
export const API_BASE_URL = backendUrl ? `${backendUrl}/api` : '';

/** Resolve a backend media path to a full URL. */
export function getMediaUrl(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (!backendUrl) return path;

    if (path.startsWith('/')) return `${backendUrl}${path}`;
    return `${backendUrl}/media/${path}`;
}
