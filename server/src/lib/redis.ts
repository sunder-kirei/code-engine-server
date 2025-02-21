import { createClient } from "redis";

export const client = createClient({
  url: process.env.REDIS_URL,
});

export const redisConnect = async () => {
  await client.connect();
};

export const redisDisconnect = async () => {
  await client.disconnect();
};
