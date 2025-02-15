import { number } from "zod";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      KAFKA_CLIENT_ID: string;
      KAFKA_BROKERS: string;
    }
  }
}
