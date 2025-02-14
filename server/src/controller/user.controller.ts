import { User } from "@prisma/client";
import { prisma } from "../lib/prisma";

export async function getUser(userId: string): Promise<{
  success: boolean;
  message: string;
  user?: Pick<User, "id" | "email">;
}> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (!user) {
    return {
      success: false,
      message: "User not found",
      user: undefined,
    };
  }

  return {
    success: true,
    message: "User found",
    user: user,
  };
}
