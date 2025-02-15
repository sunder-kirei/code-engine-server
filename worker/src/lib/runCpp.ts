import { exec, execSync } from "child_process";
import { writeFileSync } from "fs";
import path from "path";
import { Message } from "../types/Message";
import { Status } from "../types/Status";
import { kafkaProducer } from "./kafka";

export async function runCpp({ code, id, language }: Message) {
  try {
    // Compiling code start
    await kafkaProducer.send({
      topic: "execute-status-updates",
      messages: [
        {
          key: id,
          value: JSON.stringify({
            id,
            status: Status.COMPILING,
            output: "Compiling code...",
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
                status: Status.COMPILATION_ERROR,
                output: error.message,
              }),
            },
          ],
        });
        return;
      }

      const boxPath = path.join(stdout.trim(), "box");
      writeFileSync(path.join(boxPath, "main.cpp"), code);

      exec(
        `isolate --processes --full-env --run /usr/bin/g++ -- main.cpp -o a.out`,
        async (error, stdout, stderr) => {
          if (error) {
            console.log(`error: ${error.message}`);
            await kafkaProducer.send({
              topic: "execute-status-updates",
              messages: [
                {
                  key: id,
                  value: JSON.stringify({
                    id,
                    status: Status.COMPILATION_ERROR,
                    output: error.message,
                  }),
                },
              ],
            });
            return;
          }
          await kafkaProducer.send({
            topic: "execute-status-updates",
            messages: [
              {
                key: id,
                value: JSON.stringify({
                  id,
                  status: Status.RUNNING,
                  output: "Running code...",
                }),
              },
            ],
          });

          exec(`isolate --run a.out`, async (error, stdout, stderr) => {
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
              return;
            }

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
          });
        }
      );
    });
  } catch (error) {
    console.log(error);
  }
}
