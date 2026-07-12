// Central API base URL — controlled via environment variable.
// In Docker: VITE_API_BASE_URL is injected at build time via docker-compose.
// In local dev: falls back to http://localhost:5000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default API_BASE_URL;
