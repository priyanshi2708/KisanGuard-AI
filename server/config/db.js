import mongoose from 'mongoose';

/**
 * MongoDB Connection Module
 * Connects to MongoDB using process.env.MONGODB_URI.
 * Supports both persistent Node.js servers and serverless environments (e.g. Vercel).
 */

let cachedPromise = null;

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return true;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kisanguard';

  if (!cachedPromise) {
    mongoose.set('strictQuery', true);
    cachedPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    }).then(() => {
      console.log(`🍃 MongoDB Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
      return true;
    }).catch(error => {
      cachedPromise = null;
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
      if (!process.env.MONGODB_URI) {
        console.warn('⚠️ MONGODB_URI is not set. Please set MONGODB_URI in your .env file or Vercel Environment Variables.');
      }
      return false;
    });
  }

  return cachedPromise;
}

export default connectDB;
