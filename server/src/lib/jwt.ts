import { User } from "@prisma/client";
import jwt from "jsonwebtoken";

export function generateJWT(user: User) {
  const token = jwt.sign(
    { userId: user.id, email: user.email, timestamp: Date.now() },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  return {
    token,
  };
}

export function verifyJWT(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      userId: string;
      email: string;
      timestamp: number;
    };

    return {
      success: true,
      message: "Token verified successfully",
      userId: decoded.userId,
      email: decoded.email,
      timestamp: decoded.timestamp,
    };
  } catch (error) {
    return {
      success: false,
      message: "Invalid token",
      userId: undefined,
      email: undefined,
      timestamp: undefined,
    };
  }
}
