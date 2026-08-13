const dotenv = require('dotenv');

dotenv.config();

const env = {
  PORT: process.env.PORT || 5050,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/eventsync',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_insecure_secret_change_me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DEMO_PASSWORD: process.env.DEMO_PASSWORD || 'Password123!',
};

module.exports = env;
