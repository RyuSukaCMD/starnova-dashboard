import mongoose from "mongoose"
import config from "./config"

// Cache koneksi global (aman untuk serverless / hot-reload).
let cached = (global as any).__mongoose
if (!cached) cached = (global as any).__mongoose = { conn: null, promise: null }

export async function connectDB() {
    if (cached.conn && mongoose.connection.readyState === 1) return cached.conn
    if (!config.mongoUri) return null

    if (!cached.promise) {
        mongoose.set("strictQuery", true)
        cached.promise = mongoose.connect(config.mongoUri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 8000,
            connectTimeoutMS: 8000,
            socketTimeoutMS: 20000
        })
    }
    try {
        cached.conn = await cached.promise
    } catch (e) {
        // Reset agar percobaan berikutnya konek ulang, lalu lempar ke pemanggil
        // (biar /api/debug/db bisa menampilkan error asli).
        cached.promise = null
        cached.conn = null
        throw e
    }
    return cached.conn
}

export function dbReady() {
    return mongoose.connection?.readyState === 1
}
