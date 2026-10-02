import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import { connectDB, disconnectDB } from './src/config/database.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(` Project Management REST API Server Running`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Port:        ${PORT}`);
      console.log(` Base URL:    http://localhost:${PORT}/api`);
      console.log(`=================================================`);
    });

    // Graceful Shutdown
    const handleShutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log('[Server] HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });

      // Force exit if shutdown hangs
      setTimeout(() => {
        console.error('[Server] Forcefully terminating process after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    console.error(`[Server Error] Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
