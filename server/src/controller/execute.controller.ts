import { Language, Status, User } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { kafkaProducer } from "../lib/kafka";

export async function execute(
  code: string,
  language: Language,
  user: Pick<User, "id" | "email">
) {
  try {
    const { id, createdAt, status } = await prisma.executionRequest.create({
      data: {
        userId: user.id,
        code: {
          code: code,
          language: language,
        },
      },
    });

    await kafkaProducer.send({
      topic: "execute-requests",
      messages: [
        {
          key: id,
          value: JSON.stringify({
            id,
            code,
            language,
          }),
        },
      ],
    });

    return {
      success: true,
      message: "Execute request created successfully",
      executeRequest: { id, createdAt, status },
    };
  } catch (error) {
    return {
      success: false,
      message: "Error creating execute request",
      executeRequest: undefined,
    };
  }
}

export async function updateStatus(
  id: string,
  status: Status,
  output?: string
) {
  try {
    await prisma.executionRequest.update({
      where: { id },
      data: { status, output },
    });

    return {
      success: true,
      message: "Execute request status updated",
      executeRequest: { id, status },
    };
  } catch (error) {
    return {
      success: false,
      message: "Error updating execute request status",
      executeRequest: undefined,
    };
  }
}

export async function getStatus(id: string) {
  const executeRequest = await prisma.executionRequest.findUnique({
    where: { id },
    select: {
      id: true,
      createdAt: true,
      status: true,
      output: true,
      updatedAt: true,
      code: true,
    },
  });

  if (!executeRequest) {
    return {
      success: false,
      message: "Execute request not found",
      executeRequest: undefined,
    };
  }

  return {
    success: true,
    message: "Execute request found",
    executeRequest,
  };
}
