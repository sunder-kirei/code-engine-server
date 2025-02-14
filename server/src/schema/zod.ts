import { z } from "zod";

export const signUpSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Invalid email"),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(8, { message: "Password must be at least 8 characters" }),
});

export const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Invalid email"),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(8, { message: "Password must be at least 8 characters" }),
});

export const executeSchema = z.object({
  code: z
    .string({
      required_error: "Code is required",
    })
    .min(1, { message: "Code must be at least 1 character" }),
  language: z.enum(["CPP", "PYTHON", "JAVASCRIPT", "C"]),
});
