const mongoose = require('mongoose');

const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 5000;

let isConnected = false;

/**
 * Connect to MongoDB with automated retry logic
 * @param {number} retryCount Current retry attempt count
 */
const connectDB = async (retryCount = 0) => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('[Database Error] FATAL: MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: process.env.NODE_ENV !== 'production',
    });

    isConnected = true;
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
  } catch (error) {
    isConnected = false;
    const currentAttempt = retryCount + 1;
    console.error(`[Database Error] Connection attempt ${currentAttempt}/${MAX_RETRIES} failed: ${error.message}`);

    if (currentAttempt < MAX_RETRIES) {
      console.log(`[Database] Retrying connection in ${RETRY_INTERVAL_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
      return connectDB(currentAttempt);
    } else {
      console.error('[Database Error] Maximum retry attempts reached. Exiting application...');
      process.exit(1);
    }
  }
};

// Event Listeners for MongoDB Connection Lifecycle
mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('[Database Event] Connection established to MongoDB.');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error(`[Database Event] MongoDB connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[Database Event] MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('[Database Event] MongoDB reconnected.');
});

/**
 * Graceful shutdown for MongoDB connection
 * @param {string} signal System termination signal
 */
const closeDB = async (signal = 'SIGTERM') => {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.close();
      isConnected = false;
      console.log(`[Database] MongoDB connection closed due to app termination (${signal}).`);
    } catch (err) {
      console.error(`[Database Error] Error closing MongoDB connection: ${err.message}`);
    }
  }
};

module.exports = {
  connectDB,
  closeDB,
  isConnected: () => isConnected,
};
