import { Status } from "@prisma/client";
import { kafkaConnect, kafkaConsumer } from "./kafka";
import { prismaConnect } from "./prisma";
import { Express } from "express";
import { updateStatus } from "../controller/execute.controller";

export async function startServer(app: Express) {
  await prismaConnect();
  await kafkaConnect();

  await kafkaConsumer.run({
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
    autoCommitInterval: 1000,
  });

  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
}
