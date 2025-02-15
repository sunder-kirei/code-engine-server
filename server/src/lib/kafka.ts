import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: [process.env.KAFKA_BROKERS],
  retry: {
    retries: 100,
  },
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
      },
      {
        topic: "execute-requests",
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
