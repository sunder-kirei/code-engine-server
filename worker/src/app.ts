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

      await runCpp({ code, id, language });
    },
    autoCommitInterval: 1000,
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
