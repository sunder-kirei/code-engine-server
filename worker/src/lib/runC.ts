import { exec, execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { Message } from "../types/Message";
import { Status } from "../types/Status";
import { kafkaProducer } from "./kafka";

export async function runC({ code, id, language }: Message) {
  const promise: Promise<boolean> = new Promise(async (resolve, reject) => {
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
        resolve(false);
      }

      const boxPath = path.join(stdout.trim(), "box");
      writeFileSync(path.join(boxPath, "main.c"), code);

      exec(
        `isolate --processes --full-env --stderr=stderr.txt --run /usr/bin/gcc -- main.c -o a.out`,
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
                    status: Status.COMPILATION_ERROR,
                    output: stderr,
                  }),
                },
              ],
            });
            resolve(false);
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

          exec(
            `isolate --stderr=stderr.txt --stdout=stdout.txt --run a.out`,
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
                resolve(false);
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
              resolve(true);
            }
          );
        }
      );
    });
  });

  return promise;
}
