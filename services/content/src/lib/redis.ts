import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env.local" });

export const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redis.on("error", (err) => console.log("Redis Client Error", err));

let isConnected = false;

export async function connectRedis() {
  if (!isConnected) {
    try {
        await redis.connect();
        isConnected = true;
    } catch(e) {
        console.error("Redis connection failed. Running without cache.", e);
    }
  }
}
