import { Language, Status, User } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { kafkaProducer } from "../lib/kafka";

export async function execute(
  code: string,
  language: Language,
  user: Pick<User, "id" | "email">
) {
  try {
    const {
      id,
      createdAt,
      output,
      updatedAt,
      status,
      code: uplaodedCode,
    } = await prisma.executionRequest.create({
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
      executeRequest: {
        id,
        createdAt,
        status,
        output,
        updatedAt,
        code: uplaodedCode,
      },
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

export async function getStatus(id: string, userId: string) {
  const executeRequest = await prisma.executionRequest.findUnique({
    where: { id, userId },
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

export async function getExecutionRequests(
  userId: string,
  page: number = 1,
  limit: number = 10
) {
  page = page - 1;

  const executionRequests = await prisma.executionRequest.findMany({
    where: { userId },
    select: {
      id: true,
      createdAt: true,
      status: true,
      output: true,
      updatedAt: true,
      code: true,
    },
    take: limit,
    skip: page * limit,
  });

  if (!executionRequests) {
    return {
      success: false,
      message: "No execution requests found",
      executionRequests: undefined,
    };
  }

  return {
    success: true,
    message: "Execution requests found",
    executionRequests,
  };
}

export async function deleteExecuteRequest(id: string, userId: string) {
  try {
    await prisma.executionRequest.delete({
      where: { id, userId },
    });

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
    };
  }
}
