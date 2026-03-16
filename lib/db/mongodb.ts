/**
 * Connexion MongoDB Atlas (cache pour Next.js serverless).
 */

import mongoose from 'mongoose';

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'Définis MONGODB_URI dans .env.local (ex: mongodb+srv://user:pass@cluster.mongodb.net/karufoods)'
    );
  }
  return uri;
}

type MongooseConnection = typeof mongoose;

type Cache = { conn: MongooseConnection | null; promise: Promise<MongooseConnection> | null };

declare global {
  // eslint-disable-next-line no-var
  var _mongoCache: Cache | undefined;
}

function getCache(): Cache {
  if (!global._mongoCache) {
    global._mongoCache = { conn: null, promise: null };
  }
  return global._mongoCache;
}

export async function connectDB(): Promise<MongooseConnection> {
  const cached = getCache();
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(getMongoUri());
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
