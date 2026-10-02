import mongoose from 'mongoose';

/**
 * MongoDB Connection Module
 * Connects to MongoDB using process.env.MONGODB_URI.
 * In local development without MongoDB URI, uses fallback to local MongoDB instance.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kisanguard';
  
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });
    console.log(`🍃 MongoDB Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️ MONGODB_URI is not set. Please set MONGODB_URI in your .env file or hosting dashboard.');
    }
    return false;
  }
}

export default connectDB;
