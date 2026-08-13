const mongoose = require('mongoose');
const dns = require('dns');
const env = require('./env');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB. Supports both a local MongoDB instance and MongoDB Atlas
 * via the MONGO_URI environment variable.
 */
async function connectDB(uri = env.MONGO_URI) {
  mongoose.set('strictQuery', true);
  // If using an Atlas SRV connection string, Node's DNS resolver may fail
  // in some environments (VPNs, custom DNS). Force public DNS servers
  // for SRV lookups so `dns.resolveSrv` (used by the driver) succeeds.
  if (typeof uri === 'string' && uri.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      logger.info('Set DNS servers to 8.8.8.8 and 1.1.1.1 for SRV lookup');
    } catch (err) {
      logger.warn('Failed to set DNS servers for SRV lookup', err);
    }
  }
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}

module.exports = { connectDB, disconnectDB };
