const env = require('./env');
//running inside a VM
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://eventsync-event-management.vercel.app',
  'https://eventsync-event-management-jhhubelnb-bmr10.vercel.app'
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

  // Allow preview deployments for this Vercel project only.
  if (/^https:\/\/eventsync-event-management(?:-[a-z0-9-]+)?\.vercel\.app$/.test(normalizedOrigin)) {
    return true;
  }

  // Allow local network IPs (e.g. http://192.168.1.15:5173 when testing from another device on the LAN)
  if (/^https?:\/\/(?:10\.\d+\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+)(?::\d+)?$/.test(normalizedOrigin)) {
    return true;
  }

  return false;
}

module.exports = {
  ALLOWED_ORIGINS,
  isAllowedOrigin,
};