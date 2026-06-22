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
  const isMock = !MONGODB_URI || MONGODB_URI.includes('YOUR_USERNAME') || MONGODB_URI.includes('cluster-name');
  if (isMock) {
    console.log('[MongoDB] Running in Mock In-Memory Database Mode');
    return null;
  }

  if (cached.conn) {
    console.log('[MongoDB] Using cached connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI as string, opts)
      .then((mongoose) => {
        console.log('[MongoDB] Connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('[MongoDB] Connection failed:', error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
