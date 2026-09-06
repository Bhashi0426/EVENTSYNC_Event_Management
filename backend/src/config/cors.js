const env = require('./env');

const ALLOWED_ORIGINS = [
  env.CLIENT_URL && env.CLIENT_URL.replace(/\/$/, ''),
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

function isAllowedOrigin(origin) {
  if (!origin) return true;
  const normalizedOrigin = origin.replace(/\/$/, '');
  if (ALLOWED_ORIGINS.includes(normalizedOrigin)) return true;
  // Allow other common local network ranges for the dev frontend (e.g. Vite
  // running inside a VM/container may expose a private-network IP).
  if (/^https?:\/\/(10|172|192\.168)\.\d+\.\d+\.\d+:5173$/.test(normalizedOrigin)) return true;
  return false;
}

module.exports = {
  ALLOWED_ORIGINS,
  isAllowedOrigin,
};
