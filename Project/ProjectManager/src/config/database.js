import mongoose from 'mongoose';

let memoryServerInstance = null;

/**
 * Connect to MongoDB database.
 * If local MongoDB is not running (ECONNREFUSED) in development,
 * automatically falls back to an embedded in-memory MongoDB instance.
 *
 * @param {string} [uri] Optional connection URI (defaults to process.env.MONGO_URI)
 */
export const connectDB = async (uri) => {
  const mongoUri = uri || process.env.MONGO_URI || 'mongodb://localhost:27017/project_management_db';

  try {
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 2500, // Quick timeout if local server is not running
    });

    console.log(`[Database] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    const isLocalhost = mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1');
    const isConnRefused =
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('connect ECONNREFUSED') ||
      error.message.includes('Server selection timed out');

    // In development mode, if local MongoDB is not running, provide seamless in-memory fallback
    if (process.env.NODE_ENV !== 'production' && isLocalhost && isConnRefused) {
      console.warn('\n[Database Notice] Local MongoDB is not running on port 27017.');
      console.log('[Database] Starting built-in in-memory MongoDB server for testing...');

      try {
        const path = await import('path');
        const fs = await import('fs');
        const devDbDir = path.default.join(process.cwd(), '.dev_mongo_data');
        if (!fs.default.existsSync(devDbDir)) {
          fs.default.mkdirSync(devDbDir, { recursive: true });
        }

        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create({
          instance: {
            dbPath: devDbDir,
            storageEngine: 'wiredTiger',
          },
        });
        const memUri = memoryServerInstance.getUri();

        const conn = await mongoose.connect(memUri, {
          autoIndex: true,
        });

        console.log(`[Database] Embedded MongoDB connected with persistent storage! (Ready for Postman)\n`);
        return conn;
      } catch (memError) {
        console.error(`[Database Error] Failed to start in-memory MongoDB: ${memError.message}`);
      }
    }

    console.error(`[Database Error] Connection failed: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

/**
 * Disconnect from MongoDB database and clean up in-memory instance if active
 */
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
    }
    console.log('[Database] MongoDB connection closed');
  } catch (error) {
    console.error(`[Database Error] Disconnection error: ${error.message}`);
  }
};

export default connectDB;
