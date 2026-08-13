/* Minimal logger wrapper. Keeps logging consistent and easy to swap later. */
const env = require('../config/env');

const isTest = env.NODE_ENV === 'test';

function timestamp() {
  return new Date().toISOString();
}

const logger = {
  info: (...args) => {
    if (!isTest) console.log(`[INFO]  ${timestamp()}`, ...args);
  },
  warn: (...args) => {
    if (!isTest) console.warn(`[WARN]  ${timestamp()}`, ...args);
  },
  error: (...args) => {
    if (!isTest) console.error(`[ERROR] ${timestamp()}`, ...args);
  },
};

module.exports = logger;
