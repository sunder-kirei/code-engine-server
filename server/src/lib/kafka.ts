import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "code-engine-server",
  brokers: ["kafka:29092"],
});

export const kafkaProducer = kafka.producer();

export const kafkaConsumer = kafka.consumer({
  groupId: "code-engine-server",
});

export const kafkaConnect = async () => {
  const admin = kafka.admin();
  await admin.connect();
  await admin.createTopics({
    topics: [
      {
        topic: "execute-status-updates",
        numPartitions: 1,
        replicationFactor: 1,
      },
      {
        topic: "execute-requests",
        numPartitions: 1,
        replicationFactor: 1,
      },
    ],
  });
  await admin.disconnect();

  await kafkaProducer.connect();
  await kafkaConsumer.connect();

  await kafkaConsumer.subscribe({
    topic: "execute-status-updates",
  });
};

export const kafkaDisconnect = async () => {
  await kafkaProducer.disconnect();
  await kafkaConsumer.disconnect();
};
