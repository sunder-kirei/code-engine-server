import { Request } from "express";
import { prisma } from "./prisma";

export async function extractApiKey(req: Request) {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || typeof apiKey !== "string") {
    return undefined;
  }

  const foundUser = await prisma.user.findUnique({
    where: {
      apiKey: apiKey,
    },
  });

  if (!foundUser) {
    return undefined;
  }

  return foundUser;
}
