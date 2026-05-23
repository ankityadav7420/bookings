import Redis from "ioredis";
import { env } from "./env";

let client: Redis | null = null;

export const getRedis = (): Redis => {
  if (!client) {
    client = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false
    });

    client.on("error", (error) => {
      console.error("[redis] connection error", error.message);
    });
  }

  return client;
};

export const connectRedis = async (): Promise<void> => {
  const redis = getRedis();
  await redis.ping();
};

export const disconnectRedis = async (): Promise<void> => {
  if (client) {
    await client.quit();
    client = null;
  }
};

export const isRedisHealthy = async (): Promise<boolean> => {
  try {
    const response = await getRedis().ping();
    return response === "PONG";
  } catch {
    return false;
  }
};
