const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/subscriptiq';

  try {
    // Attempt connecting to the configured MongoDB URI
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500 // Fail fast if local mongod is not up
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`[Database] Standard MongoDB connection failed (${err.message}).`);
    
    // Check if MongoMemoryServer can be spun up as an automatic fallback for dev/demo
    try {
      console.log('[Database] Initializing in-memory MongoDB fallback for local development...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[Database] In-memory MongoDB Connected successfully: ${memUri}`);
      return conn;
    } catch (memErr) {
      console.error(`[Database] Error connecting to MongoDB: ${err.message}`);
      console.error(`[Database] In-memory fallback also failed: ${memErr.message}`);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
  } catch (err) {
    console.error(`[Database] Error disconnecting: ${err.message}`);
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
