import { exec } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { Message } from "../types/Message";
import { Status } from "../types/Status";
import { kafkaProducer } from "./kafka";

export async function runPy({ code, id, language }: Message) {
  const promise: Promise<boolean> = new Promise(async (resolve, reject) => {
    // Compiling code start
    await kafkaProducer.send({
      topic: "execute-status-updates",
      messages: [
        {
          key: id,
          value: JSON.stringify({
            id,
            status: Status.RUNNING,
            output: "Code does not need compilation...",
          }),
        },
      ],
    });

    exec(`isolate --init`, async (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        await kafkaProducer.send({
          topic: "execute-status-updates",
          messages: [
            {
              key: id,
              value: JSON.stringify({
                id,
                status: Status.RUNTIME_ERROR,
                output: error.message,
              }),
            },
          ],
        });
        return resolve(false);
      }

      const boxPath = path.join(stdout.trim(), "box");
      writeFileSync(path.join(boxPath, "main.py"), code);

      exec(
        `isolate --stderr=stderr.txt --stdout=stdout.txt --run /usr/bin/python3 main.py`,
        async (error) => {
          if (error) {
            const stderr = readFileSync(
              path.join(boxPath, "stderr.txt")
            ).toString();

            await kafkaProducer.send({
              topic: "execute-status-updates",
              messages: [
                {
                  key: id,
                  value: JSON.stringify({
                    id,
                    status: Status.RUNTIME_ERROR,
                    output: stderr,
                  }),
                },
              ],
            });
            return resolve(false);
          }

          const stdout = readFileSync(
            path.join(boxPath, "stdout.txt")
          ).toString();

          await kafkaProducer.send({
            topic: "execute-status-updates",
            messages: [
              {
                key: id,
                value: JSON.stringify({
                  id,
                  status: Status.SUCCESS,
                  output: stdout,
                }),
              },
            ],
          });
          return resolve(true);
        }
      );
    });
  });

  return promise;
}
