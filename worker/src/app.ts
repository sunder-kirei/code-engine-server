import { kafkaConnect, kafkaConsumer, kafkaDisconnect } from "./lib/kafka";
import { runC } from "./lib/runC";
import { runCpp } from "./lib/runCpp";
import { runJs } from "./lib/runJs";
import { runPy } from "./lib/runPy";
import { Language } from "./types/Language";
import { config } from "dotenv";

config();

export async function startWorker() {
  try {
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

        switch (language) {
          case Language.CPP:
            await runCpp({ code, id, language });
            break;
          case Language.C:
            await runC({ code, id, language });
            break;
          case Language.PYTHON:
            await runPy({ code, id, language });
            break;
          case Language.JAVASCRIPT:
            await runJs({ code, id, language });
            break;
        }
      },
      autoCommitInterval: 1000,
    });
  } catch (error) {
    console.log(error);
    await kafkaDisconnect();
    process.exit(1);
  }
}

startWorker();

process.on("SIGINT", async () => {
  await kafkaDisconnect();
  process.exit(0);
});
