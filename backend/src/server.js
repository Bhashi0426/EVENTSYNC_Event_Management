const http = require('http');
const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const { connectDB } = require('./config/database');
const { initSocket } = require('./sockets/socketHandler');

async function start() {
  try {
    await connectDB();

    const server = http.createServer(app);
    initSocket(server, env.CLIENT_URL);

    server.listen(env.PORT, () => {
      logger.info(`EventSync API running on port ${env.PORT} (${env.NODE_ENV})`);
      logger.info(`Socket.io ready. CORS origin: ${env.CLIENT_URL}`);
    });

    const shutdown = (signal) => {
      logger.info(`${signal} received. Shutting down...`);
      server.close(() => process.exit(0));
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    logger.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
