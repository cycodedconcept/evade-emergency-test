const PROD_API_URL = 'https://evade-api.watchouttech.xyz/api';

// Use the Vite dev proxy locally to avoid browser CORS errors.
export const API_URL = import.meta.env.DEV ? '/api' : PROD_API_URL;
