import { number } from "zod";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      DATABASE_URL: string;
      CRYPTO_ITERATIONS: string;
      CRYPTO_KEYLEN: string;
      JWT_SECRET: string;
      KAFKA_CLIENT_ID: string;
      KAFKA_BROKERS: string;
      REDIS_URL: string;
    }
  }
}
