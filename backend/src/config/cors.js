const env = require('./env');

const ALLOWED_ORIGINS = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (/^https?:\/\/172\.28\.0\.\d+:5173$/.test(origin)) return true;
  // Allow other common local network ranges for the dev frontend (e.g. Vite
  // running inside a VM/container may expose a 172.* or 192.168.* IP).
  if (/^https?:\/\/172\.\d+\.\d+\.\d+:5173$/.test(origin)) return true;
  if (/^https?:\/\/192\.168\.\d+\.\d+:5173$/.test(origin)) return true;
  return false;
}

module.exports = {
  ALLOWED_ORIGINS,
  isAllowedOrigin,
};
