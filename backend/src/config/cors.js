const env = require('./env');

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://eventsync-event-management.vercel.app'
];

if (env && env.CLIENT_URL) {
  const cleanUrl = String(env.CLIENT_URL).trim().replace(/\/$/, '');
  if (cleanUrl && !ALLOWED_ORIGINS.includes(cleanUrl)) {
    ALLOWED_ORIGINS.push(cleanUrl);
  }
}

function isAllowedOrigin(origin) {
  // Allow requests with no origin (like Postman, mobile apps, curl)
  if (!origin) return true;
  
  const normalizedOrigin = String(origin).trim().replace(/\/$/, '');
  
  if (ALLOWED_ORIGINS.includes(normalizedOrigin)) {
    return true;
  }

  // Allow local network IPs
  if (/^https?:\/\/(10|172|192|\.168)\.\d+\.\d+:\d+$/.test(normalizedOrigin)) {
    return true;
  }

  return false;
}

module.exports = {
  ALLOWED_ORIGINS,
  isAllowedOrigin,
};