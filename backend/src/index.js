require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');
const prisma = require('./config/prisma');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate Limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 mins
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors());
app.use(express.json());

// Application Routes
app.use('/api/users', authLimiter, userRoutes);

// Root / Healthcheck endpoint
app.get('/health', async (req, res) => {
  try {
    // Basic DB check
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      success: true,
      status: 'OK',
      database: 'Connected',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 'Degraded',
      database: 'Disconnected',
      error: error.message,
    });
  }
});

// Global Error Handler (must be registered last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`[AssetFlow Server] Running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server process terminated.');
    process.exit(0);
  });
});
