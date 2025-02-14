import {
  kafkaConnect,
  kafkaConsumer,
  kafkaDisconnect,
  kafkaProducer,
} from "./lib/kafka";
import { runCpp } from "./lib/runCpp";
import { Language } from "./types/Language";
import { Status } from "./types/Status";

export async function startWorker() {
  await kafkaConnect();

  await kafkaConsumer.run({
    eachMessage: async ({ message }) => {
      const { value } = message;
      if (!value) return;
      const {
        id,
        code,
        language,
      }: { id: string; code: string; language: Language } = JSON.parse(
        value.toString()
      );

      await kafkaProducer.send({
        topic: "execute-status-updates",
        messages: [
          {
            key: id,
            value: JSON.stringify({
              id,
              status: Status.COMPILING,
            }),
          },
        ],
      });
      await runCpp({ code, id, language });
    },
  });
}

try {
  startWorker();
} catch (error) {
  process.exit(1);
} finally {
  kafkaDisconnect();
}

process.on("SIGINT", async () => {
  await kafkaDisconnect();
  process.exit(0);
});
