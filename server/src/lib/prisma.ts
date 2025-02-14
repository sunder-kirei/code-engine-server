import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const prismaConnect = async () => {
  await prisma.$connect();
};

export const prismaDisconnect = async () => {
  await prisma.$disconnect();
};
