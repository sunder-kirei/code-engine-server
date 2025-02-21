import { Status } from "@prisma/client";
import { kafkaConnect, kafkaConsumer, kafkaDisconnect } from "./kafka";
import { prismaConnect, prismaDisconnect } from "./prisma";
import { Express } from "express";
import { updateStatus } from "../controller/execute.controller";
import { redisConnect } from "./redis";

export async function startServer(app: Express) {
  try {
    await prismaConnect();
    await kafkaConnect();
    await redisConnect();

    await Promise.all([
      kafkaConsumer.run({
        eachMessage: async ({ message }) => {
          const { value } = message;

          if (!value) return;
          const {
            id,
            status,
            output,
          }: { id: string; status: Status; output?: string } = JSON.parse(
            value.toString()
          );
          await updateStatus(id, status, output);
        },
      }),

      app.listen(3000, () => {
        console.log("Server is running on port 3000");
      }),
    ]);
  } catch (error) {
    console.error({ error });
    await kafkaDisconnect();
    await prismaDisconnect();
    process.exit(1);
  }
}
