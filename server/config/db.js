import mongoose from 'mongoose';

/**
 * MongoDB Connection Module
 * Connects to MongoDB using process.env.MONGODB_URI.
 * Supports both persistent Node.js servers and serverless environments (e.g. Vercel).
 */

let cachedPromise = null;

// Disable Mongoose command buffering so queries don't hang if disconnected
mongoose.set('bufferCommands', false);

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return true;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    if (process.env.VERCEL) {
      console.warn('⚠️ MONGODB_URI is not configured in Vercel environment variables. Using in-memory fallback store.');
      return false;
    }
    // Local development fallback
    const localUri = 'mongodb://127.0.0.1:27017/kisanguard';
    try {
      mongoose.set('strictQuery', true);
      await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 2000,
        autoIndex: true
      });
      console.log(`🍃 Local MongoDB Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
      return true;
    } catch (e) {
      console.warn('⚠️ Local MongoDB not running. Using in-memory fallback store.');
      return false;
    }
  }

  if (!cachedPromise) {
    mongoose.set('strictQuery', true);
    cachedPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
      autoIndex: true
    }).then(() => {
      console.log(`🍃 MongoDB Atlas Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
      return true;
    }).catch(error => {
      cachedPromise = null;
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
      return false;
    });
  }

  return cachedPromise;
}

export default connectDB;
