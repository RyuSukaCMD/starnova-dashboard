import mongoose, { Schema } from "mongoose"

const M = mongoose.models
const model = (name: string, schema: Schema) => M[name] || mongoose.model(name, schema)

// USERS
const userSchema = new Schema(
    {
        name: String,
        email: { type: String, required: true, unique: true, lowercase: true, index: true },
        image: String,
        password: { type: String, default: "" },
        provider: { type: String, default: "google" },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        plan: { type: String, default: "free" },
        banned: { type: Boolean, default: false }
    },
    { timestamps: true }
)
export const User = model("User", userSchema)

// PLANS
const planSchema = new Schema(
    {
        id: { type: String, unique: true, index: true },
        name: String,
        price: { type: Number, default: 0 },
        dailyLimit: { type: Number, default: 100 },
        monthlyLimit: { type: Number, default: 1000 },
        rateLimitPerMin: { type: Number, default: 20 },
        features: [String],
        support: String,
        order: Number
    },
    { timestamps: true }
)
export const Plan = model("Plan", planSchema)

// API KEYS
const apiKeySchema = new Schema(
    {
        key: { type: String, unique: true, index: true },
        name: { type: String, default: "Default Key" },
        user: { type: Schema.Types.ObjectId, ref: "User", index: true },
        plan: { type: String, default: "free" },
        status: { type: String, enum: ["active", "disabled"], default: "active" },
        dailyLimit: { type: Number, default: 100 },
        monthlyLimit: { type: Number, default: 1000 },
        rateLimitPerMin: { type: Number, default: 20 },
        usageDaily: { type: Number, default: 0 },
        usageMonthly: { type: Number, default: 0 },
        usageTotal: { type: Number, default: 0 },
        usageDayStamp: String,
        usageMonthStamp: String,
        whitelistIp: { type: [String], default: [] },
        expiredAt: { type: Date, default: null },
        lastUsed: { type: Date, default: null },
        lastIp: String
    },
    { timestamps: true }
)
export const ApiKey = model("ApiKey", apiKeySchema)

// REQUEST LOGS
const logSchema = new Schema({
    apiKey: { type: String, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    endpoint: { type: String, index: true },
    method: String,
    status: Number,
    responseTime: Number,
    ip: String,
    country: String,
    userAgent: String,
    at: { type: Date, default: Date.now }
})
logSchema.index({ at: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 })
export const RequestLog = model("RequestLog", logSchema)

// SETTINGS (singleton)
const settingsSchema = new Schema(
    {
        key: { type: String, default: "global", unique: true },
        maintenance: { type: Boolean, default: false },
        announcement: { type: String, default: "" },
        totalRequestCounter: { type: Number, default: 0 }
    },
    { timestamps: true }
)
export const Settings = model("Settings", settingsSchema)
