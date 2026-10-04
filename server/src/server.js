const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = require('./app');
const { connectDB, closeDB } = require('./config/db');

// Read configuration from environment
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Handle Uncaught Exceptions (synchronous errors)
process.on('uncaughtException', (err) => {
  console.error('[Process] UNCAUGHT EXCEPTION! Shutting down immediately...', err);
  process.exit(1);
});

let server;

// Start Server & Connect to Database
const startServer = async () => {
  try {
    // 1. Establish MongoDB connection
    await connectDB();

    // 2. Start HTTP Server
    server = app.listen(PORT, () => {
      console.log(`[Server] Store & Equipment Management API running in ${NODE_ENV} mode on port ${PORT}`);
      console.log(`[Server] Health check endpoint: http://localhost:${PORT}/api/v1/health`);
    });
  } catch (error) {
    console.error('[Server Error] Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

// Handle Unhandled Promise Rejections (asynchronous errors)
process.on('unhandledRejection', (err) => {
  console.error('[Process] UNHANDLED REJECTION! Shutting down gracefully...', err);
  if (server) {
    server.close(() => {
      closeDB().finally(() => process.exit(1));
    });
  } else {
    process.exit(1);
  }
});

// Graceful Shutdown on Termination Signals
const handleShutdown = async (signal) => {
  console.log(`\n[Process] ${signal} signal received: initiating graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      await closeDB(signal);
      console.log('[Process] Graceful shutdown completed.');
      process.exit(0);
    });
  } else {
    await closeDB(signal);
    process.exit(0);
  }

  // Force close process after 10 seconds if shutdown hangs
  setTimeout(() => {
    console.error('[Process] Shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
