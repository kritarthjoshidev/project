const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('⚡ Using existing MongoDB connection');
    return;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      '❌ MONGODB_URI is not set in .env\n' +
      '   Get a free URI from: https://www.mongodb.com/atlas\n' +
      '   Then add it to backend/.env as:\n' +
      '   MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/taskmanager?retryWrites=true&w=majority'
    );
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,  // fail fast if Atlas unreachable
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

    // ─── Connection event listeners ───────────────────────────────────────
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected — will auto-reconnect');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
      isConnected = true;
    });

  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    throw err;
  }
};

module.exports = connectDB;
