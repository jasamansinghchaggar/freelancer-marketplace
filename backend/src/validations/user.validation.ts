import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),
});

export const signUpSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters long",
  }),
  email: z.string().email(),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),
  role: z.enum(["freelancer", "client"], {
    required_error: "Role is required",
    invalid_type_error: "Role must be either 'freelancer' or 'client'",
  }),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(8, "Old password must be at least 8 chars"),
  newPassword: z.string().min(8, "New password must be at least 8 chars"),
});
