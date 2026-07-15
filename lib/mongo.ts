import mongoose from "mongoose"
import config from "./config"

// Cache koneksi global (aman untuk serverless / hot-reload).
let cached = (global as any).__mongoose
if (!cached) cached = (global as any).__mongoose = { conn: null, promise: null }

export async function connectDB() {
    if (cached.conn) return cached.conn
    if (!config.mongoUri) return null
    if (!cached.promise) {
        mongoose.set("strictQuery", true)
        cached.promise = mongoose
            .connect(config.mongoUri, { maxPoolSize: 10, serverSelectionTimeoutMS: 15000 })
            .then((m) => m)
            .catch((e) => {
                cached.promise = null
                console.error("MongoDB:", e.message)
                return null
            })
    }
    cached.conn = await cached.promise
    return cached.conn
}

export function dbReady() {
    return mongoose.connection?.readyState === 1
}
