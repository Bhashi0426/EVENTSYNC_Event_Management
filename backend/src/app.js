const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const { isAllowedOrigin } = require('./config/cors');
const { sendSuccess } = require('./utils/response');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const rsvpRoutes = require('./routes/rsvpRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

// Security & parsing

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin or allowed origins without throwing errors
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        // Return false instead of throwing a new Error object
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Explicitly handle preflight requests
app.options('*', cors());

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (env.NODE_ENV !== 'development') {
  app.use(morgan('dev'));
  }
// Global, lenient rate limit (auth routes add a stricter one)
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.NODE_ENV === 'test' ? 100000 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Health check
app.get('/api/health', (req, res) => sendSuccess(res, 200, { status: 'ok', uptime: process.uptime() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/me', rsvpRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stats', statsRoutes);

// Root route check
app.get('/', (req, res) => {
  sendSuccess(res, { status: 'healthy', timestamp: new Date() }, 'EventSync API is running');
});

// 404 + error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
