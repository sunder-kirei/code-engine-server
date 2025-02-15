import { User } from "@prisma/client";
import { prisma } from "../lib/prisma";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

function generateSalt() {
  return crypto.randomBytes(16).toString("hex");
}

async function hashPassword(password: string, salt: string) {
  const hashedPassword = crypto
    .pbkdf2Sync(
      password,
      salt,
      Number.parseInt(process.env.CRYPTO_ITERATIONS),
      Number.parseInt(process.env.CRYPTO_KEYLEN),
      "sha512"
    )
    .toString("hex");
  return hashedPassword;
}

export async function signUp(
  email: string,
  password: string
): Promise<{
  success: boolean;
  message: string;
  user?: User;
}> {
  const foundUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (foundUser) {
    return {
      success: false,
      message: "User already exists",
      user: undefined,
    };
  }

  const salt = generateSalt();
  const hashedPassword = await hashPassword(password, salt);

  const newUser = await prisma.user.create({
    data: {
      email: email,
      hashedPassword: hashedPassword,
      salt: salt,
      apiKey: uuidv4(),
    },
  });

  return {
    success: true,
    message: "User created successfully",
    user: newUser,
  };
}

export async function login(email: string, password: string) {
  const foundUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!foundUser) {
    return {
      success: false,
      message: "User not found",
      user: undefined,
    };
  }

  const hashedPassword = foundUser.hashedPassword;
  const salt = foundUser.salt;

  const isPasswordCorrect =
    (await hashPassword(password, salt)) === hashedPassword;

  if (!isPasswordCorrect) {
    return {
      success: false,
      message: "Incorrect password",
      user: undefined,
    };
  }

  return {
    success: true,
    message: "Login successful",
    user: foundUser,
  };
}
