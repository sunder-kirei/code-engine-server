import { ErrorRequestHandler, Router } from "express";
import { signUpSchema, loginSchema, executeSchema } from "./schema/zod";
import { login, signUp } from "./controller/auth.controller";
import { generateJWT, verifyJWT } from "./lib/jwt";
import { getUser } from "./controller/user.controller";
import { extractToken } from "./lib/extractToken";
import { execute, getStatus } from "./controller/execute.controller";

export const routes = Router();

routes.post("/signup", async (req, res) => {
  try {
    const { email, password } = signUpSchema.parse(req.body);
    const { message, success, user } = await signUp(email, password);
    if (!success) {
      res.status(400).json({ message });
      return;
    }

    const { token } = generateJWT(user!);
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
      })
      .json({ message, success, token });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

routes.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const { message, success, user } = await login(email, password);
    if (!success) {
      res.status(400).json({ message });
      return;
    }

    const { token } = generateJWT(user!);
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
      })
      .json({ message, success, token });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

routes.get("/user", async (req, res) => {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { success, message, userId } = verifyJWT(token);
  if (!success) {
    res.status(401).json({ message });
    return;
  }

  const {
    message: userMessage,
    success: userSuccess,
    user,
  } = await getUser(userId!);

  if (!userSuccess) {
    res.status(401).json({ message: userMessage });
    return;
  }

  res.json({ message, success, user });
});

routes.post("/execute", async (req, res) => {
  try {
    const { code, language } = executeSchema.parse(req.body);

    const token = extractToken(req);
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { success, message, userId } = verifyJWT(token);
    if (!success) {
      res.status(401).json({ message });
      return;
    }

    const {
      message: userMessage,
      success: userSuccess,
      user,
    } = await getUser(userId!);

    if (!userSuccess) {
      res.status(401).json({ message: userMessage });
      return;
    }

    const {
      executeRequest: executeStatus,
      message: executeMessage,
      success: executeSuccess,
    } = await execute(code, language, user!);

    if (!executeSuccess) {
      res.status(400).json({ message: executeMessage });
      return;
    }

    res.json({
      message: executeMessage,
      success: executeSuccess,
      executeStatus,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

routes.get("/execute/:id", async (req, res) => {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { success, message, userId } = verifyJWT(token);
  if (!success) {
    res.status(401).json({ message });
    return;
  }

  const {
    message: userMessage,
    success: userSuccess,
    user,
  } = await getUser(userId!);

  if (!userSuccess) {
    res.status(401).json({ message: userMessage });
    return;
  }

  const { id } = req.params;
  const {
    message: statusMessage,
    success: statusSuccess,
    executeRequest: executeStatus,
  } = await getStatus(id);

  if (!statusSuccess) {
    res.status(400).json({ message: statusMessage });
    return;
  }

  res.json({ message, success, executeStatus });
});

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
};

routes.use(errorHandler);
