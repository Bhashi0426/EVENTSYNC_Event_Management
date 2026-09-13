const env = require('./env');

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://eventsync-event-management.vercel.app',
];

// Add CLIENT_URL only if it is defined in environment variables
if (env.CLIENT_URL) {
  const cleanUrl = env.CLIENT_URL.replace(/\/$/, '');
  if (!ALLOWED_ORIGINS.includes(cleanUrl)) {
    ALLOWED_ORIGINS.push(cleanUrl);
  }
}

function isAllowedOrigin(origin) {
  // Allow requests with no origin (like Postman, mobile apps, or curl requests)
  if (!origin) return true;
  
  const normalizedOrigin = origin.replace(/\/$/, '');
  if (ALLOWED_ORIGINS.includes(normalizedOrigin)) return true;

  // Allow other common local network ranges for dev frontend (e.g. Vite running inside a VM/container)
  if (/^https?:\/\/(10|172|192|\.168)\.\d+\.\d+:\d+$/.test(normalizedOrigin)) {
    return true;
  }

  return false;
}

module.exports = {
  ALLOWED_ORIGINS,
  isAllowedOrigin,
};
