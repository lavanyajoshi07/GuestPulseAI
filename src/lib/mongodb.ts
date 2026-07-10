import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: MongooseConnection = {
  conn: null,
  promise: null,
};

async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  if (cached.conn) {
    console.log('[MongoDB] Using cached connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds to fallback quickly
    };

    cached.promise = mongoose
      .connect(MONGODB_URI as string, opts)
      .then((mongoose) => {
        console.log('[MongoDB] Connected successfully');
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Reset so subsequent requests can try reconnecting
    throw e;
  }

  return cached.conn;
}

export default connectDB;
