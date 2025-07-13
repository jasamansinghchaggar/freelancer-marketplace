export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  API_TIMEOUT: 10000,

  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL,

  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
};
