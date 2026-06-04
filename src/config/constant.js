// Default to the same-origin `/api` path so both the Vite dev proxy and
// the Vercel rewrite can forward requests to the upstream API without CORS.
export const API_URL = import.meta.env.VITE_API_URL || '/api';
export const CALL_AGENT_URL = import.meta.env.VITE_CALL_AGENT_URL || '/call-agent';
// export const API_URL = "https://zubitechnologies.com/ads_apis/api"
